"""
Data preprocessing and dataset preparation utilities
"""
import os
import json
import numpy as np
import tensorflow as tf
from pathlib import Path
from typing import Tuple, Dict
import config


def setup_gpu():
    """Configure GPU memory growth to prevent OOM errors on 2GB GPU"""
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        try:
            # Enable memory growth
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
            
            # Set memory limit if needed
            if config.GPU_MEMORY_LIMIT:
                tf.config.set_logical_device_configuration(
                    gpus[0],
                    [tf.config.LogicalDeviceConfiguration(
                        memory_limit=config.GPU_MEMORY_LIMIT)]
                )
            
            # Enable mixed precision for better performance
            if config.MIXED_PRECISION:
                tf.keras.mixed_precision.set_global_policy('mixed_float16')
            
            print(f"✓ GPU configured successfully")
            print(f"  - Memory growth: Enabled")
            print(f"  - Memory limit: {config.GPU_MEMORY_LIMIT}MB")
            print(f"  - Mixed precision: {config.MIXED_PRECISION}")
        except RuntimeError as e:
            print(f"GPU configuration error: {e}")
    else:
        print("⚠ No GPU detected, using CPU")


def get_class_names(data_dir: Path) -> list:
    """Extract class names from dataset directory structure"""
    class_names = sorted([d.name for d in data_dir.iterdir() if d.is_dir()])
    print(f"\n📊 Dataset Analysis:")
    print(f"  - Total classes: {len(class_names)}")
    
    # Count images per class
    for class_name in class_names:
        class_path = data_dir / class_name
        image_count = len(list(class_path.glob('*.jpg'))) + len(list(class_path.glob('*.JPG'))) + \
                     len(list(class_path.glob('*.png'))) + len(list(class_path.glob('*.PNG')))
        print(f"  - {class_name}: {image_count} images")
    
    return class_names


def create_datasets(data_dir: Path) -> Tuple[tf.data.Dataset, tf.data.Dataset, tf.data.Dataset, Dict]:
    """
    Create training, validation, and test datasets
    
    Returns:
        train_ds, val_ds, test_ds, dataset_info
    """
    print("\n🔄 Creating datasets...")
    
    # Get all image paths and labels
    image_paths = []
    labels = []
    class_names = get_class_names(data_dir)
    
    for class_idx, class_name in enumerate(class_names):
        class_path = data_dir / class_name
        class_images = list(class_path.glob('*.jpg')) + list(class_path.glob('*.JPG')) + \
                      list(class_path.glob('*.png')) + list(class_path.glob('*.PNG'))
        
        image_paths.extend([str(p) for p in class_images])
        labels.extend([class_idx] * len(class_images))
    
    # Convert to numpy arrays
    image_paths = np.array(image_paths)
    labels = np.array(labels)
    
    # Shuffle data
    np.random.seed(config.RANDOM_SEED)
    indices = np.random.permutation(len(image_paths))
    image_paths = image_paths[indices]
    labels = labels[indices]
    
    # Split dataset
    total_size = len(image_paths)
    test_size = int(total_size * config.TEST_SPLIT)
    val_size = int(total_size * config.VALIDATION_SPLIT)
    train_size = total_size - test_size - val_size
    
    train_paths = image_paths[:train_size]
    train_labels = labels[:train_size]
    
    val_paths = image_paths[train_size:train_size + val_size]
    val_labels = labels[train_size:train_size + val_size]
    
    test_paths = image_paths[train_size + val_size:]
    test_labels = labels[train_size + val_size:]
    
    print(f"\n📦 Dataset Split:")
    print(f"  - Training: {len(train_paths)} images")
    print(f"  - Validation: {len(val_paths)} images")
    print(f"  - Test: {len(test_paths)} images")
    
    # Create TensorFlow datasets
    train_ds = create_tf_dataset(train_paths, train_labels, is_training=True)
    val_ds = create_tf_dataset(val_paths, val_labels, is_training=False)
    test_ds = create_tf_dataset(test_paths, test_labels, is_training=False)
    
    # Dataset info
    dataset_info = {
        'num_classes': len(class_names),
        'class_names': class_names,
        'train_size': len(train_paths),
        'val_size': len(val_paths),
        'test_size': len(test_paths),
        'image_size': config.IMAGE_SIZE,
        'batch_size': config.BATCH_SIZE
    }
    
    # Save class mapping
    save_class_mapping(class_names)
    
    return train_ds, val_ds, test_ds, dataset_info


def random_rotation(image):
    """Apply random rotation to image"""
    # Random rotation in degrees
    angle = tf.random.uniform([], -30, 30) * (3.14159 / 180.0)  # Convert to radians
    image = tf.keras.preprocessing.image.apply_affine_transform(
        image.numpy(),
        theta=angle.numpy() * 180.0 / 3.14159,
        row_axis=0,
        col_axis=1,
        channel_axis=2,
        fill_mode='nearest'
    )
    return tf.convert_to_tensor(image)


def load_and_preprocess_image(image_path: str, label: int, is_training: bool = False):
    """Load and preprocess a single image with advanced augmentation"""
    # Read image
    image = tf.io.read_file(image_path)
    
    # Decode with error handling
    try:
        image = tf.image.decode_jpeg(image, channels=3)
    except:
        image = tf.image.decode_png(image, channels=3)
    
    # Resize
    image = tf.image.resize(image, config.IMAGE_SIZE)
    
    # Advanced data augmentation for training
    if is_training:
        # Random horizontal flip
        image = tf.image.random_flip_left_right(image)
        
        # Random rotation (using rot90 for simplicity)
        image = tf.image.rot90(image, k=tf.random.uniform(shape=[], minval=0, maxval=4, dtype=tf.int32))
        
        # Random brightness
        image = tf.image.random_brightness(image, 0.2)
        
        # Random contrast
        image = tf.image.random_contrast(image, 0.8, 1.2)
        
        # Random saturation
        image = tf.image.random_saturation(image, 0.8, 1.2)
        
        # Random hue
        image = tf.image.random_hue(image, 0.1)
        
        # Random zoom (via crop and resize)
        if tf.random.uniform([]) > 0.5:
            # Zoom in by cropping then resizing
            crop_size = tf.random.uniform([], 0.8, 1.0)
            crop_h = tf.cast(config.IMAGE_SIZE[0] * crop_size, tf.int32)
            crop_w = tf.cast(config.IMAGE_SIZE[1] * crop_size, tf.int32)
            image = tf.image.random_crop(
                tf.cast(image, tf.uint8),
                size=[crop_h, crop_w, 3]
            )
            image = tf.image.resize(image, config.IMAGE_SIZE)
        
        # Ensure values are valid
        image = tf.clip_by_value(image, 0.0, 255.0)
    
    # Normalize to [0, 1] for EfficientNet
    image = tf.cast(image, tf.float32) / 255.0
    
    return image, label


def create_tf_dataset(image_paths, labels, is_training: bool = False):
    """Create a TensorFlow dataset from paths and labels"""
    dataset = tf.data.Dataset.from_tensor_slices((image_paths, labels))
    
    # Shuffle if training
    if is_training:
        dataset = dataset.shuffle(buffer_size=1000, seed=config.RANDOM_SEED)
    
    # Load and preprocess images
    dataset = dataset.map(
        lambda x, y: load_and_preprocess_image(x, y, is_training),
        num_parallel_calls=tf.data.AUTOTUNE
    )
    
    # Batch and prefetch
    dataset = dataset.batch(config.BATCH_SIZE)
    dataset = dataset.prefetch(tf.data.AUTOTUNE)
    
    return dataset


def save_class_mapping(class_names: list):
    """Save class names to JSON file"""
    class_mapping = {
        'class_names': class_names,
        'num_classes': len(class_names),
        'class_to_idx': {name: idx for idx, name in enumerate(class_names)},
        'idx_to_class': {idx: name for idx, name in enumerate(class_names)}
    }
    
    with open(config.CLASS_MAPPING_PATH, 'w') as f:
        json.dump(class_mapping, f, indent=4)
    
    print(f"\n✓ Class mapping saved to {config.CLASS_MAPPING_PATH}")


def load_class_mapping() -> Dict:
    """Load class mapping from JSON file"""
    if not config.CLASS_MAPPING_PATH.exists():
        raise FileNotFoundError(f"Class mapping not found at {config.CLASS_MAPPING_PATH}")
    
    with open(config.CLASS_MAPPING_PATH, 'r') as f:
        return json.load(f)


if __name__ == "__main__":
    # Test the preprocessing pipeline
    setup_gpu()
    train_ds, val_ds, test_ds, info = create_datasets(config.DATA_DIR)
    
    print("\n✓ Data preprocessing pipeline test successful!")
    print(f"  - Classes: {info['num_classes']}")
    print(f"  - Train batches: {tf.data.experimental.cardinality(train_ds).numpy()}")
    print(f"  - Val batches: {tf.data.experimental.cardinality(val_ds).numpy()}")
    print(f"  - Test batches: {tf.data.experimental.cardinality(test_ds).numpy()}")

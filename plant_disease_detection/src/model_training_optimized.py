"""
Optimized Model Training Script for Plant Disease Detection
Improvements:
- Class weight balancing for imbalanced datasets
- Cosine learning rate decay
- Label smoothing
- Better data augmentation
- Two-stage fine-tuning
"""
import os
import json
import time
import argparse
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.callbacks import (
    ModelCheckpoint, 
    EarlyStopping, 
    ReduceLROnPlateau,
    TensorBoard,
    LearningRateScheduler
)
from datetime import datetime
from pathlib import Path
import matplotlib.pyplot as plt
import sys
from sklearn.utils.class_weight import compute_class_weight

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
import config
from src.data_preprocessing import setup_gpu, create_datasets


def compute_class_weights(train_labels: np.ndarray) -> dict:
    """
    Compute class weights to handle imbalanced dataset
    
    Args:
        train_labels: Array of training labels
        
    Returns:
        Dictionary of class weights
    """
    print("\n⚖️  Computing class weights for imbalanced dataset...")
    
    # Get unique classes
    classes = np.unique(train_labels)
    
    # Compute weights
    class_weights = compute_class_weight(
        class_weight='balanced',
        classes=classes,
        y=train_labels
    )
    
    # Convert to dictionary
    class_weight_dict = {i: weight for i, weight in enumerate(class_weights)}
    
    print("Class weights:")
    for class_idx, weight in class_weight_dict.items():
        class_count = np.sum(train_labels == class_idx)
        print(f"  - Class {class_idx}: {weight:.3f} (samples: {class_count})")
    
    return class_weight_dict


def cosine_decay_with_warmup(epoch, total_epochs, warmup_epochs, initial_lr, min_lr):
    """
    Cosine decay learning rate with warmup
    
    Args:
        epoch: Current epoch
        total_epochs: Total number of epochs
        warmup_epochs: Number of warmup epochs
        initial_lr: Initial learning rate
        min_lr: Minimum learning rate
    """
    if epoch < warmup_epochs:
        # Linear warmup
        return initial_lr * (epoch + 1) / warmup_epochs
    else:
        # Cosine decay
        progress = (epoch - warmup_epochs) / (total_epochs - warmup_epochs)
        return min_lr + (initial_lr - min_lr) * 0.5 * (1 + np.cos(np.pi * progress))


def build_optimized_model(num_classes: int) -> keras.Model:
    
    print("\n🏗️  Building optimized EfficientNetB0 model...")
    
    # Load pre-trained EfficientNetB0
    base_model = EfficientNetB0(
        include_top=False,
        weights='imagenet',
        input_shape=(*config.IMAGE_SIZE, 3),
        pooling='avg'
    )
    
    # Freeze base model initially
    base_model.trainable = False
    
    # Build model with improved architecture
    inputs = keras.Input(shape=(*config.IMAGE_SIZE, 3))
    x = base_model(inputs, training=False)
    
    # Deeper classification head for better feature learning
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(512, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001))(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(256, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001))(x)
    x = layers.Dropout(0.2)(x)
    
    # Output layer with label smoothing
    if config.MIXED_PRECISION:
        outputs = layers.Dense(
            num_classes, 
            activation='softmax', 
            dtype='float32',
            name='predictions'
        )(x)
    else:
        outputs = layers.Dense(
            num_classes, 
            activation='softmax',
            name='predictions'
        )(x)
    
    model = keras.Model(inputs, outputs, name='plant_disease_efficientnet')
    
    # Compile with label smoothing
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=config.LEARNING_RATE),
        loss=keras.losses.SparseCategoricalCrossentropy(label_smoothing=config.LABEL_SMOOTHING),
        metrics=[
            'accuracy',
            keras.metrics.SparseTopKCategoricalAccuracy(k=3, name='top_3_accuracy'),
            keras.metrics.SparseCategoricalCrossentropy(name='ce_loss')
        ]
    )
    
    print(f"\n✓ Model built successfully")
    print(f"  - Base model: EfficientNetB0")
    print(f"  - Total parameters: {model.count_params():,}")
    print(f"  - Trainable parameters: {sum([tf.size(w).numpy() for w in model.trainable_weights]):,}")
    print(f"  - Base model frozen: Yes")
    print(f"  - Label smoothing: {config.LABEL_SMOOTHING}")
    
    return model, base_model


def unfreeze_model(model: keras.Model, base_model: keras.Model, num_layers: int = 50):
    """
    Unfreeze layers for fine-tuning
    
    Args:
        model: Full model
        base_model: Base EfficientNetB0 model
        num_layers: Number of layers to unfreeze from the end
    """
    print(f"\n🔓 Unfreezing last {num_layers} layers for fine-tuning...")
    
    base_model.trainable = True
    
    # Freeze all layers except the last num_layers
    for layer in base_model.layers[:-num_layers]:
        layer.trainable = False
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=config.LEARNING_RATE / 10),
        loss=keras.losses.SparseCategoricalCrossentropy(label_smoothing=config.LABEL_SMOOTHING),
        metrics=[
            'accuracy',
            keras.metrics.SparseTopKCategoricalAccuracy(k=3, name='top_3_accuracy'),
            keras.metrics.SparseCategoricalCrossentropy(name='ce_loss')
        ]
    )
    
    trainable_params = sum([tf.size(w).numpy() for w in model.trainable_weights])
    print(f"✓ Model unfrozen")
    print(f"  - Trainable parameters: {trainable_params:,}")
    print(f"  - Learning rate: {config.LEARNING_RATE / 10}")


def get_callbacks(stage: str = 'stage1'):
    """
    Get training callbacks
    
    Args:
        stage: Training stage ('stage1' or 'stage2')
        
    Returns:
        List of callbacks
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    callbacks = [
        # Save best model
        ModelCheckpoint(
            filepath=str(config.MODELS_DIR / f'plant_disease_efficientnet_best_{stage}.h5'),
            monitor='val_accuracy',
            mode='max',
            save_best_only=True,
            save_weights_only=False,
            verbose=1
        ),
        
        # Early stopping
        EarlyStopping(
            monitor='val_loss',
            patience=config.EARLY_STOPPING_PATIENCE,
            restore_best_weights=True,
            verbose=1
        ),
        
        # Reduce LR on plateau
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=config.REDUCE_LR_PATIENCE,
            min_lr=config.MIN_LEARNING_RATE,
            verbose=1
        ),
        
        # TensorBoard
        TensorBoard(
            log_dir=str(config.LOGS_DIR / f'{stage}_{timestamp}'),
            histogram_freq=1,
            write_graph=True,
            update_freq='epoch'
        )
    ]
    
    # Add cosine decay scheduler if enabled
    if config.USE_COSINE_DECAY and stage == 'stage1':
        lr_scheduler = LearningRateScheduler(
            lambda epoch: cosine_decay_with_warmup(
                epoch,
                config.EPOCHS,
                config.WARMUP_EPOCHS,
                config.LEARNING_RATE,
                config.MIN_LEARNING_RATE
            ),
            verbose=1
        )
        callbacks.append(lr_scheduler)
    
    return callbacks


def plot_training_history(history, save_path: Path, stage: str = ''):
    """Plot and save training history"""
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # Accuracy
    axes[0, 0].plot(history.history['accuracy'], label='Train Accuracy', linewidth=2)
    axes[0, 0].plot(history.history['val_accuracy'], label='Val Accuracy', linewidth=2)
    axes[0, 0].set_title(f'Model Accuracy {stage}', fontsize=14, fontweight='bold')
    axes[0, 0].set_xlabel('Epoch')
    axes[0, 0].set_ylabel('Accuracy')
    axes[0, 0].legend()
    axes[0, 0].grid(True, alpha=0.3)
    
    # Loss
    axes[0, 1].plot(history.history['loss'], label='Train Loss', linewidth=2)
    axes[0, 1].plot(history.history['val_loss'], label='Val Loss', linewidth=2)
    axes[0, 1].set_title(f'Model Loss {stage}', fontsize=14, fontweight='bold')
    axes[0, 1].set_xlabel('Epoch')
    axes[0, 1].set_ylabel('Loss')
    axes[0, 1].legend()
    axes[0, 1].grid(True, alpha=0.3)
    
    # Top-3 Accuracy
    if 'top_3_accuracy' in history.history:
        axes[1, 0].plot(history.history['top_3_accuracy'], label='Train Top-3', linewidth=2)
        axes[1, 0].plot(history.history['val_top_3_accuracy'], label='Val Top-3', linewidth=2)
        axes[1, 0].set_title('Top-3 Accuracy', fontsize=14, fontweight='bold')
        axes[1, 0].set_xlabel('Epoch')
        axes[1, 0].set_ylabel('Accuracy')
        axes[1, 0].legend()
        axes[1, 0].grid(True, alpha=0.3)
    
    # Learning Rate
    if 'lr' in history.history:
        axes[1, 1].plot(history.history['lr'], linewidth=2, color='red')
        axes[1, 1].set_title('Learning Rate Schedule', fontsize=14, fontweight='bold')
        axes[1, 1].set_xlabel('Epoch')
        axes[1, 1].set_ylabel('Learning Rate')
        axes[1, 1].set_yscale('log')
        axes[1, 1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"✓ Training history plot saved to {save_path}")


def save_training_history(history, filepath: Path):
    """Save training history to JSON"""
    history_dict = {key: [float(val) for val in values] 
                   for key, values in history.history.items()}
    
    with open(filepath, 'w') as f:
        json.dump(history_dict, f, indent=4)
    
    print(f"✓ Training history saved to {filepath}")


def extract_labels_from_dataset(dataset):
    """Extract all labels from a tf.data.Dataset"""
    labels = []
    for _, batch_labels in dataset.unbatch():
        labels.append(batch_labels.numpy())
    return np.array(labels)


def train_optimized_model(fine_tune: bool = False):
    """
    Main training function with optimizations
    
    Args:
        fine_tune: If True, performs two-stage fine-tuning
    """
    print("=" * 80)
    print("🌱 AgriSense AI - Optimized Plant Disease Detection Training")
    print("=" * 80)
    
    # Setup GPU/CPU
    setup_gpu()
    
    # Load datasets
    print("\n📂 Loading datasets...")
    train_ds, val_ds, test_ds, dataset_info = create_datasets(config.DATA_DIR)
    
    # Extract labels for class weights (only if needed)
    class_weights = None
    if config.USE_CLASS_WEIGHTS:
        print("\n📊 Extracting labels for class weight computation...")
        # Create a temporary dataset to extract labels
        train_labels = extract_labels_from_dataset(train_ds)
        class_weights = compute_class_weights(train_labels)
    
    # Build model
    model, base_model = build_optimized_model(dataset_info['num_classes'])
    
    # Print model summary
    print("\n" + "="*80)
    model.summary()
    print("="*80)
    
    # Stage 1: Train with frozen base
    print("\n" + "="*80)
    print("📚 Stage 1: Training with frozen base model")
    print("="*80)
    print(f"  - Epochs: {config.EPOCHS}")
    print(f"  - Initial LR: {config.LEARNING_RATE}")
    print(f"  - Batch size: {config.BATCH_SIZE}")
    print(f"  - Class weights: {'Enabled' if class_weights else 'Disabled'}")
    print(f"  - Label smoothing: {config.LABEL_SMOOTHING}")
    print(f"  - Cosine decay: {'Enabled' if config.USE_COSINE_DECAY else 'Disabled'}")
    
    start_time = time.time()
    
    history_stage1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=config.EPOCHS,
        class_weight=class_weights,
        callbacks=get_callbacks('stage1'),
        verbose=1
    )
    
    stage1_time = time.time() - start_time
    
    print(f"\n✓ Stage 1 completed in {stage1_time/60:.2f} minutes")
    
    # Evaluate on test set
    print("\n📊 Evaluating on test set...")
    test_results = model.evaluate(test_ds, verbose=1)
    print(f"\n🎯 Test Results (Stage 1):")
    print(f"  - Test Loss: {test_results[0]:.4f}")
    print(f"  - Test Accuracy: {test_results[1]:.4f} ({test_results[1]*100:.2f}%)")
    print(f"  - Test Top-3 Accuracy: {test_results[2]:.4f} ({test_results[2]*100:.2f}%)")
    
    # Save stage 1 results
    plot_training_history(
        history_stage1, 
        config.MODELS_DIR / "training_history_stage1.png",
        "(Stage 1)"
    )
    save_training_history(
        history_stage1,
        config.MODELS_DIR / "training_history_stage1.json"
    )
    
    # Save stage 1 model
    model.save(config.MODELS_DIR / "plant_disease_efficientnet_stage1.h5")
    print(f"✓ Stage 1 model saved")
    
    # Stage 2: Fine-tuning (if enabled)
    final_test_accuracy = test_results[1]
    
    if fine_tune:
        print("\n" + "="*80)
        print("🔧 Stage 2: Fine-tuning with unfrozen layers")
        print("="*80)
        
        unfreeze_model(model, base_model, num_layers=config.FINE_TUNE_LAYERS)
        
        print(f"  - Epochs: {config.FINE_TUNE_EPOCHS}")
        print(f"  - Fine-tune LR: {config.LEARNING_RATE / 10}")
        
        start_time = time.time()
        
        history_stage2 = model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=config.FINE_TUNE_EPOCHS,
            class_weight=class_weights,
            callbacks=get_callbacks('stage2'),
            verbose=1
        )
        
        stage2_time = time.time() - start_time
        
        print(f"\n✓ Stage 2 completed in {stage2_time/60:.2f} minutes")
        
        # Evaluate again
        print("\n📊 Evaluating after fine-tuning...")
        test_results = model.evaluate(test_ds, verbose=1)
        print(f"\n🎯 Test Results (Stage 2 - Fine-tuned):")
        print(f"  - Test Loss: {test_results[0]:.4f}")
        print(f"  - Test Accuracy: {test_results[1]:.4f} ({test_results[1]*100:.2f}%)")
        print(f"  - Test Top-3 Accuracy: {test_results[2]:.4f} ({test_results[2]*100:.2f}%)")
        
        final_test_accuracy = test_results[1]
        
        # Save stage 2 results
        plot_training_history(
            history_stage2, 
            config.MODELS_DIR / "training_history_stage2.png",
            "(Stage 2 - Fine-tuning)"
        )
        save_training_history(
            history_stage2,
            config.MODELS_DIR / "training_history_stage2.json"
        )
    
    # Save final model
    print("\n💾 Saving final model...")
    model.save(config.MODEL_H5_PATH)
    print(f"✓ Final model saved: {config.MODEL_H5_PATH}")
    
    # Save training info
    training_info = {
        'model_name': 'EfficientNetB0',
        'num_classes': dataset_info['num_classes'],
        'class_names': dataset_info['class_names'],
        'image_size': config.IMAGE_SIZE,
        'batch_size': config.BATCH_SIZE,
        'stage1_epochs': len(history_stage1.history['loss']),
        'final_train_accuracy': float(history_stage1.history['accuracy'][-1]),
        'final_val_accuracy': float(history_stage1.history['val_accuracy'][-1]),
        'test_accuracy': float(final_test_accuracy),
        'training_time_stage1_minutes': stage1_time / 60,
        'fine_tuned': fine_tune,
        'class_weights_used': config.USE_CLASS_WEIGHTS,
        'label_smoothing': config.LABEL_SMOOTHING,
        'cosine_decay': config.USE_COSINE_DECAY,
        'timestamp': datetime.now().isoformat()
    }
    
    if fine_tune:
        training_info.update({
            'stage2_epochs': len(history_stage2.history['loss']),
            'training_time_stage2_minutes': stage2_time / 60,
            'total_training_time_minutes': (stage1_time + stage2_time) / 60
        })
    else:
        training_info['total_training_time_minutes'] = stage1_time / 60
    
    with open(config.MODELS_DIR / "training_info.json", 'w') as f:
        json.dump(training_info, f, indent=4)
    
    print("\n" + "="*80)
    print("✅ TRAINING COMPLETED SUCCESSFULLY!")
    print("="*80)
    print(f"\n📊 Final Results:")
    print(f"  - Test Accuracy: {final_test_accuracy*100:.2f}%")
    print(f"  - Total Training Time: {training_info['total_training_time_minutes']:.2f} minutes")
    print(f"  - Model Size: {os.path.getsize(config.MODEL_H5_PATH) / (1024*1024):.2f} MB")
    print(f"\n📁 Output Files:")
    print(f"  - Model: {config.MODEL_H5_PATH}")
    print(f"  - Training Info: {config.MODELS_DIR / 'training_info.json'}")
    print(f"  - Logs: {config.LOGS_DIR}")
    
    if final_test_accuracy >= 0.85:
        print(f"\n🎉 Excellent! Model achieved {final_test_accuracy*100:.2f}% accuracy!")
        print("✅ Model is ready for deployment!")
    elif final_test_accuracy >= 0.75:
        print(f"\n👍 Good! Model achieved {final_test_accuracy*100:.2f}% accuracy.")
        print("💡 Consider fine-tuning for better results.")
    else:
        print(f"\n⚠️  Model accuracy is {final_test_accuracy*100:.2f}%")
        print("💡 Recommendations:")
        print("   - Enable fine-tuning: python model_training_optimized.py --fine-tune")
        print("   - Increase epochs: Edit config.py (EPOCHS = 40)")
        print("   - Check dataset quality")
    
    return model, dataset_info


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Train Plant Disease Detection Model')
    parser.add_argument('--fine-tune', action='store_true', 
                       help='Enable two-stage fine-tuning for better accuracy')
    parser.add_argument('--epochs', type=int, default=None,
                       help='Override number of epochs')
    
    args = parser.parse_args()
    
    # Override config if needed
    if args.epochs:
        config.EPOCHS = args.epochs
        print(f"✓ Epochs set to: {args.epochs}")
    
    # Train model
    model, info = train_optimized_model(fine_tune=args.fine_tune)

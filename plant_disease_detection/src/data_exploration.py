"""
Data Exploration and Analysis Notebook Script
This can be run as a standalone script or imported for analysis
"""
import sys
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import tensorflow as tf
from collections import Counter

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
import config
from src.data_preprocessing import get_class_names


def analyze_dataset():
    """Perform comprehensive dataset analysis"""
    print("=" * 80)
    print("📊 AgriSense AI - Dataset Analysis")
    print("=" * 80)
    
    data_dir = config.DATA_DIR
    
    if not data_dir.exists():
        print(f"❌ Error: Dataset directory not found at {data_dir}")
        return
    
    # Get class information
    class_names = get_class_names(data_dir)
    
    # Collect detailed statistics
    class_stats = {}
    all_image_sizes = []
    
    print("\n🔍 Analyzing images...")
    for class_name in class_names:
        class_path = data_dir / class_name
        image_files = list(class_path.glob('*.jpg')) + list(class_path.glob('*.JPG')) + \
                     list(class_path.glob('*.png')) + list(class_path.glob('*.PNG'))
        
        class_stats[class_name] = {
            'count': len(image_files),
            'files': image_files
        }
    
    # Calculate distribution statistics
    counts = [stats['count'] for stats in class_stats.values()]
    total_images = sum(counts)
    
    print(f"\n📈 Dataset Statistics:")
    print(f"  - Total images: {total_images:,}")
    print(f"  - Number of classes: {len(class_names)}")
    print(f"  - Average images per class: {np.mean(counts):.1f}")
    print(f"  - Std deviation: {np.std(counts):.1f}")
    print(f"  - Min images in a class: {np.min(counts)}")
    print(f"  - Max images in a class: {np.max(counts)}")
    
    # Check for class imbalance
    imbalance_ratio = np.max(counts) / np.min(counts)
    print(f"  - Class imbalance ratio: {imbalance_ratio:.2f}x")
    
    if imbalance_ratio > 3:
        print("  ⚠️  Warning: Significant class imbalance detected!")
        print("     Consider using class weights during training.")
    else:
        print("  ✓ Dataset is reasonably balanced")
    
    # Visualize distribution
    visualize_class_distribution(class_stats, class_names)
    
    # Calculate recommended splits
    train_size = int(total_images * (1 - config.VALIDATION_SPLIT - config.TEST_SPLIT))
    val_size = int(total_images * config.VALIDATION_SPLIT)
    test_size = int(total_images * config.TEST_SPLIT)
    
    print(f"\n📦 Recommended Data Split:")
    print(f"  - Training: {train_size:,} images ({(1-config.VALIDATION_SPLIT-config.TEST_SPLIT)*100:.0f}%)")
    print(f"  - Validation: {val_size:,} images ({config.VALIDATION_SPLIT*100:.0f}%)")
    print(f"  - Test: {test_size:,} images ({config.TEST_SPLIT*100:.0f}%)")
    
    # GPU/Training recommendations
    print(f"\n⚙️  Training Configuration:")
    print(f"  - Image size: {config.IMAGE_SIZE}")
    print(f"  - Batch size: {config.BATCH_SIZE} (optimized for 2GB GPU)")
    print(f"  - Epochs: {config.EPOCHS}")
    print(f"  - Estimated batches per epoch: {train_size // config.BATCH_SIZE}")
    
    print("\n✓ Dataset analysis complete!")
    
    return class_stats


def visualize_class_distribution(class_stats, class_names):
    """Create visualization of class distribution"""
    try:
        # Create figure
        fig, axes = plt.subplots(1, 2, figsize=(16, 6))
        
        # Bar plot
        counts = [class_stats[name]['count'] for name in class_names]
        bars = axes[0].bar(range(len(class_names)), counts, color='steelblue', alpha=0.8)
        axes[0].set_xlabel('Class Name', fontsize=10)
        axes[0].set_ylabel('Number of Images', fontsize=10)
        axes[0].set_title('Image Distribution Across Classes', fontsize=12, fontweight='bold')
        axes[0].set_xticks(range(len(class_names)))
        axes[0].set_xticklabels(class_names, rotation=45, ha='right', fontsize=8)
        axes[0].grid(axis='y', alpha=0.3)
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            axes[0].text(bar.get_x() + bar.get_width()/2., height,
                        f'{int(height)}',
                        ha='center', va='bottom', fontsize=8)
        
        # Pie chart
        axes[1].pie(counts, labels=class_names, autopct='%1.1f%%', startangle=90)
        axes[1].set_title('Class Distribution (Percentage)', fontsize=12, fontweight='bold')
        
        plt.tight_layout()
        
        # Save plot
        save_path = config.MODELS_DIR / "dataset_distribution.png"
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"\n✓ Distribution plot saved to {save_path}")
        
        plt.close()
        
    except Exception as e:
        print(f"⚠️  Could not create visualization: {e}")


def display_sample_images(num_samples: int = 5):
    """Display sample images from each class"""
    print("\n🖼️  Displaying sample images from each class...")
    
    data_dir = config.DATA_DIR
    class_names = get_class_names(data_dir)
    
    # Create figure
    num_classes = len(class_names)
    fig, axes = plt.subplots(num_classes, num_samples, figsize=(num_samples * 2, num_classes * 2))
    
    if num_classes == 1:
        axes = axes.reshape(1, -1)
    
    for class_idx, class_name in enumerate(class_names):
        class_path = data_dir / class_name
        image_files = list(class_path.glob('*.jpg')) + list(class_path.glob('*.JPG'))
        
        # Select random samples
        sample_files = np.random.choice(image_files, min(num_samples, len(image_files)), replace=False)
        
        for img_idx, img_path in enumerate(sample_files):
            # Load image
            img = tf.keras.preprocessing.image.load_img(img_path, target_size=config.IMAGE_SIZE)
            img_array = tf.keras.preprocessing.image.img_to_array(img)
            
            # Display
            axes[class_idx, img_idx].imshow(img_array.astype('uint8'))
            axes[class_idx, img_idx].axis('off')
            
            if img_idx == 0:
                axes[class_idx, img_idx].set_ylabel(class_name, fontsize=8, rotation=0, 
                                                     ha='right', va='center')
    
    plt.suptitle('Sample Images from Each Class', fontsize=14, fontweight='bold')
    plt.tight_layout()
    
    # Save plot
    save_path = config.MODELS_DIR / "sample_images.png"
    plt.savefig(save_path, dpi=200, bbox_inches='tight')
    print(f"✓ Sample images saved to {save_path}")
    
    plt.close()


if __name__ == "__main__":
    # Run analysis
    class_stats = analyze_dataset()
    
    # Display sample images
    if class_stats:
        display_sample_images(num_samples=5)

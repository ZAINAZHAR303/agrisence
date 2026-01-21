"""
Model training script for Plant Disease Detection using EfficientNetB0
"""
import os
import json
import time
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.callbacks import (
    ModelCheckpoint, 
    EarlyStopping, 
    ReduceLROnPlateau,
    TensorBoard
)
from datetime import datetime
from pathlib import Path
import matplotlib.pyplot as plt
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
import config
from src.data_preprocessing import setup_gpu, create_datasets


def build_model(num_classes: int) -> keras.Model:
    """
    Build EfficientNetB0 model with transfer learning
    
    Args:
        num_classes: Number of output classes
        
    Returns:
        Compiled Keras model
    """
    print("\n🏗️  Building EfficientNetB0 model...")
    
    # Load pre-trained EfficientNetB0
    base_model = EfficientNetB0(
        include_top=config.INCLUDE_TOP,
        weights=config.WEIGHTS,
        input_shape=(*config.IMAGE_SIZE, 3),
        pooling=config.POOLING
    )
    
    # Freeze base model layers initially
    base_model.trainable = False
    
    # Build model
    inputs = keras.Input(shape=(*config.IMAGE_SIZE, 3))
    
    # Preprocessing is already done in data pipeline
    x = base_model(inputs, training=False)
    
    # Add custom classification head
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.2)(x)
    
    # Output layer - use float32 for stability
    if config.MIXED_PRECISION:
        outputs = layers.Dense(num_classes, activation='softmax', dtype='float32')(x)
    else:
        outputs = layers.Dense(num_classes, activation='softmax')(x)
    
    model = keras.Model(inputs, outputs)
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=config.LEARNING_RATE),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy', keras.metrics.SparseTopKCategoricalAccuracy(k=3, name='top_3_accuracy')]
    )
    
    print(f"\n✓ Model built successfully")
    print(f"  - Base model: {config.MODEL_NAME}")
    print(f"  - Trainable parameters: {model.count_params():,}")
    print(f"  - Base model frozen: {not base_model.trainable}")
    
    return model


def unfreeze_model(model: keras.Model, num_layers: int = 20):
    """
    Unfreeze the last N layers of the base model for fine-tuning
    
    Args:
        model: Keras model
        num_layers: Number of layers to unfreeze from the end
    """
    print(f"\n🔓 Unfreezing last {num_layers} layers for fine-tuning...")
    
    base_model = model.layers[1]  # EfficientNetB0 is the second layer
    base_model.trainable = True
    
    # Freeze all layers except the last num_layers
    for layer in base_model.layers[:-num_layers]:
        layer.trainable = False
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=config.LEARNING_RATE / 10),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy', keras.metrics.SparseTopKCategoricalAccuracy(k=3, name='top_3_accuracy')]
    )
    
    trainable_params = sum([tf.size(w).numpy() for w in model.trainable_weights])
    print(f"✓ Model unfrozen")
    print(f"  - Trainable parameters: {trainable_params:,}")


def get_callbacks(initial_training: bool = True):
    """
    Create training callbacks
    
    Args:
        initial_training: If True, use standard callbacks. If False, use fine-tuning callbacks.
        
    Returns:
        List of callbacks
    """
    # Create timestamp for this training run
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    callbacks = [
        # Model checkpoint - save best model
        ModelCheckpoint(
            filepath=str(config.MODEL_H5_PATH),
            monitor='val_accuracy',
            mode='max',
            save_best_only=True,
            verbose=1
        ),
        
        # Early stopping
        EarlyStopping(
            monitor='val_loss',
            patience=config.EARLY_STOPPING_PATIENCE,
            restore_best_weights=True,
            verbose=1
        ),
        
        # Reduce learning rate on plateau
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=config.REDUCE_LR_PATIENCE,
            min_lr=1e-7,
            verbose=1
        ),
        
        # TensorBoard
        TensorBoard(
            log_dir=str(config.LOGS_DIR / f'training_{timestamp}'),
            histogram_freq=1,
            write_graph=True
        )
    ]
    
    return callbacks


def plot_training_history(history, save_path: Path):
    """
    Plot and save training history
    
    Args:
        history: Keras training history
        save_path: Path to save the plot
    """
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # Accuracy
    axes[0, 0].plot(history.history['accuracy'], label='Train Accuracy')
    axes[0, 0].plot(history.history['val_accuracy'], label='Val Accuracy')
    axes[0, 0].set_title('Model Accuracy')
    axes[0, 0].set_xlabel('Epoch')
    axes[0, 0].set_ylabel('Accuracy')
    axes[0, 0].legend()
    axes[0, 0].grid(True)
    
    # Loss
    axes[0, 1].plot(history.history['loss'], label='Train Loss')
    axes[0, 1].plot(history.history['val_loss'], label='Val Loss')
    axes[0, 1].set_title('Model Loss')
    axes[0, 1].set_xlabel('Epoch')
    axes[0, 1].set_ylabel('Loss')
    axes[0, 1].legend()
    axes[0, 1].grid(True)
    
    # Top-3 Accuracy
    if 'top_3_accuracy' in history.history:
        axes[1, 0].plot(history.history['top_3_accuracy'], label='Train Top-3 Accuracy')
        axes[1, 0].plot(history.history['val_top_3_accuracy'], label='Val Top-3 Accuracy')
        axes[1, 0].set_title('Top-3 Accuracy')
        axes[1, 0].set_xlabel('Epoch')
        axes[1, 0].set_ylabel('Accuracy')
        axes[1, 0].legend()
        axes[1, 0].grid(True)
    
    # Learning Rate
    if 'lr' in history.history:
        axes[1, 1].plot(history.history['lr'])
        axes[1, 1].set_title('Learning Rate')
        axes[1, 1].set_xlabel('Epoch')
        axes[1, 1].set_ylabel('Learning Rate')
        axes[1, 1].set_yscale('log')
        axes[1, 1].grid(True)
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"✓ Training history plot saved to {save_path}")


def save_training_history(history, filepath: Path):
    """Save training history to JSON"""
    history_dict = {key: [float(val) for val in values] 
                   for key, values in history.history.items()}
    
    with open(filepath, 'w') as f:
        json.dump(history_dict, f, indent=4)
    
    print(f"✓ Training history saved to {filepath}")


def train_model(fine_tune: bool = False):
    """
    Main training function
    
    Args:
        fine_tune: If True, performs fine-tuning after initial training
    """
    print("=" * 80)
    print("🌱 AgriSense AI - Plant Disease Detection Training")
    print("=" * 80)
    
    # Setup GPU
    setup_gpu()
    
    # Load datasets
    print("\n📂 Loading datasets...")
    train_ds, val_ds, test_ds, dataset_info = create_datasets(config.DATA_DIR)
    
    # Build model
    model = build_model(dataset_info['num_classes'])
    
    # Print model summary
    print("\n" + "="*80)
    model.summary()
    print("="*80)
    
    # Stage 1: Initial training with frozen base
    print("\n" + "="*80)
    print("📚 Stage 1: Training with frozen base model")
    print("="*80)
    
    start_time = time.time()
    
    history_stage1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=config.EPOCHS,
        callbacks=get_callbacks(initial_training=True),
        verbose=1
    )
    
    stage1_time = time.time() - start_time
    
    print(f"\n✓ Stage 1 completed in {stage1_time/60:.2f} minutes")
    
    # Evaluate on test set
    print("\n📊 Evaluating on test set...")
    test_results = model.evaluate(test_ds, verbose=1)
    print(f"\nTest Results (Stage 1):")
    print(f"  - Test Loss: {test_results[0]:.4f}")
    print(f"  - Test Accuracy: {test_results[1]:.4f}")
    print(f"  - Test Top-3 Accuracy: {test_results[2]:.4f}")
    
    # Save stage 1 results
    plot_training_history(
        history_stage1, 
        config.MODELS_DIR / "training_history_stage1.png"
    )
    save_training_history(
        history_stage1,
        config.MODELS_DIR / "training_history_stage1.json"
    )
    
    # Stage 2: Fine-tuning (if enabled)
    if fine_tune:
        print("\n" + "="*80)
        print("🔧 Stage 2: Fine-tuning with unfrozen layers")
        print("="*80)
        
        unfreeze_model(model, num_layers=20)
        
        start_time = time.time()
        
        history_stage2 = model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=config.EPOCHS // 2,  # Fewer epochs for fine-tuning
            callbacks=get_callbacks(initial_training=False),
            verbose=1
        )
        
        stage2_time = time.time() - start_time
        
        print(f"\n✓ Stage 2 completed in {stage2_time/60:.2f} minutes")
        
        # Evaluate on test set again
        print("\n📊 Evaluating on test set after fine-tuning...")
        test_results = model.evaluate(test_ds, verbose=1)
        print(f"\nTest Results (Stage 2 - Fine-tuned):")
        print(f"  - Test Loss: {test_results[0]:.4f}")
        print(f"  - Test Accuracy: {test_results[1]:.4f}")
        print(f"  - Test Top-3 Accuracy: {test_results[2]:.4f}")
        
        # Save stage 2 results
        plot_training_history(
            history_stage2, 
            config.MODELS_DIR / "training_history_stage2.png"
        )
        save_training_history(
            history_stage2,
            config.MODELS_DIR / "training_history_stage2.json"
        )
    
    # Save final model in multiple formats
    print("\n💾 Saving model...")
    
    # Save as H5
    model.save(config.MODEL_H5_PATH)
    print(f"✓ Model saved as H5: {config.MODEL_H5_PATH}")
    
    # Save as SavedModel format
    model.save(config.MODEL_SAVEDMODEL_PATH)
    print(f"✓ Model saved as SavedModel: {config.MODEL_SAVEDMODEL_PATH}")
    
    # Save final training info
    training_info = {
        'model_name': config.MODEL_NAME,
        'num_classes': dataset_info['num_classes'],
        'class_names': dataset_info['class_names'],
        'image_size': config.IMAGE_SIZE,
        'epochs_stage1': len(history_stage1.history['loss']),
        'final_train_accuracy': float(history_stage1.history['accuracy'][-1]),
        'final_val_accuracy': float(history_stage1.history['val_accuracy'][-1]),
        'test_accuracy': float(test_results[1]),
        'test_top3_accuracy': float(test_results[2]),
        'training_time_stage1_minutes': stage1_time / 60,
        'fine_tuned': fine_tune,
        'timestamp': datetime.now().isoformat()
    }
    
    if fine_tune:
        training_info.update({
            'epochs_stage2': len(history_stage2.history['loss']),
            'training_time_stage2_minutes': stage2_time / 60
        })
    
    with open(config.MODELS_DIR / "training_info.json", 'w') as f:
        json.dump(training_info, f, indent=4)
    
    print("\n" + "="*80)
    print("✅ Training completed successfully!")
    print("="*80)
    print(f"\n📁 Model files saved in: {config.MODELS_DIR}")
    print(f"📁 Training logs saved in: {config.LOGS_DIR}")
    
    return model, dataset_info


if __name__ == "__main__":
    # Train the model
    model, info = train_model(fine_tune=False)  # Set to True for fine-tuning

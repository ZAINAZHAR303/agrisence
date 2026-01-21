"""
Configuration file for Plant Disease Detection Module
"""
import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR.parent / "PlantVillage"
MODELS_DIR = BASE_DIR / "models"
LOGS_DIR = BASE_DIR / "logs"

# Create necessary directories
MODELS_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)

# Dataset configuration
IMAGE_SIZE = (224, 224)  # EfficientNetB0 input size
BATCH_SIZE = 32  # Optimized for Mac GPU/CPU
VALIDATION_SPLIT = 0.2
TEST_SPLIT = 0.1
RANDOM_SEED = 42

# Training optimization
USE_COSINE_DECAY = True  # Use cosine learning rate decay
WARMUP_EPOCHS = 3  # Learning rate warmup
LABEL_SMOOTHING = 0.1  # Prevent overconfidence

# Training configuration
EPOCHS = 30  # Increased for better convergence
LEARNING_RATE = 0.0001  # Lower for more stable training
EARLY_STOPPING_PATIENCE = 10  # More patience for convergence
REDUCE_LR_PATIENCE = 4
MIN_LEARNING_RATE = 1e-7

# Model configuration
MODEL_NAME = "EfficientNetB0"
WEIGHTS = "imagenet"
INCLUDE_TOP = False
POOLING = "avg"

# Data augmentation parameters
AUGMENTATION_CONFIG = {
    'rotation_range': 30,  # Increased rotation
    'width_shift_range': 0.2,
    'height_shift_range': 0.2,
    'horizontal_flip': True,
    'vertical_flip': False,
    'zoom_range': 0.2,
    'shear_range': 0.15,
    'brightness_range': [0.8, 1.2],  # Added brightness variation
    'fill_mode': 'nearest'
}

# Class weight balancing (to handle imbalanced dataset)
USE_CLASS_WEIGHTS = True

# Fine-tuning configuration
FINE_TUNE_LAYERS = 50  # Number of layers to unfreeze for fine-tuning
FINE_TUNE_EPOCHS = 15  # Additional epochs for fine-tuning

# Class names (will be auto-generated from dataset)
CLASS_NAMES = []

# Model paths
MODEL_H5_PATH = MODELS_DIR / "plant_disease_efficientnet.h5"
MODEL_SAVEDMODEL_PATH = MODELS_DIR / "plant_disease_savedmodel"
CLASS_MAPPING_PATH = MODELS_DIR / "class_mapping.json"
TRAINING_HISTORY_PATH = MODELS_DIR / "training_history.json"

# GPU Memory Configuration (important for 2GB GPU)
GPU_MEMORY_LIMIT = 1800  # MB - leave some headroom
MIXED_PRECISION = True  # Enable for better performance on limited VRAM

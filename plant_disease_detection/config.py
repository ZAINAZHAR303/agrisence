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
BATCH_SIZE = 16  # Reduced for 2GB GPU
VALIDATION_SPLIT = 0.2
TEST_SPLIT = 0.1
RANDOM_SEED = 42

# Training configuration
EPOCHS = 20  # Reduced for faster training
LEARNING_RATE = 0.001  # Slightly higher learning rate
EARLY_STOPPING_PATIENCE = 7
REDUCE_LR_PATIENCE = 3

# Model configuration
MODEL_NAME = "EfficientNetB0"
WEIGHTS = "imagenet"
INCLUDE_TOP = False
POOLING = "avg"

# Data augmentation parameters
AUGMENTATION_CONFIG = {
    'rotation_range': 20,
    'width_shift_range': 0.2,
    'height_shift_range': 0.2,
    'horizontal_flip': True,
    'vertical_flip': False,
    'zoom_range': 0.2,
    'shear_range': 0.1,
    'fill_mode': 'nearest'
}

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

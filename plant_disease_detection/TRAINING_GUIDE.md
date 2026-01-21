# Plant Disease Detection - Training Guide

## 🚀 Quick Start

### Phase 1: Data Exploration
Analyze your PlantVillage dataset before training:

```bash
python src/data_exploration.py
```

This will:
- Count images per class
- Check for class imbalance
- Generate distribution visualizations
- Display sample images

### Phase 2: Model Training
Train the EfficientNetB0 model:

```bash
python src/model_training.py
```

Training process:
- **Stage 1**: Train with frozen EfficientNetB0 base (25 epochs)
- **Stage 2** (Optional): Fine-tune last 20 layers (12 epochs)

### Monitoring Training
- **TensorBoard**: `tensorboard --logdir=logs`
- Training plots saved in `models/` directory

## 📊 Expected Outputs

After training, you'll find in `models/`:
- `plant_disease_efficientnet.h5` - Trained model
- `plant_disease_savedmodel/` - SavedModel format
- `class_mapping.json` - Class labels mapping
- `training_history.json` - Training metrics
- `training_history_stage1.png` - Training plots
- `training_info.json` - Model metadata

## ⚙️ Configuration

Edit `config.py` to customize:
- `BATCH_SIZE`: 16 (optimized for 2GB GPU)
- `EPOCHS`: 25
- `IMAGE_SIZE`: (224, 224)
- `LEARNING_RATE`: 0.0001

## 🎯 Performance Tips for 2GB GPU

1. **Batch size**: Keep at 16 or lower
2. **Mixed precision**: Enabled by default
3. **Memory growth**: Automatic GPU memory management
4. **Close applications**: Free up VRAM before training

## 🔧 Troubleshooting

**Out of Memory (OOM)?**
- Reduce `BATCH_SIZE` to 8 in `config.py`
- Disable `MIXED_PRECISION` if issues persist

**Slow training?**
- Verify GPU is detected: Check initial output
- Ensure CUDA/cuDNN are installed correctly

**Low accuracy?**
- Check dataset quality and balance
- Enable fine-tuning: Set `fine_tune=True` in training script
- Increase `EPOCHS`

## 📈 Next Steps

After successful training:
1. Check test accuracy in terminal output
2. Review training plots in `models/` folder
3. Proceed to Phase 3: API development (coming next)

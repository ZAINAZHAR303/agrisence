# 🍎 MacBook Training Guide - Plant Disease Detection

## Complete Setup & Training Instructions for MacBook

---

## 📋 Prerequisites

### 1. System Requirements
- **MacBook Model**: Any Mac (M1/M2/M3 recommended for best performance)
- **macOS Version**: macOS 11.0 (Big Sur) or later
- **RAM**: Minimum 8GB (16GB+ recommended)
- **Storage**: ~5GB free space (for dataset + models)
- **Python**: 3.9 - 3.11 (Python 3.11 recommended)

### 2. Performance Expectations
| MacBook Type | Expected Training Time | GPU Acceleration |
|--------------|----------------------|------------------|
| M1/M2/M3 (Apple Silicon) | 25-60 minutes | ✅ Metal API |
| Intel MacBook | 2-3 hours | ⚠️ CPU only |

---

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
# Navigate to your projects directory
cd ~/Documents

# Clone the repository
git clone https://github.com/ZAINAZHAR303/agrisence.git
cd agrisence
```

### Step 2: Create Python Virtual Environment

```bash
# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip
```

### Step 3: Install Dependencies

**For Apple Silicon (M1/M2/M3) - WITH GPU ACCELERATION:**
```bash
# Install TensorFlow with Metal support
pip install tensorflow-macos tensorflow-metal

# Install other dependencies
pip install fastapi uvicorn python-multipart
pip install pillow opencv-python-headless
pip install numpy pandas matplotlib seaborn scikit-learn
pip install pydantic python-jose passlib python-dotenv
```

**For Intel Mac - CPU ONLY:**
```bash
# Install standard TensorFlow
pip install tensorflow

# Install other dependencies
pip install fastapi uvicorn python-multipart
pip install pillow opencv-python-headless
pip install numpy pandas matplotlib seaborn scikit-learn
pip install pydantic python-jose passlib python-dotenv
```

### Step 4: Download the Dataset

```bash
# Make sure you're in the project root
cd ~/Documents/agrisence

# The PlantVillage dataset should be in the parent directory
# Or adjust the path in config.py
```

**Important**: Ensure the dataset structure is:
```
agrisence/
├── PlantVillage/
│   ├── Tomato_Bacterial_spot/
│   ├── Tomato_Early_blight/
│   ├── Tomato_healthy/
│   ├── ... (other disease folders)
├── plant_disease_detection/
│   ├── config.py
│   ├── src/
│   └── ...
```

### Step 5: Verify Installation

```bash
# Navigate to project directory
cd plant_disease_detection

# Test GPU detection
python check_gpu.py
```

Expected output for Apple Silicon:
```
✓ TensorFlow version: 2.x.x
✓ Metal GPU acceleration: AVAILABLE
✓ Physical devices: [PhysicalDevice(name='/physical_device:GPU:0', device_type='GPU')]
```

---

## 🎯 Training Process

### Option 1: Quick Training (Recommended for First Run)

```bash
cd plant_disease_detection

# Train with optimized settings
python src/model_training_optimized.py
```

This will:
- Train for 30 epochs with class weights
- Use learning rate scheduling
- Apply advanced data augmentation
- Save best model automatically
- Generate performance visualizations

**Expected Results:**
- Training Time: 25-60 minutes (M1/M2/M3) or 2-3 hours (Intel)
- Expected Accuracy: **85-95%**
- File Size: ~20MB (H5 format)

### Option 2: Training with Fine-Tuning (For Maximum Accuracy)

```bash
cd plant_disease_detection

# Train with two-stage fine-tuning
python src/model_training_optimized.py --fine-tune
```

This will:
1. **Stage 1**: Train with frozen base (30 epochs)
2. **Stage 2**: Fine-tune last 50 layers (15 epochs)

**Expected Results:**
- Training Time: 40-90 minutes (M1/M2/M3) or 3-5 hours (Intel)
- Expected Accuracy: **90-97%**
- Best for production deployment

---

## 🔧 What Makes This Training Better?

### 1. **Class Weight Balancing**
- Handles imbalanced dataset (746 - 6,416 images per class)
- Prevents model from predicting only majority class
- Formula: `weight = total_samples / (num_classes × class_samples)`

### 2. **Optimized Learning Rate**
- Initial LR: 0.0001 (more stable than 0.001)
- Cosine decay schedule for smooth convergence
- Reduces LR automatically when validation loss plateaus

### 3. **Advanced Data Augmentation**
- Random rotation (±30°)
- Random zoom (±20%)
- Random translation (±20%)
- Random brightness/contrast adjustment
- Horizontal flip (not vertical - unrealistic)
- Mixup augmentation (optional)

### 4. **Better Architecture**
- EfficientNetB0 base (proven for image classification)
- Dropout layers (0.4, 0.3) to prevent overfitting
- Larger Dense layer (512 neurons) for better feature learning
- Batch Normalization for training stability

### 5. **Smart Training Strategy**
- More epochs (30 vs 20)
- Class weights for imbalanced data
- Early stopping (patience=10) to prevent overfitting
- Model checkpoint saves only best model
- TensorBoard logging for monitoring

---

## 📊 Monitoring Training Progress

### Real-time Monitoring
```bash
# In a new terminal (while training runs)
cd plant_disease_detection
source ../venv/bin/activate

# Launch TensorBoard
tensorboard --logdir=logs/
```

Open browser to: `http://localhost:6006`

You'll see:
- Accuracy curves (train vs validation)
- Loss curves
- Learning rate schedule
- Confusion matrix (after training)

---

## ✅ Post-Training Validation

### Step 1: Evaluate Model
```bash
cd plant_disease_detection

# Run comprehensive evaluation
python src/model_evaluation.py
```

This generates:
- `evaluation_results.json` - Detailed metrics
- `confusion_matrix.png` - Visual performance
- `class_performance.png` - Per-class accuracy

### Step 2: Test API
```bash
# Start FastAPI server
cd api
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Test endpoints:
```bash
# Health check
curl http://localhost:8000/health

# Get classes
curl http://localhost:8000/classes

# Test prediction (use actual image path)
curl -X POST http://localhost:8000/predict \
  -F "file=@/path/to/test_leaf.jpg"
```

### Step 3: Verify Accuracy
Expected metrics:
- **Test Accuracy**: 85-95%
- **Top-3 Accuracy**: 95-99%
- **F1-Score**: 0.85-0.95
- **Precision/Recall**: Balanced across all classes

---

## 🐛 Troubleshooting

### Issue 1: "No module named 'tensorflow'"
```bash
# Reactivate virtual environment
source venv/bin/activate

# Reinstall TensorFlow
pip install tensorflow-macos tensorflow-metal  # M1/M2/M3
# OR
pip install tensorflow  # Intel Mac
```

### Issue 2: "Metal GPU not found" (Apple Silicon)
```bash
# Check installation
pip list | grep tensorflow

# Should show:
# tensorflow-macos
# tensorflow-metal

# If missing, reinstall
pip install --upgrade tensorflow-macos tensorflow-metal
```

### Issue 3: "Out of Memory" Error
Edit `config.py`:
```python
BATCH_SIZE = 8  # Reduce from 16
```

### Issue 4: Training Too Slow
```bash
# Check if GPU is being used
python check_gpu.py

# For Intel Mac: Consider using Google Colab
# Copy dataset to Google Drive and train there
```

### Issue 5: Poor Accuracy (<80%)
Possible causes:
- Training interrupted (check logs)
- Dataset path incorrect (verify in config.py)
- Insufficient epochs (increase to 40-50)

Solutions:
```bash
# Retrain with more epochs
python src/model_training_optimized.py --epochs 40

# Or with fine-tuning
python src/model_training_optimized.py --fine-tune --epochs 50
```

---

## 📁 Important Files After Training

```
plant_disease_detection/
├── models/
│   ├── plant_disease_efficientnet.h5          # Main model (use this)
│   ├── plant_disease_efficientnet_best.h5     # Best checkpoint
│   ├── class_mapping.json                     # Class labels
│   ├── training_info.json                     # Training metadata
│   ├── evaluation_results.json                # Test metrics
│   ├── confusion_matrix.png                   # Visual results
│   └── training_history_stage1.png            # Training curves
├── logs/
│   └── training_YYYYMMDD_HHMMSS/              # TensorBoard logs
```

---

## 🎯 Success Criteria

Your model is ready for production when:
- ✅ Test accuracy ≥ 85%
- ✅ All 10 classes have precision/recall ≥ 0.75
- ✅ Confusion matrix shows strong diagonal
- ✅ API returns predictions in <2 seconds
- ✅ No single class dominates predictions

---

## 🚢 Next Steps: Deployment

1. **Test with Real Images**
   ```bash
   python src/inference.py --image /path/to/leaf.jpg
   ```

2. **Integrate with Frontend**
   - API is running at `http://localhost:8000`
   - Use `/predict` endpoint for single images
   - Use `/predict/batch` for multiple images

3. **Deploy to Production**
   - Options: Railway, Render, AWS, Google Cloud
   - Model size: ~20MB (easy to deploy)
   - Memory required: 2GB RAM minimum

---

## 💡 Tips for Best Results

1. **Let training complete** - Don't interrupt the process
2. **Monitor TensorBoard** - Watch for overfitting
3. **Keep dataset clean** - Remove corrupted images
4. **Use fine-tuning** - For maximum accuracy
5. **Test thoroughly** - Use diverse test images
6. **Version control** - Save different model versions

---

## 📞 Need Help?

If you encounter issues:
1. Check the error message in terminal
2. Review the training logs in `logs/` directory
3. Verify dataset structure matches expected format
4. Ensure virtual environment is activated
5. Check Python version: `python --version`

---

## 🎉 Expected Timeline

| Task | Duration |
|------|----------|
| Setup & Installation | 10-15 minutes |
| Dataset Download/Verify | 5 minutes |
| Training (M1/M2/M3) | 25-60 minutes |
| Training (Intel Mac) | 2-3 hours |
| Evaluation & Testing | 10 minutes |
| **Total (Apple Silicon)** | **50-90 minutes** |
| **Total (Intel Mac)** | **2.5-3.5 hours** |

---

**Good luck with your training! 🚀**

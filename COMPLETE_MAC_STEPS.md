# 🎯 Complete MacBook Training Steps - Quick Reference

## Prerequisites Checklist
- [ ] MacBook (any model - M1/M2/M3 preferred)
- [ ] macOS 11.0 or later
- [ ] 8GB+ RAM (16GB recommended)
- [ ] 5GB free storage
- [ ] Python 3.9-3.11 installed

---

## Step-by-Step Training Process

### 1️⃣ Clone Repository on Mac
```bash
# Open Terminal on your Mac
cd ~/Documents  # or wherever you want the project

# Clone from GitHub
git clone https://github.com/ZAINAZHAR303/agrisence.git
cd agrisence
```

### 2️⃣ Get the Dataset
The PlantVillage dataset should be placed in the parent directory:

```bash
# Your structure should be:
# ~/Documents/agrisence/
#   ├── PlantVillage/           ← Dataset here
#   │   ├── Tomato_Bacterial_spot/
#   │   ├── Tomato_Early_blight/
#   │   └── ...
#   └── plant_disease_detection/
```

**Option A: Copy from Windows PC**
```bash
# From Windows PC, copy PlantVillage to external drive or cloud
# Then on Mac, move it to the project folder
```

**Option B: Re-download**
If you need to download PlantVillage dataset again, it's available from Kaggle or the original source.

### 3️⃣ Run Automated Setup
```bash
# Make setup script executable
chmod +x setup_mac.sh

# Run setup (installs everything automatically)
./setup_mac.sh
```

This will:
- Create virtual environment
- Install TensorFlow with Metal GPU (for M1/M2/M3)
- Install all dependencies
- Verify GPU detection
- Show you next steps

### 4️⃣ Verify Installation
```bash
cd plant_disease_detection
python check_gpu_mac.py
```

**Expected output for Apple Silicon:**
```
✅ GPU/Metal AVAILABLE!
✅ Metal GPU acceleration: AVAILABLE
   Apple Silicon detected - training will use GPU acceleration
⏱️  Expected Training Time:
   Apple Silicon (M1/M2/M3): 25-60 minutes
```

**Expected output for Intel Mac:**
```
⚠️  No GPU detected - will use CPU
⏱️  Expected Training Time:
   CPU only (Intel/No Metal): 2-3 hours
```

### 5️⃣ Start Training

**Option A: Quick Training (Good Accuracy)**
```bash
# From plant_disease_detection directory
python src/model_training_optimized.py

# Expected: 85-92% accuracy in 25-40 minutes (M1/M2/M3)
```

**Option B: Fine-Tuned Training (Best Accuracy) - RECOMMENDED**
```bash
# From plant_disease_detection directory
python src/model_training_optimized.py --fine-tune

# Expected: 90-97% accuracy in 40-60 minutes (M1/M2/M3)
```

### 6️⃣ Monitor Training (Optional)

**In a new Terminal window:**
```bash
cd ~/Documents/agrisence/plant_disease_detection
source ../venv/bin/activate
tensorboard --logdir=logs/

# Open browser: http://localhost:6006
```

You'll see real-time graphs of:
- Accuracy curves
- Loss curves
- Learning rate schedule

### 7️⃣ Wait for Completion

**What you'll see during training:**
```
Stage 1: Training with frozen base model
Epoch 1/30 - loss: 1.2345 - accuracy: 0.4567 - val_accuracy: 0.5234
Epoch 2/30 - loss: 0.9876 - accuracy: 0.6234 - val_accuracy: 0.6543
...
Epoch 30/30 - loss: 0.2345 - accuracy: 0.9123 - val_accuracy: 0.9012

✓ Stage 1 completed in 28.45 minutes
📊 Evaluating on test set...
Test Accuracy: 89.34%

Stage 2: Fine-tuning with unfrozen layers
Epoch 1/15 - loss: 0.2123 - accuracy: 0.9234 - val_accuracy: 0.9123
...
Epoch 15/15 - loss: 0.1234 - accuracy: 0.9645 - val_accuracy: 0.9523

✓ Stage 2 completed in 18.67 minutes
📊 Evaluating after fine-tuning...
Test Accuracy: 94.56%

✅ TRAINING COMPLETED SUCCESSFULLY!
```

### 8️⃣ Verify Results

```bash
# Check training summary
cat models/training_info.json

# View confusion matrix
open models/confusion_matrix.png

# See training plots
open models/training_history_stage1.png
open models/training_history_stage2.png  # if fine-tuned
```

**Success criteria:**
- ✅ Test accuracy ≥ 85%
- ✅ Confusion matrix shows strong diagonal
- ✅ All classes have good precision/recall

### 9️⃣ Test the Model

```bash
# Test with a sample image
python src/inference.py --image ../PlantVillage/Tomato_healthy/001.jpg

# Expected output:
# Prediction: Tomato_healthy
# Confidence: 95.67%
```

### 🔟 Start the API

```bash
cd api
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# API will be available at: http://localhost:8000
# Test at: http://localhost:8000/docs
```

---

## After Training - Push to GitHub

### Update GitHub with trained model results:

```bash
cd ~/Documents/agrisence

# Add optimized training files
git add MACBOOK_TRAINING_GUIDE.md
git add QUICKSTART_MAC.md
git add OPTIMIZATIONS_EXPLAINED.md
git add setup_mac.sh
git add requirements_mac.txt
git add plant_disease_detection/config.py
git add plant_disease_detection/src/model_training_optimized.py
git add plant_disease_detection/src/data_preprocessing.py
git add plant_disease_detection/check_gpu_mac.py

# Add training results (not the .h5 file - too large)
git add plant_disease_detection/models/training_info.json
git add plant_disease_detection/models/evaluation_results.json
git add plant_disease_detection/models/*.png

# Commit changes
git commit -m "Add optimized training for MacBook with 85-97% accuracy"

# Push to GitHub
git push origin master
```

**Note:** The actual model file (`.h5`) is excluded by `.gitignore` because it's too large (~20MB). You can deploy it separately or share via cloud storage.

---

## Troubleshooting

### "No module named 'tensorflow'"
```bash
source venv/bin/activate  # Activate virtual environment first
```

### "Metal GPU not found" (Apple Silicon)
```bash
pip uninstall tensorflow tensorflow-macos tensorflow-metal
pip install tensorflow-macos tensorflow-metal
```

### "Out of memory"
Edit `plant_disease_detection/config.py`:
```python
BATCH_SIZE = 16  # Reduce from 32
```

### Training stuck at low accuracy
- Verify dataset location
- Check logs for errors
- Ensure PlantVillage folder structure is correct

### Want faster training
- Use Apple Silicon Mac (M1/M2/M3) for GPU acceleration
- Or use Google Colab with free GPU

---

## File Locations

After successful training:

```
plant_disease_detection/
├── models/
│   ├── plant_disease_efficientnet.h5          ← Main model (20MB)
│   ├── plant_disease_efficientnet_best_stage1.h5
│   ├── plant_disease_efficientnet_best_stage2.h5
│   ├── training_info.json                      ← Training summary
│   ├── evaluation_results.json                 ← Test metrics
│   ├── confusion_matrix.png                    ← Visual performance
│   ├── training_history_stage1.png
│   └── training_history_stage2.png
└── logs/
    ├── stage1_YYYYMMDD_HHMMSS/                ← TensorBoard logs
    └── stage2_YYYYMMDD_HHMMSS/
```

---

## Expected Timeline

| Task | Apple Silicon | Intel Mac |
|------|--------------|-----------|
| Setup | 10 minutes | 10 minutes |
| Training (basic) | 25-40 min | 2-3 hours |
| Training (fine-tuned) | 40-60 min | 3-5 hours |
| Testing | 5 minutes | 5 minutes |
| **Total** | **55-75 min** | **3.5-5.5 hours** |

---

## Success Indicators

Your training is successful when you see:

1. ✅ **No errors during setup**
   - GPU detected (for M1/M2/M3)
   - All packages installed

2. ✅ **Training progresses smoothly**
   - Accuracy increases each epoch
   - Validation accuracy follows training accuracy
   - No NaN losses

3. ✅ **Final results are good**
   - Test accuracy ≥ 85%
   - Confusion matrix is diagonal
   - All 10 classes perform well

4. ✅ **API works correctly**
   - Model loads without errors
   - Predictions are diverse (not all one class)
   - Response time < 2 seconds

---

## Next Steps After Successful Training

1. **Integrate with Frontend**
   - API runs at `http://localhost:8000`
   - Frontend can call `/predict` endpoint

2. **Deploy to Production**
   - Options: Railway, Render, AWS, Google Cloud
   - Copy model file to server
   - Run API with uvicorn

3. **Test with Real Images**
   - Take photos of actual plant leaves
   - Test model's real-world performance
   - Collect more data if needed

---

## Need Help?

Check these documents:
- [MACBOOK_TRAINING_GUIDE.md](MACBOOK_TRAINING_GUIDE.md) - Detailed setup guide
- [QUICKSTART_MAC.md](QUICKSTART_MAC.md) - Quick reference
- [OPTIMIZATIONS_EXPLAINED.md](OPTIMIZATIONS_EXPLAINED.md) - Why it works now

---

**You're all set! Start training and achieve 85-97% accuracy! 🚀**

# 🚀 Quick Start - MacBook Training

## One-Command Setup

```bash
# 1. Clone repo (if not done)
git clone https://github.com/ZAINAZHAR303/agrisence.git
cd agrisence

# 2. Run automated setup
chmod +x setup_mac.sh
./setup_mac.sh

# 3. Start training
cd plant_disease_detection
python src/model_training_optimized.py --fine-tune
```

---

## Manual Steps (if automated setup fails)

### 1. Environment Setup
```bash
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
```

### 2. Install Dependencies

**Apple Silicon (M1/M2/M3):**
```bash
pip install tensorflow-macos tensorflow-metal
pip install -r requirements_mac.txt
```

**Intel Mac:**
```bash
pip install tensorflow
pip install -r requirements_mac.txt
```

### 3. Verify Setup
```bash
cd plant_disease_detection
python check_gpu_mac.py
```

Should show: "✅ Metal GPU acceleration: AVAILABLE" (Apple Silicon)

### 4. Train Model
```bash
# Basic training (30 epochs)
python src/model_training_optimized.py

# With fine-tuning (best accuracy)
python src/model_training_optimized.py --fine-tune

# Custom epochs
python src/model_training_optimized.py --fine-tune --epochs 40
```

---

## Monitoring Training

### Terminal Output
Watch for:
- ✅ Epoch progress (should increase accuracy each epoch)
- ✅ Validation accuracy > 85% after 20-30 epochs
- ✅ No "NaN" losses (indicates training problem)

### TensorBoard (Real-time Graphs)
```bash
# In new terminal
cd agrisence/plant_disease_detection
source ../venv/bin/activate
tensorboard --logdir=logs/

# Open: http://localhost:6006
```

---

## Expected Results

### Apple Silicon (M1/M2/M3)
- ⏱️ Training Time: **25-60 minutes**
- 🎯 Accuracy: **85-95%** (basic), **90-97%** (fine-tuned)
- 💾 Model Size: ~20MB

### Intel Mac
- ⏱️ Training Time: **2-3 hours**
- 🎯 Accuracy: **85-95%** (basic), **90-97%** (fine-tuned)
- 💾 Model Size: ~20MB

---

## After Training

### 1. Check Results
```bash
cd plant_disease_detection

# View training info
cat models/training_info.json

# Open confusion matrix
open models/confusion_matrix.png
```

### 2. Test Model
```bash
# Test inference
python src/inference.py --image /path/to/test_leaf.jpg

# Start API
cd api
uvicorn app:app --reload
```

### 3. Push to GitHub
```bash
cd ..
git add plant_disease_detection/models/*.json
git add plant_disease_detection/models/*.png
git commit -m "Add trained model results"
git push origin master
```

**Note:** Don't push the .h5 model file (too large, already in .gitignore)

---

## Troubleshooting

### "No GPU detected"
```bash
# Reinstall Metal support (Apple Silicon)
pip uninstall tensorflow-macos tensorflow-metal
pip install tensorflow-macos tensorflow-metal
```

### "Out of Memory"
Edit `config.py`:
```python
BATCH_SIZE = 16  # or even 8
```

### Training Stuck at Low Accuracy
- Check dataset path in config.py
- Verify PlantVillage folder structure
- Increase epochs: `--epochs 40`

### Import Errors
```bash
# Reinstall all dependencies
pip install --upgrade -r requirements_mac.txt
```

---

## Pro Tips

1. **Don't sleep your Mac** during training
2. **Keep terminal open** - training will stop if closed
3. **Use tmux/screen** for long sessions:
   ```bash
   brew install tmux
   tmux new -s training
   # Run training
   # Detach: Ctrl+B, then D
   # Reattach: tmux attach -t training
   ```

4. **Monitor GPU usage** (Apple Silicon):
   ```bash
   sudo powermetrics --samplers gpu_power -i 1000
   ```

5. **Free up space** before training:
   ```bash
   # Need ~5GB free
   df -h
   ```

---

## File Locations After Training

```
plant_disease_detection/
├── models/
│   ├── plant_disease_efficientnet.h5          ← Final model
│   ├── plant_disease_efficientnet_best_stage1.h5
│   ├── training_info.json                      ← Metrics summary
│   ├── evaluation_results.json
│   └── confusion_matrix.png                    ← Visual results
└── logs/
    └── stage1_YYYYMMDD_HHMMSS/                ← TensorBoard logs
```

---

## Next: Deploy

1. Copy model to production:
   ```bash
   scp models/plant_disease_efficientnet.h5 user@server:/path/
   ```

2. Or use the API locally:
   ```bash
   cd api
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```

3. Integrate with frontend:
   ```bash
   curl -X POST http://localhost:8000/predict \
     -F "file=@leaf_image.jpg"
   ```

---

**Happy Training! 🌱**

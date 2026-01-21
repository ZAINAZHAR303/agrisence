#!/bin/bash

# AgriSense Plant Disease Detection - MacBook Setup Script
# This script automates the setup process for training on macOS

set -e  # Exit on error

echo "=================================="
echo "🍎 AgriSense MacBook Setup"
echo "=================================="

# Detect Mac type
if [[ $(uname -m) == 'arm64' ]]; then
    MAC_TYPE="Apple Silicon (M1/M2/M3)"
    USE_METAL=true
else
    MAC_TYPE="Intel Mac"
    USE_METAL=false
fi

echo ""
echo "📱 Detected: $MAC_TYPE"
echo ""

# Check Python version
echo "🔍 Checking Python version..."
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "   Python version: $PYTHON_VERSION"

# Check if python version is 3.9-3.11
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

if [ "$PYTHON_MAJOR" -ne 3 ] || [ "$PYTHON_MINOR" -lt 9 ] || [ "$PYTHON_MINOR" -gt 11 ]; then
    echo "⚠️  Warning: Python 3.9-3.11 recommended, you have $PYTHON_VERSION"
    echo "   You can continue, but consider installing Python 3.11"
fi

# Create virtual environment
echo ""
echo "📦 Creating virtual environment..."
if [ -d "venv" ]; then
    echo "   Virtual environment already exists, skipping..."
else
    python3 -m venv venv
    echo "   ✓ Virtual environment created"
fi

# Activate virtual environment
echo ""
echo "🔌 Activating virtual environment..."
source venv/bin/activate
echo "   ✓ Virtual environment activated"

# Upgrade pip
echo ""
echo "⬆️  Upgrading pip..."
pip install --upgrade pip --quiet
echo "   ✓ pip upgraded"

# Install TensorFlow based on Mac type
echo ""
if [ "$USE_METAL" = true ]; then
    echo "🚀 Installing TensorFlow with Metal GPU support..."
    pip install tensorflow-macos --quiet
    pip install tensorflow-metal --quiet
    echo "   ✓ TensorFlow with Metal installed (GPU acceleration enabled)"
else
    echo "💻 Installing TensorFlow (CPU only)..."
    pip install tensorflow --quiet
    echo "   ✓ TensorFlow installed (CPU only)"
fi

# Install other dependencies
echo ""
echo "📚 Installing other dependencies..."
pip install fastapi uvicorn[standard] python-multipart --quiet
pip install pillow opencv-python-headless --quiet
pip install numpy pandas matplotlib seaborn scikit-learn --quiet
pip install pydantic python-jose[cryptography] passlib python-dotenv --quiet
echo "   ✓ All dependencies installed"

# Verify installation
echo ""
echo "🧪 Verifying installation..."
cd plant_disease_detection
python check_gpu_mac.py

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Ensure dataset is in place:"
echo "   PlantVillage/ should be in the parent directory"
echo ""
echo "2. Verify dataset structure:"
echo "   ls ../PlantVillage/"
echo ""
echo "3. Start training:"
echo "   cd plant_disease_detection"
echo "   python src/model_training_optimized.py"
echo ""
echo "   For fine-tuning (better accuracy):"
echo "   python src/model_training_optimized.py --fine-tune"
echo ""
echo "4. Monitor training with TensorBoard:"
echo "   tensorboard --logdir=logs/"
echo ""
echo "=================================="
echo ""

if [ "$USE_METAL" = true ]; then
    echo "🎉 Your Mac will use GPU acceleration!"
    echo "   Expected training time: 25-60 minutes"
else
    echo "⚠️  Your Mac will use CPU only"
    echo "   Expected training time: 2-3 hours"
fi

echo ""
echo "💡 Tip: Keep terminal open during training"
echo "         Don't put Mac to sleep!"
echo ""

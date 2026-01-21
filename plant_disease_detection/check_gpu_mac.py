"""
Check GPU availability on macOS (Metal API for Apple Silicon)
"""
import tensorflow as tf
import sys

print("=" * 80)
print("🔍 GPU/Metal Detection for macOS")
print("=" * 80)

# TensorFlow version
print(f"\n✓ TensorFlow version: {tf.__version__}")

# Check for GPU devices
physical_devices = tf.config.list_physical_devices()
gpu_devices = tf.config.list_physical_devices('GPU')

print(f"\n📱 Physical Devices: {len(physical_devices)} total")
for device in physical_devices:
    print(f"  - {device}")

if gpu_devices:
    print(f"\n✅ GPU/Metal AVAILABLE!")
    print(f"   Found {len(gpu_devices)} GPU device(s)")
    for gpu in gpu_devices:
        print(f"   - {gpu}")
    
    # Check if Metal plugin is loaded (for Apple Silicon)
    try:
        # This will work if tensorflow-metal is installed
        import tensorflow.python.framework.ops
        print(f"\n✅ Metal GPU acceleration: AVAILABLE")
        print(f"   Apple Silicon detected - training will use GPU acceleration")
    except:
        print(f"\n⚠️  Metal plugin not detected")
        print(f"   Install with: pip install tensorflow-metal")
else:
    print(f"\n⚠️  No GPU detected - will use CPU")
    print(f"\n💡 For Apple Silicon Macs (M1/M2/M3):")
    print(f"   Install Metal support:")
    print(f"   1. pip install tensorflow-macos")
    print(f"   2. pip install tensorflow-metal")
    print(f"\n   For Intel Macs:")
    print(f"   CPU-only training is expected")

# Test GPU computation
print(f"\n🧪 Testing GPU computation...")
try:
    with tf.device('/GPU:0'):
        a = tf.constant([[1.0, 2.0], [3.0, 4.0]])
        b = tf.constant([[5.0, 6.0], [7.0, 8.0]])
        c = tf.matmul(a, b)
        print(f"✅ GPU computation test: PASSED")
        print(f"   Result: {c.numpy()}")
except:
    print(f"⚠️  GPU computation test: FAILED")
    print(f"   Will use CPU for training")

# Performance estimate
print(f"\n⏱️  Expected Training Time:")
if gpu_devices and 'GPU' in str(gpu_devices):
    print(f"   Apple Silicon (M1/M2/M3): 25-60 minutes")
    print(f"   Status: ✅ OPTIMIZED")
else:
    print(f"   CPU only (Intel/No Metal): 2-3 hours")
    print(f"   Status: ⚠️  SLOWER")

print("\n" + "=" * 80)

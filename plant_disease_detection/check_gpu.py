"""
Quick training script with GPU check and optimization
"""
import tensorflow as tf

print("=" * 80)
print("🔍 GPU Availability Check")
print("=" * 80)

# Check TensorFlow version
print(f"\nTensorFlow version: {tf.__version__}")

# Check for GPU
gpus = tf.config.list_physical_devices('GPU')
print(f"\nGPUs available: {len(gpus)}")

if gpus:
    for i, gpu in enumerate(gpus):
        print(f"  GPU {i}: {gpu}")
        
    # Try to get GPU details
    try:
        gpu_details = tf.config.experimental.get_device_details(gpus[0])
        print(f"\nGPU Details: {gpu_details}")
    except:
        print("\n  (Unable to get GPU details)")
else:
    print("\n⚠️  No GPU detected!")
    print("\nPossible reasons:")
    print("  1. No NVIDIA GPU in system")
    print("  2. CUDA not installed or incompatible version")
    print("  3. cuDNN not installed")
    print("  4. TensorFlow not built with GPU support")
    print("\nInstalled with: pip install tensorflow (CPU-only)")
    print("For GPU support: pip install tensorflow[and-cuda]")

# Check CPU
print(f"\nCPU devices: {len(tf.config.list_physical_devices('CPU'))}")

print("\n" + "=" * 80)

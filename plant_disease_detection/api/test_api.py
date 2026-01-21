"""
Simple test script for the FastAPI endpoint
"""
import requests
from pathlib import Path

# API endpoint
BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n1️⃣ Testing Health Endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    return response.status_code == 200

def test_classes():
    """Test classes endpoint"""
    print("\n2️⃣ Testing Classes Endpoint...")
    response = requests.get(f"{BASE_URL}/classes")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Classes: {data['num_classes']}")
    return response.status_code == 200

def test_predict(image_path):
    """Test prediction endpoint"""
    print(f"\n3️⃣ Testing Prediction Endpoint...")
    print(f"   Image: {image_path}")
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BASE_URL}/predict", files=files)
    
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()['data']
        print(f"\n   🔍 Prediction Result:")
        print(f"      Disease: {data['top_prediction']['disease']}")
        print(f"      Confidence: {data['top_prediction']['confidence_percent']}")
        print(f"      Severity: {data['disease_info']['severity']}")
        return True
    else:
        print(f"   Error: {response.json()}")
        return False

def main():
    """Run all tests"""
    print("="*80)
    print("🧪 Testing AgriSense AI - Plant Disease Detection API")
    print("="*80)
    
    # Test endpoints
    health_ok = test_health()
    classes_ok = test_classes()
    
    # Test prediction with a sample image
    # You'll need to provide an actual image path
    sample_image = Path("../PlantVillage/Tomato_healthy").glob("*.jpg").__next__()
    predict_ok = test_predict(sample_image) if sample_image.exists() else False
    
    print("\n" + "="*80)
    print("📊 Test Summary:")
    print(f"   Health Check: {'✅' if health_ok else '❌'}")
    print(f"   Get Classes: {'✅' if classes_ok else '❌'}")
    print(f"   Prediction: {'✅' if predict_ok else '❌'}")
    print("="*80)

if __name__ == "__main__":
    main()

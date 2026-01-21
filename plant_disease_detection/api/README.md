# 🌱 AgriSense AI - Plant Disease Detection API

FastAPI-based REST API for plant disease detection using EfficientNetB0 transfer learning model.

## 🚀 Quick Start

### 1. Start the API Server

```bash
cd plant_disease_detection/api
python app.py
```

The API will be available at:
- **API Base**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 2. Test the API

```bash
python test_api.py
```

## 📡 API Endpoints

### **GET /** - Root
Get API information and available endpoints.

```bash
curl http://localhost:8000/
```

### **GET /health** - Health Check
Check if API and model are loaded properly.

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "API is running",
  "model_loaded": true,
  "num_classes": 10
}
```

### **GET /classes** - Get All Disease Classes
Retrieve list of all detectable disease classes.

```bash
curl http://localhost:8000/classes
```

**Response:**
```json
{
  "success": true,
  "num_classes": 10,
  "classes": [
    "Tomato_Bacterial_spot",
    "Tomato_Early_blight",
    ...
  ]
}
```

### **POST /predict** - Predict Disease
Upload an image to detect plant disease.

**Parameters:**
- `file`: Image file (required)
- `top_k`: Number of top predictions (optional, default: 3)

**Example using cURL:**
```bash
curl -X POST "http://localhost:8000/predict" \
  -F "file=@/path/to/leaf_image.jpg" \
  -F "top_k=3"
```

**Example using Python:**
```python
import requests

url = "http://localhost:8000/predict"
files = {'file': open('leaf_image.jpg', 'rb')}

response = requests.post(url, files=files)
result = response.json()

print(f"Disease: {result['data']['top_prediction']['disease']}")
print(f"Confidence: {result['data']['top_prediction']['confidence_percent']}")
```

**Response:**
```json
{
  "success": true,
  "message": "Prediction successful",
  "data": {
    "filename": "leaf_image.jpg",
    "top_prediction": {
      "disease": "Tomato_Early_blight",
      "confidence": 0.95,
      "confidence_percent": "95.00%"
    },
    "all_predictions": [
      {
        "disease": "Tomato_Early_blight",
        "confidence": 0.95,
        "confidence_percent": "95.00%"
      },
      {
        "disease": "Tomato_Late_blight",
        "confidence": 0.03,
        "confidence_percent": "3.00%"
      },
      {
        "disease": "Tomato_Septoria_leaf_spot",
        "confidence": 0.01,
        "confidence_percent": "1.00%"
      }
    ],
    "disease_info": {
      "scientific_name": "Alternaria solani",
      "severity": "Medium to High",
      "description": "Early blight is a common fungal disease...",
      "symptoms": ["Dark brown spots with concentric rings", ...],
      "treatment": ["Apply fungicides containing chlorothalonil", ...],
      "prevention": ["Mulch around plants", ...]
    }
  }
}
```

### **POST /predict/batch** - Batch Prediction
Upload multiple images (max 10) for batch prediction.

```bash
curl -X POST "http://localhost:8000/predict/batch" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "files=@image3.jpg"
```

### **GET /disease-info/{disease_name}** - Get Disease Information
Get detailed information about a specific disease.

```bash
curl http://localhost:8000/disease-info/Tomato_Early_blight
```

## 🔗 Frontend Integration

### JavaScript/React Example

```javascript
async function detectDisease(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  try {
    const response = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Disease:', result.data.top_prediction.disease);
      console.log('Confidence:', result.data.top_prediction.confidence_percent);
      console.log('Treatment:', result.data.disease_info.treatment);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage with file input
document.getElementById('imageInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  detectDisease(file);
});
```

### Next.js Example

```typescript
// app/api/detect-disease/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  
  const response = await fetch('http://localhost:8000/predict', {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  return NextResponse.json(data);
}

// components/DiseaseDetector.tsx
'use client';

import { useState } from 'react';

export default function DiseaseDetector() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/detect-disease', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    setResult(data.data);
    setLoading(false);
  };
  
  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {loading && <p>Analyzing...</p>}
      {result && (
        <div>
          <h3>Disease: {result.top_prediction.disease}</h3>
          <p>Confidence: {result.top_prediction.confidence_percent}</p>
          <p>Severity: {result.disease_info.severity}</p>
        </div>
      )}
    </div>
  );
}
```

## 🔧 Configuration

### CORS Settings
For production, configure allowed origins in `app.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Port Configuration
Change the port in `app.py`:

```python
uvicorn.run("app:app", host="0.0.0.0", port=8080)  # Use port 8080
```

## 📦 Deployment

### Option 1: Docker (Recommended)

```dockerfile
# Coming soon - Dockerfile will be provided
```

### Option 2: Cloud Platforms

**Render:**
```bash
# render.yaml configuration
services:
  - type: web
    name: agrisense-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python api/app.py
```

**Railway/Vercel:**
- Follow platform-specific Python deployment guides
- Ensure `requirements.txt` is in root directory
- Set start command: `python plant_disease_detection/api/app.py`

## 🐛 Troubleshooting

**Model not loaded error:**
- Ensure the model file exists at `models/plant_disease_efficientnet.h5`
- Run training first if model doesn't exist

**CORS errors:**
- Update `allow_origins` in CORS middleware
- For development, use `["*"]`

**Import errors:**
- Ensure you're running from the correct directory
- Check Python path includes parent directories

## 📊 Performance

- **Average inference time**: ~100-200ms per image (CPU)
- **Average inference time**: ~30-50ms per image (GPU)
- **Supported formats**: JPEG, PNG
- **Max image size**: Automatically resized to 224x224

## 🔒 Security Notes

For production deployment:
1. Add authentication middleware
2. Rate limiting
3. Input validation and sanitization
4. HTTPS only
5. Restrict CORS origins
6. Monitor and log API usage

# 🌾 AgriSense AI - Intelligent IoT and AI-Based Smart Agriculture Platform

An integrated, web-based smart agriculture system that empowers farmers through IoT sensing, deep learning, and AI-driven insights.

## 📋 Project Overview

AgriSense AI combines four major components:
1. **IoT-based soil analysis** and fertilizer recommendation system
2. **Plant disease detection** using transfer learning (EfficientNetB0)
3. **RAG-based AI assistant** for agriculture-related queries
4. **Social platform** for farmers to share knowledge and updates

## 🚀 Current Implementation Status

### ✅ Plant Disease Detection Module (Completed)

A production-ready plant disease detection system using deep learning.

**Features:**
- EfficientNetB0 transfer learning model
- 10 tomato disease classes detection
- FastAPI REST API
- Comprehensive disease information database
- Batch prediction support
- 95%+ accuracy (after proper training)

**Tech Stack:**
- TensorFlow/Keras for deep learning
- FastAPI for API endpoints
- OpenCV & PIL for image processing
- NumPy & Pandas for data handling

**Quick Start:**
```bash
cd plant_disease_detection
pip install -r requirements.txt

# Train model (if needed)
python src/model_training.py

# Start API server
python api/app.py
```

**API Endpoints:**
- `GET /health` - Health check
- `GET /classes` - Get all disease classes
- `POST /predict` - Predict disease from image
- `POST /predict/batch` - Batch prediction
- `GET /disease-info/{name}` - Get disease details

**Documentation:**
- [Training Guide](plant_disease_detection/TRAINING_GUIDE.md)
- [API Documentation](plant_disease_detection/api/README.md)

### 🔄 Upcoming Modules

- **IoT Soil Monitoring** (Next)
- **RAG-based Chatbot** (Planned)
- **Farmer Social Platform** (Planned)

## 📊 Supported Disease Classes

1. Tomato Bacterial Spot
2. Tomato Early Blight
3. Tomato Late Blight
4. Tomato Leaf Mold
5. Tomato Septoria Leaf Spot
6. Tomato Spider Mites
7. Tomato Target Spot
8. Tomato Yellow Leaf Curl Virus
9. Tomato Mosaic Virus
10. Healthy Tomato

Each disease includes:
- Scientific name
- Severity level
- Symptoms
- Treatment recommendations
- Prevention measures

## 🛠️ Technology Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js, Tailwind CSS |
| **Backend** | Node.js, Express.js, FastAPI |
| **Database** | MongoDB, Firebase |
| **IoT Devices** | ESP32, NPK Sensor, Soil Moisture Sensor, pH Sensor |
| **Machine Learning** | Scikit-learn |
| **Deep Learning** | TensorFlow, Keras, EfficientNetB0 |
| **Image Processing** | OpenCV, NumPy |
| **AI Query System** | LangChain, Vector DB, OpenAI API |
| **Version Control** | GitHub |
| **Deployment** | Vercel / Render / Firebase Hosting |

## 📁 Project Structure

```
AgriSense/
├── plant_disease_detection/      # ✅ Completed
│   ├── api/                      # FastAPI application
│   ├── src/                      # Core modules
│   │   ├── data_preprocessing.py
│   │   ├── model_training.py
│   │   ├── model_evaluation.py
│   │   └── inference.py
│   ├── models/                   # Saved models (gitignored)
│   ├── config.py                 # Configuration
│   └── requirements.txt
│
├── iot_soil_monitoring/          # 🔄 In Progress
├── rag_chatbot/                  # 📋 Planned
└── social_platform/              # 📋 Planned
```

## 🔧 Installation

### Prerequisites
- Python 3.8 - 3.11
- Git
- (Optional) NVIDIA GPU with CUDA for faster training

### Setup

1. **Clone repository:**
```bash
git clone https://github.com/ZAINAZHAR303/agrisence.git
cd agrisence
```

2. **Create virtual environment:**
```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate
```

3. **Install dependencies:**
```bash
cd plant_disease_detection
pip install -r requirements.txt
```

4. **Download dataset (for training):**
- Download PlantVillage dataset
- Place in `PlantVillage/` directory (will be gitignored)

## 🎯 Usage Examples

### Frontend Integration (React/Next.js)

```javascript
async function detectDisease(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await fetch('http://localhost:8000/predict', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  console.log('Disease:', result.data.top_prediction.disease);
  console.log('Confidence:', result.data.top_prediction.confidence_percent);
  console.log('Severity:', result.data.disease_info.severity);
  console.log('Treatment:', result.data.disease_info.treatment);
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Zain Azhar** - [GitHub](https://github.com/ZAINAZHAR303)

## 📧 Contact

For questions or support, please open an issue on GitHub.

## 🙏 Acknowledgments

- PlantVillage Dataset for training data
- TensorFlow & Keras teams
- FastAPI community
- All contributors and supporters

---

**Note:** Dataset and trained model files are excluded from the repository due to size. Please download the PlantVillage dataset separately and train the model using the provided scripts.

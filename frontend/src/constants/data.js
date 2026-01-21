// Dashboard Constants
export const SOIL_DATA = [
  { day: "Mon", moisture: 42 },
  { day: "Tue", moisture: 55 },
  { day: "Wed", moisture: 28 },
  { day: "Thu", moisture: 46 },
  { day: "Fri", moisture: 36 },
  { day: "Sat", moisture: 60 },
];

export const NUTRIENT_DATA = [
  { name: "N", value: 35 },
  { name: "P", value: 22 },
  { name: "K", value: 25 },
];

export const DASHBOARD_STATS = [
  { title: "Soil Moisture", value: "45%", icon: "💧" },
  { title: "Soil pH", value: "6.8", icon: "🧪" },
  { title: "Disease Risk", value: "Low", icon: "🦠" },
  { title: "Fertilizer", value: "Recommended", icon: "🌱" },
];

// Soil Monitoring Constants
export const SOIL_MONITORING_DATA = [
  { time: "8 AM", moisture: 35, ph: 6.5, nitrogen: 40 },
  { time: "10 AM", moisture: 38, ph: 6.6, nitrogen: 42 },
  { time: "12 PM", moisture: 36, ph: 6.7, nitrogen: 43 },
  { time: "2 PM", moisture: 37, ph: 6.5, nitrogen: 45 },
  { time: "4 PM", moisture: 39, ph: 6.6, nitrogen: 46 },
];

export const SOIL_SENSOR_CARDS = [
  { title: "Soil Moisture", value: "37%", color: "green" },
  { title: "pH Level", value: "6.6", color: "yellow" },
  { title: "Nitrogen (N)", value: "42 mg/kg", color: "blue" },
  { title: "Temperature", value: "28°C", color: "red" },
];

export const FERTILIZER_RECOMMENDATIONS = [
  "Apply 50kg of Nitrogen-based fertilizer per hectare",
  "Maintain soil pH between 6.5 and 7.0",
  "Irrigate twice daily to maintain moisture above 35%",
];

// Disease Detection Constants
export const DISEASE_DETECTION_RESULT = {
  disease: "Early Blight",
  confidence: "92%",
  severity: "Moderate",
  treatment: [
    "Remove infected leaves immediately",
    "Apply fungicide containing chlorothalonil",
    "Avoid overhead watering",
    "Ensure proper air circulation",
  ],
};

export const DISEASE_DETECTION_FEATURES = [
  { title: "High Accuracy", text: "Trained using transfer learning on validated datasets", icon: "🎯" },
  { title: "Fast Analysis", text: "AI delivers results within seconds", icon: "⚡" },
  { title: "Farmer Friendly", text: "Designed for simplicity and clarity", icon: "🤝" },
];

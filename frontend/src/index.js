// ==========================================
// AgriSense AI - Central Export Hub
// ==========================================
// Import everything from this file using the @ alias
// Example: import { Card, Button, DashboardContent } from "@/index"

// ==========================================
// UI Components
// ==========================================
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  ActionCard,
  Button,
  Badge,
  Section,
  SectionTitle,
  SectionContent,
} from "@/components/ui";

// ==========================================
// Common Components
// ==========================================
export { ThemeToggle, Header } from "@/components/common";

// ==========================================
// Feature Components (Main Exports)
// ==========================================
export { default as DashboardContent } from "@/features/dashboard/DashboardContent";
export { default as DiseaseDetectionContent } from "@/features/disease-detection/DiseaseDetectionContent";
export { default as SoilMonitoringContent } from "@/features/soil-monitoring/SoilMonitoringContent";
export { default as AssistantContent } from "@/features/assistant/AssistantContent";
export { default as LoginContent } from "@/features/auth/LoginContent";

// ==========================================
// Feature Sub-Components (Dashboard)
// ==========================================
export {
  DashboardStats,
  MoistureChart,
  NutrientChart,
  RecommendationCards,
} from "@/features/dashboard/components";

// ==========================================
// Feature Sub-Components (Disease Detection)
// ==========================================
export {
  ImageUploadSection,
  HowItWorks,
  ResultPreview,
  TrustFeatures,
} from "@/features/disease-detection/components";

// ==========================================
// Feature Sub-Components (Soil Monitoring)
// ==========================================
export {
  SensorCardsGrid,
  SoilDataTrend,
  FertilizerRecommendations,
} from "@/features/soil-monitoring/components";

// ==========================================
// Feature Sub-Components (Assistant)
// ==========================================
export { ChatMessage, ChatMessages, ChatInput } from "@/features/assistant/components";

// ==========================================
// Feature Sub-Components (Auth)
// ==========================================
export { LoginForm } from "@/features/auth/components";

// ==========================================
// Custom Hooks
// ==========================================
export { useTheme, useImageUpload, useMessages } from "@/hooks";

// ==========================================
// Utilities
// ==========================================
export {
  formatPercentage,
  formatNumber,
  formatFileSize,
  isValidEmail,
  truncateText,
} from "@/utils/formatters";

export {
  fileToDataURL,
  isValidFileType,
  isValidFileSize,
  uploadFile,
} from "@/utils/fileHandlers";

// ==========================================
// Constants
// ==========================================
export {
  API_ENDPOINTS,
  ROUTES,
  SOIL_DATA,
  NUTRIENT_DATA,
  DASHBOARD_STATS,
  SOIL_MONITORING_DATA,
  SOIL_SENSOR_CARDS,
  FERTILIZER_RECOMMENDATIONS,
  DISEASE_DETECTION_RESULT,
  DISEASE_DETECTION_FEATURES,
} from "@/constants";

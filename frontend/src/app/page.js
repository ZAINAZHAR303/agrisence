import { HomeContent } from "@/features/home";

export const metadata = {
  title: "AgriSense AI - Smart Farming Solutions",
  description:
    "Detect crop diseases, monitor soil health, and optimize irrigation with AI-powered insights for sustainable agriculture.",
  icons: {
    icon: "/icon.png",
  },
};

export default function HomePage() {
  return <HomeContent />;
}

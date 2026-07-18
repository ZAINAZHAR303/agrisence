import { Bot, FlaskConical, House, Users } from "lucide-react";

export const navigationLinks = [
  {
    href: "/",
    label: "Home",
    description: "Platform overview",
    icon: House,
  },
  {
    href: "/disease-detection",
    label: "Disease Lab",
    description: "Leaf scan and diagnosis",
    icon: FlaskConical,
  },
  {
    href: "/assistant",
    label: "Farmer Assistant",
    description: "RAG guidance in Urdu, Punjabi, and English",
    icon: Bot,
  },
  {
    href: "/social",
    label: "Community",
    description: "Field notes from other growers",
    icon: Users,
  },
];

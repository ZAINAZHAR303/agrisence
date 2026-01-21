import StatCard from "@/components/ui/StatCard";
import { SOIL_SENSOR_CARDS } from "@/constants";

export const SensorCardsGrid = () => {
  const colorMap = {
    green: "🌱",
    yellow: "⚠️",
    blue: "💧",
    red: "🌡️",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {SOIL_SENSOR_CARDS.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={colorMap[card.color]}
          variant={card.color === "green" ? "default" : card.color === "yellow" ? "warning" : card.color === "red" ? "danger" : "info"}
        />
      ))}
    </div>
  );
};

import ActionCard from "@/components/ui/ActionCard";

export const RecommendationCards = () => {
  const recommendations = [
    {
      title: "AI Disease Detection",
      text: "Scan plant leaves to detect diseases using deep learning",
      action: "Scan Plant",
      link: "/disease-detection",
    },
    {
      title: "Fertilizer Suggestion",
      text: "Based on soil analysis, urea fertilizer is recommended",
      action: "View Details",
      link: "/soil-monitor",
    },
    {
      title: "AI Assistant",
      text: "Ask agriculture related questions and get instant answers",
      action: "Ask AI",
      link: "/assistant",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {recommendations.map((rec) => (
        <ActionCard
          key={rec.title}
          title={rec.title}
          text={rec.text}
          action={rec.action}
          link={rec.link}
        />
      ))}
    </div>
  );
};

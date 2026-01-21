import { DISEASE_DETECTION_FEATURES } from "@/constants";

export const TrustFeatures = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
      {DISEASE_DETECTION_FEATURES.map((feature) => (
        <div key={feature.title}>
          <div className="text-5xl mb-4">{feature.icon}</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {feature.title}
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {feature.text}
          </p>
        </div>
      ))}
    </div>
  );
};

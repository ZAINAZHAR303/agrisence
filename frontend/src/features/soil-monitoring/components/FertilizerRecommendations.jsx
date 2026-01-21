import { FERTILIZER_RECOMMENDATIONS } from "@/constants";

export const FertilizerRecommendations = () => {
  return (
    <div className="bg-gradient-to-r from-green-100 to-green-200 dark:from-gray-800 dark:to-gray-700 p-6 rounded-3xl shadow-md border border-green-200 dark:border-gray-600">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Fertilizer Recommendations
      </h2>

      <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
        {FERTILIZER_RECOMMENDATIONS.map((rec, idx) => (
          <li key={idx} className="flex items-center gap-3">
            <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

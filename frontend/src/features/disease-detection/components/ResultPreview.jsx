import { DISEASE_DETECTION_RESULT } from "@/constants";

export const ResultPreview = () => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-green-100 dark:border-gray-700 rounded-3xl p-10">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
        Sample Detection Result
      </h2>

      <p className="mt-3 text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        This is how results will appear after AI analysis, clear, actionable, and farmer friendly
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Disease Name</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">
            {DISEASE_DETECTION_RESULT.disease}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {DISEASE_DETECTION_RESULT.confidence}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Severity Level</p>
          <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
            {DISEASE_DETECTION_RESULT.severity}
          </p>
        </div>
      </div>

      <div className="mt-10 bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-green-700 rounded-2xl p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          Recommended Treatment
        </h4>

        <ul className="mt-3 list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
          {DISEASE_DETECTION_RESULT.treatment.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

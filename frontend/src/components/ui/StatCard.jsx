export default function StatCard({ title, value, icon, variant = "default" }) {
  const variantClasses = {
    default: "text-green-700 dark:text-green-400",
    warning: "text-yellow-700 dark:text-yellow-400",
    danger: "text-red-700 dark:text-red-400",
    info: "text-blue-700 dark:text-blue-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-green-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <span className="text-3xl">{icon}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
      </div>
      <p className={`mt-4 text-2xl font-bold ${variantClasses[variant]}`}>
        {value}
      </p>
    </div>
  );
}

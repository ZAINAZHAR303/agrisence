export default function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
    success: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
    danger: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
}

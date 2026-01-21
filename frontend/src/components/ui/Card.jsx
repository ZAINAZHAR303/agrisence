export const Card = ({ children, className = "", ...props }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-green-100 dark:border-gray-700 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = "" }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-2xl font-semibold text-gray-900 dark:text-white ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = "" }) => (
  <p className={`text-gray-600 dark:text-gray-300 mt-2 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

export const Section = ({ children, className = "", ...props }) => (
  <section className={`space-y-8 ${className}`} {...props}>
    {children}
  </section>
);

export const SectionTitle = ({ children, subtitle, className = "" }) => (
  <div className={className}>
    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
      {children}
    </h2>
    {subtitle && (
      <p className="text-gray-600 dark:text-gray-300 mt-2">{subtitle}</p>
    )}
  </div>
);

export const SectionContent = ({ children, className = "", layout = "default" }) => {
  const layouts = {
    default: "space-y-6",
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    "grid-2": "grid grid-cols-1 lg:grid-cols-2 gap-8",
    "grid-4": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
  };

  return <div className={`${layouts[layout]} ${className}`}>{children}</div>;
};

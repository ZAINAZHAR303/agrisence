export const Header = ({ title, subtitle, status }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>
        )}
      </div>

      {status && (
        <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-4 py-2 rounded-xl text-sm font-medium">
          {status}
        </div>
      )}
    </div>
  );
};

export default Header;

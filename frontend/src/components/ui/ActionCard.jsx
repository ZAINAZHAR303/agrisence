import Link from "next/link";

export default function ActionCard({ title, text, action, link }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-green-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 flex-1">
        {text}
      </p>

      <Link
        href={link}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition font-medium text-sm"
      >
        {action}
        <span>→</span>
      </Link>
    </div>
  );
}

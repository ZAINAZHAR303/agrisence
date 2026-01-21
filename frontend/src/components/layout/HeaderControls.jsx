import { motion } from "framer-motion";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

export const MobileMenuToggle = ({ isOpen, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
      aria-label="Toggle menu"
    >
      {isOpen ? (
        <HiOutlineX className="w-6 h-6 text-gray-900 dark:text-white" />
      ) : (
        <HiOutlineMenu className="w-6 h-6 text-gray-900 dark:text-white" />
      )}
    </motion.button>
  );
};

export const ThemeToggleButton = ({ onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
      aria-label="Toggle theme"
    >
      <div className="w-6 h-6" />
    </motion.button>
  );
};

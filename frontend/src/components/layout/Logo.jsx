import Link from "next/link";
import { motion } from "framer-motion";
import { RiPlantLine } from "react-icons/ri";

export const Logo = () => {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link href="/" className="flex items-center gap-3">
        <div className="relative">
          <motion.div
            className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/30"
            whileHover={{ rotate: 5 }}
          >
            <RiPlantLine className="w-6 h-6" />
          </motion.div>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white font-['Poppins']">
            AgriSense
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">Smart Farm AI</p>
        </div>
      </Link>
    </motion.div>
  );
};

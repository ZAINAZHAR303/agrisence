import { motion } from "framer-motion";
import Link from "next/link";
import { RiPlantLine } from "react-icons/ri";
import { HiChartBar, HiCamera, HiChatAlt2, HiUserGroup } from "react-icons/hi";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HiChartBar },
  { href: "/disease-detection", label: "Disease Detection", icon: HiCamera },
  { href: "/soil-monitor", label: "Soil Monitor", icon: RiPlantLine },
  { href: "/assistant", label: "AI Assistant", icon: HiChatAlt2 },
  { href: "/social", label: "Community", icon: HiUserGroup },
];

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-t from-white to-emerald-50/50 dark:from-gray-900 dark:to-gray-800 border-t border-emerald-100/50 dark:border-emerald-900/30 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center">
                <RiPlantLine className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                  AgriSense AI
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Empowering Farmers Since 2025
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Harnessing AI, IoT, and data analytics to revolutionize
              agriculture with intelligent insights and sustainable solutions.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-4 text-lg">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2 group transition-colors"
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-4 text-lg">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  📧
                </div>
                <span>umairim@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  📱
                </div>
                <span>+92 - 309 - 5330695</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  📍
                </div>
                <span>University of Agriculture, Fsd</span>
              </li>
            </ul>
          </motion.div>

          {/* Project Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-4 text-lg">
              Project Info
            </h4>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>Final Year Project 2025</strong>
                <br />
                Computer Science
              </p>
              <p>
                <strong>Built With:</strong>
                <br />
                Next.js • TensorFlow • IoT • PostgreSQL
              </p>
              <div className="pt-4 border-t border-emerald-100/50 dark:border-emerald-900/30">
                <p className="text-xs">
                  © {new Date().getFullYear()} AgriSense AI
                  <br />
                  All rights reserved
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-emerald-100/50 dark:border-emerald-900/30 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <p>
            Developed by Muhammad Umair & Zain Azhar with ❤️ 
            <br />
            for sustainable agriculture worldwide.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

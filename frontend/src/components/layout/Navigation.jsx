"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  HiChartBar,
  HiCamera,
  HiChatAlt2,
  HiUserGroup,
  HiHome,
} from "react-icons/hi";
import { RiPlantLine } from "react-icons/ri";

const navItems = [
  { href: "/", label: "Home", icon: HiHome },
  { href: "/dashboard", label: "Dashboard", icon: HiChartBar },
  { href: "/disease-detection", label: "Disease Detection", icon: HiCamera },
  { href: "/soil-monitor", label: "Soil Monitor", icon: RiPlantLine },
  { href: "/assistant", label: "AI Assistant", icon: HiChatAlt2 },
  { href: "/social", label: "Community", icon: HiUserGroup },
];

export const NavItems = ({ mobile = false }) => {
  const pathname = usePathname();

  const isActive = (href) => {
    // Exact match or path starts with href
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <motion.div
            key={item.href}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={item.href}
              className={`flex items-center gap-1 px-4 py-1 rounded-lg font-medium transition-all duration-300 relative group ${
                active
                  ? mobile
                    ? "bg-emerald-500/20 dark:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 shadow-md shadow-emerald-500/20"
                    : "text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20"
                  : mobile
                    ? "text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    : "text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${active ? "scale-110" : ""} transition-transform`}
              />
              <span className="text-sm">{item.label}</span>

              {/* Animated underline for desktop active state */}
              {active && !mobile && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Animated left accent for mobile active state */}
              {active && mobile && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-green-500 rounded-r-full"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  style={{ originY: 0.5 }}
                />
              )}
            </Link>
          </motion.div>
        );
      })}
    </>
  );
};

export const DesktopNav = () => {
  return (
    <nav className="hidden lg:flex items-center gap-1">
      <NavItems />
    </nav>
  );
};

export const MobileNav = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-b border-emerald-100 dark:border-emerald-900/30 p-4 mt-2"
    >
      <div className="space-y-2">
        <NavItems mobile />
      </div>
    </motion.nav>
  );
};

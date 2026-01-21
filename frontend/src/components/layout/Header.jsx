import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";
import { DesktopNav, MobileNav } from "./Navigation";
import { MobileMenuToggle, ThemeToggleButton } from "./HeaderControls";
import { ThemeToggle } from "@/components/common";

export const Header = ({
  theme,
  mobileMenuOpen,
  scrolled,
  onToggleMenu,
  onToggleTheme,
}) => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className={`bg-white/90 dark:bg-gray-800 backdrop-blur-lg border-b border-emerald-100/50 dark:border-emerald-900/30 sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-lg shadow-emerald-500/5" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <Logo />
          <DesktopNav />
          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <MobileMenuToggle isOpen={mobileMenuOpen} onClick={onToggleMenu} />
          </div>
        </div>

        <AnimatePresence>
          <MobileNav isOpen={mobileMenuOpen} onClose={onToggleMenu} />
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

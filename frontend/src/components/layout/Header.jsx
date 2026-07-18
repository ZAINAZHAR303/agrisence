"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ArrowUpRight, 
  Menu, 
  X, 
  ChevronDown, 
  Leaf, 
  Rocket, 
  LogOut, 
  User, 
  Settings 
} from "lucide-react";
import { navigationLinks } from "./siteConfig";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";

export default function Header() {
  const pathname = usePathname();
  const { user, token, setUser, setToken, logout } = useAuth();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => { 
    setMenuOpen(false); 
    setDropdownOpen(false);
  }, [pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const handleAuthSuccess = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
  };

  const handleProfileClick = () => {
    if (user) {
      setDropdownOpen(!dropdownOpen);
    } else {
      setShowAuthModal(true);
    }
  };

  const currentPage = navigationLinks.find((l) => isActive(l.href));

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 pt-4 pb-1">
          <div
            className={`relative flex items-center justify-between rounded-[2rem] px-5 py-3 transition-all duration-500 ${
              scrolled
                ? "border border-white/60 bg-white/80 shadow-[0_8px_32px_rgba(30,53,40,0.12),0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-2xl"
                : "border border-white/40 bg-white/60 shadow-[0_4px_24px_rgba(95,141,88,0.06)] backdrop-blur-xl"
            }`}
          >
            {/* Subtle top shine line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[2rem] bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent" />

            {/* ── Logo ─────────────────────────────────────── */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-emerald-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                  <Leaf className="h-5.5 w-5.5 fill-white text-emerald-600" />
                </div>
                <span className="font-display text-[1.2rem] font-extrabold tracking-tight text-slate-900">
                  AgriSense
                </span>
              </Link>

              {/* Vertical Divider */}
              <div className="h-6 w-px bg-slate-200/80 mx-2" />
            </div>

            {/* ── Desktop Nav ──────────────────────────────── */}
            <nav className="hidden items-center gap-2 lg:flex">
              {navigationLinks.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                      active
                        ? "text-emerald-800 bg-emerald-50"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/80"
                    }`}
                  >
                    <Icon className={`relative h-4.5 w-4.5 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                    <span className="relative">{item.label}</span>
                    
                    {active && (
                      <motion.div
                        layoutId="active-underline"
                        className="absolute bottom-[-14px] left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-full bg-emerald-700"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right side actions ───────────────────────── */}
            <div className="flex items-center gap-3">
              {/* Launch Assistant CTA */}
              <Link
                href="/assistant"
                className="hidden sm:inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "#2d6a4f",
                  boxShadow: "0 2px 10px rgba(45,106,79,0.22)",
                }}
              >
                <Rocket className="h-4 w-4" />
                Launch assistant
                <ArrowUpRight className="h-4 w-4 text-white/80" />
              </Link>

              {/* Profile Avatar / Login trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="flex items-center gap-1.5 focus:outline-none transition-transform active:scale-95"
                >
                  <div className="relative h-9 w-9 overflow-hidden rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center">
                    {user ? (
                      <>
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-emerald-700 text-white flex items-center justify-center text-sm font-bold">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {/* Status Green Dot */}
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </>
                    ) : (
                      <User className="h-4.5 w-4.5 text-slate-500" />
                    )}
                  </div>
                  {user && (
                    <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-200" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-64 rounded-2xl border border-slate-150 bg-white/95 p-2.5 shadow-[0_20px_50px_rgba(30,53,40,0.14)] backdrop-blur-xl z-50"
                    >
                      {/* User Info Header */}
                      <div className="px-3 py-2 border-b border-slate-100 mb-2">
                        <div className="text-sm font-extrabold text-slate-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {user.email}
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      <div className="space-y-1">
                        <Link
                          href="/social"
                          onClick={() => setDropdownOpen(false)}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <User className="h-4 w-4 text-slate-400" />
                          View Profile
                        </Link>
                        <button
                          type="button"
                          onClick={logout}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                        >
                          <LogOut className="h-4 w-4 text-rose-500" />
                          Log out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-700 transition hover:bg-slate-50 lg:hidden"
                aria-label="Toggle navigation"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={menuOpen ? "x" : "menu"}
                    initial={{ rotate: -60, opacity: 0, scale: 0.7 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 60, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.15 }}
                  >
                    {menuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile drawer ──────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/15 backdrop-blur-sm"
              aria-label="Close menu"
            />

            <motion.div
              initial={{ y: -12, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -12, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed inset-x-4 top-[76px] z-50 overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(30,53,40,0.16)] backdrop-blur-2xl"
            >
              {/* Current page label */}
              {currentPage && (
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3 bg-emerald-50/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                    {currentPage.label}
                  </span>
                </div>
              )}

              {/* Nav links */}
              <div className="p-3 space-y-1">
                {navigationLinks.map((item, i) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3.5 rounded-xl px-4 py-3 transition-all ${
                          active
                            ? "bg-emerald-50 text-emerald-900 border border-emerald-200/60"
                            : "text-slate-600 hover:bg-slate-50 border border-transparent"
                        }`}
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold">{item.label}</div>
                          <div className="text-xs text-slate-400 truncate">{item.description}</div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Mobile CTA */}
              <div className="border-t border-slate-100 p-3 flex flex-col gap-2">
                <Link
                  href="/assistant"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 bg-emerald-700 shadow-sm"
                >
                  <Rocket className="h-4 w-4" />
                  Launch assistant
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                {!user && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowAuthModal(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-slate-700 border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all"
                  >
                    <User className="h-4 w-4" />
                    Sign In / Register
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Global Auth Modal ────────────────────────────── */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}

"use client";

import { Inter, Roboto_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RiPlantLine } from "react-icons/ri";
import { Header } from "@/components/layout";
import { Footer } from "@/components/common";

// Improved font choices
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }) {
  const [theme, setTheme] = useState("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches)
      setTheme("dark");
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <html lang="en" className={theme === "dark" ? "dark" : ""}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} ${robotoMono.variable} font-sans antialiased bg-linear-to-br from-emerald-50/50 via-white to-green-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-50 transition-colors duration-500`}
      >
        {/* Header Component */}
        <Header
          theme={theme}
          mobileMenuOpen={mobileMenuOpen}
          scrolled={scrolled}
          onToggleMenu={toggleMobileMenu}
          onToggleTheme={toggleTheme}
        />

        {/* Main Content with subtle entrance animation */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-[calc(100vh-180px)] w-full  dark:bg-gray-900"
        >
          {children}
        </motion.main>

        {/* Footer Component */}
        <Footer />
      </body>
    </html>
  );
}
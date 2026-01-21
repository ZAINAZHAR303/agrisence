import { useState, useEffect } from "react";

/**
 * Hook to manage theme state
 * @returns {[string, Function]} Current theme and function to toggle
 */
export const useTheme = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return [theme, toggleTheme];
};

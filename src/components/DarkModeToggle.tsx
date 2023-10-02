import { useEffect, useState } from "react";
import { MdLightMode, MdModeNight } from "react-icons/md";

export default function DarkModeToggle({ className }: { className: string }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const localStorageTheme = window?.localStorage?.getItem("theme");
    const darkMode = localStorageTheme
      ? localStorageTheme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;

    setIsDarkMode(darkMode);

    if (!darkMode) {
      const root = document.documentElement;
      root.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () =>
    setIsDarkMode((prev) => {
      const newTheme = !!prev ? "light" : "dark";
      localStorage.setItem("theme", newTheme);

      const root = document.documentElement;
      if (prev) {
        root.classList.remove("dark");
      } else {
        root.classList.add("dark");
      }
      return !prev;
    });

  return (
    <button onClick={toggleDarkMode} type="button" className={className}>
      {isDarkMode ? <MdModeNight /> : <MdLightMode />}
    </button>
  );
}

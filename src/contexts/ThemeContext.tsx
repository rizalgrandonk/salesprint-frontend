import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type ThemeContextValue = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

const defaultValue: ThemeContextValue = {
  isDarkMode: true,
  toggleDarkMode: () => {},
};

export const ThemeContext = createContext<ThemeContextValue>(defaultValue);

export function useTheme() {
  return useContext(ThemeContext);
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
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
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

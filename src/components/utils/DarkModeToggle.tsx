import { useTheme } from "@/contexts/ThemeContext";
import { ReactNode, useEffect, useState } from "react";
import { MdLightMode, MdModeNight } from "react-icons/md";

type DarkModeToggleProps = {
  className: string;
  children?: ReactNode | ((dark: boolean) => ReactNode);
};

export default function DarkModeToggle({
  className,
  children,
}: DarkModeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  if (children && typeof children === "function") {
    return (
      <button onClick={toggleDarkMode} type="button" className={className}>
        {children(isDarkMode)}
      </button>
    );
  }

  if (children && typeof children !== "function") {
    return (
      <button onClick={toggleDarkMode} type="button" className={className}>
        {children}
      </button>
    );
  }

  return (
    <button onClick={toggleDarkMode} type="button" className={className}>
      {isDarkMode ? <MdModeNight /> : <MdLightMode />}
    </button>
  );
}

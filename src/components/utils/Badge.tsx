import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

const sizeClass = {
  sm: "text-xs h-6 px-2 gap-1",
  md: "text-sm h-7 px-3 gap-2",
  lg: "text-base h-8 px-4 gap-2",
};

const variantClass = {
  primary: "bg-primary",
  danger: "bg-rose-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
  success: "bg-green-500",
  secondary: "bg-gray-500",
  base: "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200",
  outline:
    "bg-gray-100 dark:bg-gray-900 border border-primary text-primary hover:text-gray-50 hover:bg-primary dark:hover:bg-primary",
};

const baseClass =
  "inline-flex items-center justify-center whitespace-nowrap text-gray-50 rounded";

type BadgeProps = PropsWithChildren & {
  variant?: keyof typeof variantClass;
  size?: keyof typeof sizeClass;
  className?: string;
};

export default function Badge({
  children,
  variant = "primary",
  size = "md",
  className,
}: BadgeProps) {
  return (
    <span
      className={twMerge(
        baseClass,
        sizeClass[size],
        variantClass[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

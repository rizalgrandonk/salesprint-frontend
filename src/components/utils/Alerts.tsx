import clsx from "clsx";
import { PropsWithChildren } from "react";
import { RiInformationLine } from "react-icons/ri";

const colorVariantClass = {
  info: "text-blue-800 border border-blue-300 bg-blue-50 dark:bg-blue-50/10 dark:text-blue-400 dark:border-blue-800",
  warning:
    "text-amber-800 border border-amber-300 bg-amber-50 dark:bg-amber-50/10 dark:text-amber-400 dark:border-amber-800",
  success:
    "text-green-800 border border-green-300 bg-green-50 dark:bg-green-50/10 dark:text-green-400 dark:border-green-800",
  danger:
    "text-red-800 border border-red-300 bg-red-50 dark:bg-red-50/10 dark:text-red-400 dark:border-red-800",
};

type AlertsProps = {
  variant?: keyof typeof colorVariantClass;
  size?: string;
} & PropsWithChildren;

export default function Alerts({ children, variant, size }: AlertsProps) {
  return (
    <div
      className={clsx(
        "flex items-center p-3 rounded gap-2",
        variant ? colorVariantClass[variant] : colorVariantClass["info"],
        size ? `text-${size}` : "text-sm"
      )}
      role="alert"
    >
      <span className="sr-only">Info</span>
      {children}
    </div>
  );
}

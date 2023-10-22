import { PropsWithChildren } from "react";

type BaseCardProps = PropsWithChildren & {
  className?: string;
};

export default function BaseCard({ className, children }: BaseCardProps) {
  return (
    <div
      className={`p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800 ${
        className ?? ""
      }`}
    >
      {children}
    </div>
  );
}

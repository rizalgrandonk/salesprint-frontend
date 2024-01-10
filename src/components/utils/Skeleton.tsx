import { twMerge } from "tailwind-merge";

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={twMerge(
        "bg-gray-300 dark:bg-gray-700 rounded animate-pulse",
        className
      )}
    />
  );
}

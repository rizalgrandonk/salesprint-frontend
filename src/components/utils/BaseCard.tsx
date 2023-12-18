import { HTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type BaseCardProps = HTMLAttributes<HTMLDivElement>;

const BaseCard = forwardRef<HTMLDivElement, BaseCardProps>(function BaseCard(
  { className, children, ...props }: BaseCardProps,
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      className={twMerge(
        "p-4 bg-white border border-gray-200 rounded shadow-sm dark:border-gray-700 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
        className
      )}
    >
      {children}
    </div>
  );
});

export default BaseCard;

import { twMerge } from "tailwind-merge";

type SpinnerProps = {
  className?: string;
};

export default function Spinner({ className }: SpinnerProps) {
  return (
    <svg
      className={twMerge("w-1/4 h-1/4 animate-rotate", className)}
      viewBox="0 0 50 50"
    >
      <circle
        className="animate-dash stroke-current"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="6"
      ></circle>
    </svg>
  );
}

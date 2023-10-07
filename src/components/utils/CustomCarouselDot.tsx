import type { DotProps } from "react-multi-carousel";

export default function CustomCarouselDot({ onClick, ...rest }: DotProps) {
  const { active } = rest;
  return (
    <button
      className={`h-3 mx-1 transition-all ${
        active ? "w-8 bg-primary" : "w-4 bg-gray-400"
      }`}
      onClick={() => onClick && onClick()}
    ></button>
  );
}

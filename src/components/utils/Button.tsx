import Link from "next/link";
import { PropsWithChildren } from "react";
import { IconType } from "react-icons";

type ButtonProps = {
  href?: string;
  size?: keyof typeof sizeClass;
  variant?: keyof typeof variantClass;
} & PropsWithChildren;

const sizeClass = {
  // xs: "text-xs py-2 px-3",
  sm: "text-sm h-9 px-4",
  md: "text-base h-10 px-6",
  lg: "text-lg h-11 px-8",
  // xl: "text-xl py-4 px-6",
};

const variantClass = {
  primary: "bg-primary",
  danger: "bg-rose-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
  success: "bg-green-500",
};

export default function Button({ children, href, size, variant }: ButtonProps) {
  const selectedVariantClass = variant
    ? variantClass[variant]
    : variantClass["primary"];
  const selectedSizeClass = size ? sizeClass[size] : sizeClass["md"];

  const className = `inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-gray-50 rounded hover:bg-opacity-90 transition-all ${selectedVariantClass} ${selectedSizeClass}`;

  if (href) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }
  return <button className={className}>{children}</button>;
}

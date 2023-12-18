import Link from "next/link";
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  PropsWithChildren,
  forwardRef,
} from "react";
import { IconType } from "react-icons";
import { twMerge } from "tailwind-merge";

const sizeClass = {
  // xs: "text-xs py-2 px-3",
  sm: "text-xs h-8 px-4",
  md: "text-sm h-9 px-6",
  lg: "text-base h-10 px-8",
  // xl: "text-xl py-4 px-6",
};

const variantClass = {
  primary: "bg-primary",
  danger: "bg-rose-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
  success: "bg-green-500",
  secondary: "bg-gray-500",
  outline:
    "bg-gray-100 dark:bg-gray-900 border border-primary text-primary hover:text-gray-50 hover:bg-primary dark:hover:bg-primary",
};

const buttonBaseClass =
  "items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-gray-50 rounded hover:bg-opacity-90 transition-all duration-100";

type BtnProps = /*(AnchorHTMLAttributes<HTMLAnchorElement> |)*/ {
  href?: string;
  size?: keyof typeof sizeClass;
  variant?: keyof typeof variantClass;
  fullWidth?: boolean;
  isLoading?: boolean;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & BtnProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant,
      size,
      fullWidth,
      className,
      children,
      isLoading,
      ...props
    }: ButtonProps,
    ref
  ) {
    const selectedVariantClass = variant
      ? variantClass[variant]
      : variantClass["primary"];
    const selectedSizeClass = size ? sizeClass[size] : sizeClass["md"];

    const buttonClass = twMerge(
      fullWidth ? "flex w-full" : "inline-flex",
      buttonBaseClass,
      selectedVariantClass,
      selectedSizeClass,
      className
    );

    return (
      <button ref={ref} {...props} className={buttonClass}>
        {!!isLoading ? (
          <>
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-t-2 border-white mr-4" />
            {"Loading"}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  BtnProps & { href: string };

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  function ButtonLink(
    {
      variant,
      size,
      fullWidth,
      className,
      children,
      isLoading,
      ...props
    }: ButtonLinkProps,
    ref
  ) {
    const selectedVariantClass = variant
      ? variantClass[variant]
      : variantClass["primary"];
    const selectedSizeClass = size ? sizeClass[size] : sizeClass["md"];

    const buttonClass = twMerge(
      fullWidth ? "flex w-full" : "inline-flex",
      buttonBaseClass,
      selectedVariantClass,
      selectedSizeClass,
      className
    );

    return (
      <Link ref={ref} {...props} className={buttonClass}>
        {!!isLoading ? (
          <>
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-t-2 border-white mr-4" />
            {"Loading"}
          </>
        ) : (
          children
        )}
      </Link>
    );
  }
);

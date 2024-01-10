import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  Fragment,
  PropsWithChildren,
  forwardRef,
} from "react";
import { IconType } from "react-icons";
import { MdArrowDropDown, MdKeyboardArrowDown } from "react-icons/md";
import { twMerge } from "tailwind-merge";

const sizeClass = {
  sm: "text-xs h-8 px-4 gap-1",
  md: "text-sm h-9 px-6 gap-2",
  lg: "text-base h-10 px-8 gap-2",
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
    "bg-transparent border border-primary text-primary hover:text-gray-50 hover:bg-primary dark:hover:bg-primary",
};

const buttonBaseClass =
  "items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-gray-50 rounded hover:bg-opacity-90 dark:hover:bg-opacity-90 transition-all duration-100";

type BtnProps = {
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

type ButtonMenuProps = BtnProps & {
  title: string;
  options: {
    title: string;
    onClick?: () => void;
  }[];
  className?: string;
};

export function ButtonMenu({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  title,
  options,
}: ButtonMenuProps) {
  const buttonClass = twMerge(
    fullWidth ? "flex w-full" : "inline-flex",
    buttonBaseClass,
    variantClass[variant],
    sizeClass[size],
    className
  );
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className={buttonClass}>
        <span>{title}</span>
        <MdKeyboardArrowDown className="text-xl" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <Menu.Items className="z-20 absolute right-0 top-full w-48 my-2 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600">
          {options.map((option, index) => (
            <Menu.Item key={option.title + index}>
              <button
                onClick={option.onClick}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                {option.title}
              </button>
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

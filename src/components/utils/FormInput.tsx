import { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import { MdWarningAmber } from "react-icons/md";
import { twMerge } from "tailwind-merge";

type FormInputType = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label?: string;
  error?: string;
  classNameLabel?: string;
  classNameError?: string;
  classNameContainer?: string;
  elementLeft?: ReactNode;
  elementRight?: ReactNode;
  info?: ReactNode;
};

const FormInput = forwardRef<HTMLInputElement, FormInputType>(
  function FormInput(
    {
      id,
      label,
      name,
      classNameLabel,
      elementLeft,
      className,
      elementRight,
      error,
      info,
      classNameError,
      classNameContainer,
      ...props
    }: FormInputType,
    ref
  ) {
    return (
      <div className={twMerge("space-y-1", classNameContainer)}>
        {!!label && (
          <label
            htmlFor={id}
            className={twMerge(
              "text-gray-600 dark:text-gray-200",
              classNameLabel
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {!!elementLeft && (
            <div className="absolute inset-y-0 left-0 flex items-center h-4/6 px-2 pointer-events-none border-r border-gray-400 dark:border-gray-500 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {elementLeft}
            </div>
          )}
          <input
            ref={ref}
            {...props}
            name={name || id}
            id={id}
            className={twMerge(
              "bg-inherit block w-full px-3 py-2 text-gray-700 placeholder-gray-400 border border-gray-400 rounded dark:placeholder-gray-500 dark:text-gray-300 dark:border-gray-500 focus:border-primary dark:focus:border-primary focus:ring-primary focus:outline-none focus:ring focus:ring-opacity-40 disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:text-gray-500 dark:disabled:bg-gray-800 disabled:cursor-not-allowed",
              className,
              !!elementLeft ? "pl-12" : "",
              !!elementRight ? "pr-12" : "",
              !!error ? "border-rose-500 dark:border-rose-500" : ""
            )}
          />
          {!!elementRight && (
            <div className="absolute inset-y-0 right-0 flex items-center h-4/6 px-2 pointer-events-none border-l border-gray-400 dark:border-gray-500 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {elementRight}
            </div>
          )}
        </div>
        {!!info && <div>{info}</div>}
        {!!error && (
          <span
            className={twMerge(
              "text-sm text-rose-500 inline-flex items-center gap-1",
              classNameError
            )}
          >
            <MdWarningAmber />
            {error}
          </span>
        )}
      </div>
    );
  }
);

export default FormInput;

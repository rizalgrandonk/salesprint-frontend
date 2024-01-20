import { ReactNode, TextareaHTMLAttributes, forwardRef } from "react";
import { MdWarningAmber } from "react-icons/md";
import { twMerge } from "tailwind-merge";

type FormAreaType = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  error?: string;
  classNameLabel?: string;
  classNameError?: string;
  info?: ReactNode;
};

const FormArea = forwardRef<HTMLTextAreaElement, FormAreaType>(
  function FormArea(
    {
      id,
      label,
      name,
      classNameLabel,
      className,
      error,
      info,
      classNameError,
      ...props
    }: FormAreaType,
    ref
  ) {
    return (
      <div className="space-y-1">
        <label
          htmlFor={id}
          className={twMerge(
            "text-gray-600 dark:text-gray-200",
            classNameLabel
          )}
        >
          {label}
        </label>
        <div className="relative">
          <textarea
            ref={ref}
            {...props}
            name={name || id}
            id={id}
            className={twMerge(
              "bg-inherit block w-full px-4 py-2 text-gray-700 placeholder-gray-400 border border-gray-400 rounded dark:placeholder-gray-500 dark:text-gray-300 dark:border-gray-500 focus:border-primary dark:focus:border-primary focus:ring-primary focus:outline-none focus:ring focus:ring-opacity-40 disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:text-gray-500 dark:disabled:bg-gray-800 disabled:cursor-not-allowed",
              className,
              !!error ? "border-rose-500 dark:border-rose-500" : ""
            )}
          />
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

export default FormArea;

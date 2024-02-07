import { ReactNode, SelectHTMLAttributes, forwardRef } from "react";
import { MdWarningAmber } from "react-icons/md";
import { twMerge } from "tailwind-merge";

type FormSelectType = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label?: string;
  error?: string;
  classNameLabel?: string;
  classNameError?: string;
  classNameContainer?: string;
  elementLeft?: ReactNode;
  elementRight?: ReactNode;
  info?: ReactNode;
  options?: { title: string; value: string }[];
};

const FormSelect = forwardRef<HTMLSelectElement, FormSelectType>(
  function FormSelect(
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
      options = [],
      ...props
    }: FormSelectType,
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
            <div className="absolute inset-y-0 left-0 flex items-center h-4/6 pl-4 pr-3 pointer-events-none border-r border-gray-400 dark:border-gray-500 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {elementLeft}
            </div>
          )}
          <select
            ref={ref}
            {...props}
            name={id}
            id={id}
            className={twMerge(
              "bg-inherit text-gray-700 dark:text-gray-300 block w-full px-4 py-2 placeholder-gray-400 border border-gray-400 rounded dark:placeholder-gray-500 dark:border-gray-500 focus:border-primary dark:focus:border-primary focus:ring-primary focus:outline-none focus:ring focus:ring-opacity-40 disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:text-gray-500 dark:disabled:bg-gray-800 cursor-pointer disabled:cursor-not-allowed",
              className,
              !!elementLeft ? "pl-14" : "",
              !!elementRight ? "pr-14" : "",
              !!error ? "border-rose-500 dark:border-rose-500" : ""
            )}
          >
            <option value="">{props.placeholder || "Pilih"}</option>
            {options.map((option, index) => (
              <option key={option.value + index} value={option.value}>
                {option.title}
              </option>
            ))}
          </select>
          {!!elementRight && (
            <div className="absolute inset-y-0 right-0 flex items-center h-4/6 pr-4 pl-3 pointer-events-none border-l border-gray-400 dark:border-gray-500 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
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

export default FormSelect;

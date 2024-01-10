import { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import { MdWarningAmber } from "react-icons/md";
import { twMerge } from "tailwind-merge";

type FormInputType = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label?: string;
  error?: string;
  labelClassName?: string;
  errorClassName?: string;
  leftEl?: ReactNode;
  rightEl?: ReactNode;
  info?: ReactNode;
};

const FormInput = forwardRef<HTMLInputElement, FormInputType>(
  function FormInput(props: FormInputType, ref) {
    return (
      <div className="space-y-1">
        {!!props.label && (
          <label
            htmlFor={props.id}
            className={twMerge(
              "text-gray-600 dark:text-gray-200",
              props.labelClassName
            )}
          >
            {props.label}
          </label>
        )}
        <div className="relative">
          {!!props.leftEl && (
            <div className="absolute inset-y-0 left-0 flex items-center h-4/6 pl-4 pr-3 pointer-events-none border-r border-gray-400 dark:border-gray-500 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {props.leftEl}
            </div>
          )}
          <input
            ref={ref}
            {...props}
            name={props.name || props.id}
            id={props.id}
            className={twMerge(
              "bg-inherit block w-full px-3 py-2 text-gray-700 placeholder-gray-400 border border-gray-400 rounded dark:placeholder-gray-500 dark:text-gray-300 dark:border-gray-500 focus:border-primary dark:focus:border-primary focus:ring-primary focus:outline-none focus:ring focus:ring-opacity-40 disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:text-gray-500 dark:disabled:bg-gray-800",
              props.className,
              !!props.leftEl ? "pl-14" : "",
              !!props.rightEl ? "pr-14" : "",
              !!props.error ? "border-rose-500 dark:border-rose-500" : ""
            )}
          />
          {!!props.rightEl && (
            <div className="absolute inset-y-0 right-0 flex items-center h-4/6 pl-3 pr-4 pointer-events-none border-l border-gray-400 dark:border-gray-500 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {props.rightEl}
            </div>
          )}
        </div>
        {!!props.info && <div>{props.info}</div>}
        {!!props.error && (
          <span
            className={twMerge(
              "text-sm text-rose-500 inline-flex items-center gap-1",
              props.errorClassName
            )}
          >
            <MdWarningAmber />
            {props.error}
          </span>
        )}
      </div>
    );
  }
);

export default FormInput;

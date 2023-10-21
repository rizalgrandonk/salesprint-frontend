import clsx from "clsx";
import { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import { MdWarning, MdWarningAmber } from "react-icons/md";

type FormInputType = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  leftel?: ReactNode;
};

const FormInput = forwardRef<HTMLInputElement, FormInputType>(
  function FormInput(props: FormInputType, ref) {
    return (
      <div className="space-y-1">
        <label htmlFor={props.id} className="text-gray-600 dark:text-gray-200">
          {props.label}
        </label>
        <div className="relative">
          {!!props.leftel && (
            <div className="absolute inset-y-0 left-0 flex items-center h-4/6 pl-4 pr-3 pointer-events-none border-r border-gray-400 dark:border-gray-500 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {props.leftel}
            </div>
          )}
          <input
            ref={ref}
            {...props}
            name={props.id}
            id={props.id}
            className={clsx(
              "bg-inherit block w-full px-4 py-2 text-gray-700 placeholder-gray-400 border border-gray-400 rounded-md dark:placeholder-gray-500 dark:text-gray-300 dark:border-gray-500 focus:border-primary dark:focus:border-primary focus:ring-primary focus:outline-none focus:ring focus:ring-opacity-40",
              { "pl-14": !!props.leftel }
            )}
          />
        </div>
        {!!props.error && (
          <span className="text-sm text-rose-500 inline-flex items-center gap-1">
            <MdWarningAmber />
            {props.error}
          </span>
        )}
      </div>
    );
  }
);

export default FormInput;

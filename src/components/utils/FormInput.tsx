import { InputHTMLAttributes, forwardRef } from "react";
import { MdWarning, MdWarningAmber } from "react-icons/md";

type FormInputType = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

const FormInput = forwardRef<HTMLInputElement, FormInputType>(
  (props: FormInputType, ref) => {
    return (
      <div className="space-y-2">
        <label htmlFor={props.id} className="text-gray-600 dark:text-gray-200">
          {props.label}
        </label>
        <input
          ref={ref}
          {...props}
          name={props.id}
          id={props.id}
          className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md dark:placeholder-gray-500 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-primary dark:focus:border-primary focus:ring-primary focus:outline-none focus:ring focus:ring-opacity-40"
        />
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

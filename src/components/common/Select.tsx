import React, { SelectHTMLAttributes } from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";
import { getNestedValue } from "../../utils";

export interface IOption {
  label: string;
  value: string;
  disabeld?: boolean;
  selected?: boolean;
}

interface ISelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "prefix"> {
  options: IOption[];
  label?: string;
  errors?: any;
  containerClassName?: string;
  register?: UseFormRegister<FieldValues>;
  prefix?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, ISelectProps>(
  ({ label, options, errors, required, containerClassName, prefix, ...props }, ref) => {
    const error =
      (props.name && errors && getNestedValue(errors, props.name)?.message) || "";

    return (
      <div className={`flex flex-col gap-1 ${containerClassName || ""}`}>
        {label && (
          <label className={`font-bold`} htmlFor={props.id || ""}>
            {label}
            {required && <span className="text-error"> *</span>}
          </label>
        )}

        <div className="relative w-full min-w-full">
          {prefix !== undefined && prefix !== null && (
            <span
              className={`
                absolute left-3 top-1/2 -translate-y-1/2
                flex items-center justify-center
                text-base-content/60
                pointer-events-none
              `}
            >
              {prefix}
            </span>
          )}

          <select
            {...props}
            ref={ref}
            className={`
              select select-bordered w-full max-w-xs
              rounded-xl min-h-max h-10 min-w-full
              bg-transparent
              ${prefix !== undefined && prefix !== null ? "pl-10" : ""}
              ${props.className}
              ${error && "input-error"}
            `}
          >
            {options.map((option, index) => {
              return (
                <option
                  key={`option-${option.value}-${index}`}
                  disabled={option.disabeld}
                  selected={option.selected}
                  value={option.value}
                >
                  {option.label}
                </option>
              );
            })}
          </select>
        </div>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };

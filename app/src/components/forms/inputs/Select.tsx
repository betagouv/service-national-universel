import React, { forwardRef } from "react";
import Label from "../layout/Label";
import ErrorMessage from "../ErrorMessage";

type Props = {
  label?: string;
  className?: string;
  name?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  error?: string | null;
  children: React.ReactNode;
  [key: string]: any;
};

const Select = forwardRef<HTMLSelectElement, Props>(function Select(props, ref) {
  const { label, className, error, children, ...rest } = props;
  return (
    <div className={`mb-[1rem] ${className}`}>
      <Label title={label} hasError={!!error}>
        <select className="-mx-1 w-full bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:text-gray-500" ref={ref} {...rest}>
          {children}
        </select>
      </Label>
      <ErrorMessage error={error} />
    </div>
  );
});

export default Select;

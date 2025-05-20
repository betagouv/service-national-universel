import React, { forwardRef } from "react";
import Label from "../layout/Label";
import ErrorMessage from "../ErrorMessage";

type Props = {
  label?: string;
  className?: string;
  error?: string;
  resize?: boolean;
  [key: string]: any;
};

const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(props, ref) {
  const { label, className, error, resize = false, ...rest } = props;
  return (
    <div className={`mb-[1rem] ${className}`}>
      <Label title={label} hasError={!!error}>
        <textarea
          className={`w-full bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:text-gray-400 ${resize ? "" : "resize-none"}`}
          {...rest}
          ref={ref}
        />
      </Label>
      <ErrorMessage error={error} />
    </div>
  );
});

export default Textarea;

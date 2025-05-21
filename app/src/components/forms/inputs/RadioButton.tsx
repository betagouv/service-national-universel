import React, { forwardRef } from "react";

type Props = {
  label?: string;
  [key: string]: any;
};

const RadioButton = forwardRef<HTMLInputElement, Props>(function RadioButton(props, ref) {
  const { label, ...rest } = props;
  return (
    <label className="flex items-center gap-2">
      <input type="radio" className="form-radio text-blue-600" ref={ref} {...rest} />
      <span className="text-base font-normal">{label}</span>
    </label>
  );
});

export default RadioButton;

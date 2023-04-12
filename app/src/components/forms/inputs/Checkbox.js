import React, { useEffect } from "react";

const Checkbox = ({
  label = "",
  className = "",
  validate = (value) => null,
  name = "",
  value = "",
  useCheckedAsValue = false,
  onChange = (value) => null,
  error = null,
  ...rest
}) => {
  if ("type" in rest) {
    throw new Error(`Checkbox component cannot handle a custom type.`);
  }

  useEffect(() => {
    if (validate) {
      validate(name);
    }
  }, [value]);

  const handleChange = (event) => {
    if (useCheckedAsValue) {
      onChange(event.target.checked);
    } else {
      onChange(event.target.value);
    }
  };

  const customValue = useCheckedAsValue ? { checked: value } : { value };

  return (
    <div className="mb-4">
      <label className={`flex gap-3 w-full py-2 rounded-lg m-0 ${error && "border-red-500"} ${className}`}>
        <input
          className="text-sm bg-white text-gray-900 disabled:text-gray-400 placeholder:text-gray-500 focus:outline-none accent-blue-600 rounded"
          name={name}
          type="checkbox"
          onChange={handleChange}
          {...customValue}
          {...rest}
        />
        {label ? <p className="text-sm leading-4 text-gray-700 disabled:text-gray-600">{label}</p> : null}
      </label>
      {error ? <p className="text-red-500 text-sm px-3 pt-1">{error}</p> : null}
    </div>
  );
};

export default Checkbox;

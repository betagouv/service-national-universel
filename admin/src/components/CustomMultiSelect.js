import React from "react";
import ReactSelect from "react-select";

const CustomMultiSelect = ({ form, field, options, className, placeholder, onChangeAdditionnel = null }) => {
  const onChange = (option) => {
    form.setFieldValue(
      field.name,
      option.map((item) => item.value),
    );
    onChangeAdditionnel(option.map((item) => item.value));
  };

  const getValue = () => {
    if (options) {
      return options.filter((option) => field.value.indexOf(option.value) >= 0);
    } else {
      return [];
    }
  };

  return <ReactSelect className={className} name={field.name} value={getValue()} onChange={onChange} placeholder={placeholder} options={options} isMulti />;
};

export default CustomMultiSelect;

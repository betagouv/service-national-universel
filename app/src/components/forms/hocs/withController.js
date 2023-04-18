import React from "react";
import { Controller } from "react-hook-form";

const withController = (InputComponent) => {
  const ControllerComponent = ({ name = "", control, rules = {}, ...rest }) => {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange: handleChange, onBlur: handleBlur } }) => <InputComponent value={value} onBlur={handleBlur} onChange={handleChange} {...rest} />}
        rules={rules}
      />
    );
  };

  return ControllerComponent;
};

export default withController;

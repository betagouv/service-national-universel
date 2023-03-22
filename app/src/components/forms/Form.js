import React from "react";
import ErrorMessage from "../../scenes/inscription2023/components/ErrorMessage";

const FormItem = ({ label = "", className = "", correction, error, children }) => {
  return (
    <div className={`mt-2 mb-4 ${className}`}>
      <label className={`my-2 whitespace-nowrap ${correction || error ? "text-[#CE0500]" : "text-[#3A3A3A]"}`}>{label}</label>
      {children}
      <ErrorMessage>{error}</ErrorMessage>
      <ErrorMessage>{correction}</ErrorMessage>
    </div>
  );
};

const Form = {
  Item: FormItem,
};

export default Form;

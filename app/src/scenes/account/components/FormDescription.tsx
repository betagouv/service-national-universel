import React from "react";

interface FormDescriptionProps {
  children?: React.ReactNode;
  className?: string;
}

const FormDescription: React.FC<FormDescriptionProps> = ({ children = null, className = "" }) => <p className={`mb-3 text-sm text-gray-500 ${className}`}>{children}</p>;

export default FormDescription;

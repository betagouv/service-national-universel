import React from "react";

export const Button = ({ loading, children, className, onClick, disabled, type = "button" }) => {
  return (
    <button className={`relative ${loading ? "loading" : ""} ${className}`} onClick={onClick} type={type} disabled={loading || disabled}>
      {children}
    </button>
  );
};

export const CancelButton = ({ loading, onClick, type, children, disabled, className = "" }) => (
  <Button className={`!border-2 border-red-500 bg-white  text-red-500 ${className}`} disabled={disabled} onClick={onClick} type={type} loading={loading}>
    {children}
  </Button>
);

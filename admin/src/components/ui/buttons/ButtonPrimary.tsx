import React, { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonPrimaryProps = {
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const ButtonPrimary = ({ className = "", children, ...rest }: ButtonPrimaryProps) => (
  <button
    className={`flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white drop-shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:hover:bg-blue-600 ${className}`}
    {...rest}>
    {children}
  </button>
);

export default ButtonPrimary;

import React from "react";
import { BiLoaderAlt } from "react-icons/bi";

const buttonVariants = {
  primary: {
    plain: "bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600",
    outlined: "bg-transparent text-blue-600 hover:text-blue-700 border-[1px] border-blue-600 hover:border-blue-700 disabled:hover:text-blue-600 disabled:hover:border-blue-600",
  },
  secondary: "bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:hover:bg-blue-200",
  danger: {
    plain: "bg-red-500 text-white hover:bg-red-600 disabled:hover:bg-red-500",
    outlined: "bg-transparent text-red-500 hover:text-red-600 border-[1px] border-red-500 hover:border-red-600 disabled:hover:text-red-500 disabled:hover:border-red-500",
  },
  light: "bg-white border-[1px] text-gray-700 border-gray-300 hover:bg-gray-50 disabled:hover:bg-white",
  // TODO add warning and success variants
};

const Button = ({
  variant = "primary",
  outlined = false,
  shape = "rouded",
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  className = "",
  children,
  ...rest
}) => {
  const displayMode = outlined ? "outlined" : "plain";

  const getButtonVariant = () => {
    const buttonVariant = buttonVariants[variant];
    if (typeof buttonVariant === "string") {
      return buttonVariant;
    }
    if (typeof buttonVariant !== "string" && displayMode in buttonVariant) {
      return buttonVariant[displayMode];
    }
    return buttonVariants.primary.plan;
  };

  const getButtonShape = () => {
    switch (shape) {
      case "circle":
        return "rounded-full";
      default:
        return "rounded-md";
    }
  };

  return (
    <button
      className={`flex justify-center items-center gap-2 px-3 py-2 drop-shadow-sm disabled:opacity-60 ${getButtonVariant()} ${getButtonShape()} ${
        iconPosition === "right" && "flex-row-reverse"
      } ${className}`}
      disabled={isLoading ? true : disabled}
      {...rest}>
      {isLoading ? <BiLoaderAlt className={`animate-spin}`} /> : icon}
      {children}
    </button>
  );
};

export default Button;

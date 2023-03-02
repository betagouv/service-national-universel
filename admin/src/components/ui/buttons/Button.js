import React from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { Link } from "react-router-dom";

const buttonVariants = {
  primary: {
    plain: "bg-blue-600 drop-shadow-sm text-white hover:bg-blue-700 disabled:hover:bg-blue-600",
    outlined:
      "bg-transparent drop-shadow-sm text-blue-600 hover:text-blue-700 border-[1px] border-blue-600 hover:border-blue-700 disabled:hover:text-blue-600 disabled:hover:border-blue-600",
    link: "bg-transparent text-blue-600 hover:text-blue-700 hover:underline disabled:hover:text-blue-600 disabled:hover:no-underline",
  },
  secondary: "bg-blue-100 drop-shadow-sm text-blue-700 hover:bg-blue-200 disabled:hover:bg-blue-200",
  danger: {
    plain: "bg-red-500 drop-shadow-sm text-white hover:bg-red-600 disabled:hover:bg-red-500",
    outlined:
      "bg-transparent drop-shadow-sm text-red-500 hover:text-red-600 border-[1px] border-red-500 hover:border-red-600 disabled:hover:text-red-500 disabled:hover:border-red-500",
  },
  success: {
    plain: "bg-green-500 drop-shadop-sm text-white hover:bg-green-600 disabled:hover:bg-green-500",
    outlined:
      "bg-transparent drop-shadow-sm text-green-500 hover:text-green-600 border-[1px] border-green-500 hover:border-green-600 disabled:hover:text-green-500 disabled:hover:border-green-500",
  },
  warning: {
    plain: "bg-yellow-500 drop-shadop-sm text-white hover:bg-yellow-600 disabled:hover:bg-yellow-500",
    outlined:
      "bg-transparent drop-shadow-sm text-yellow-500 hover:text-yellow-600 border-[1px] border-yellow-500 hover:border-yellow-600 disabled:hover:text-yellow-500 disabled:hover:border-yellow-500",
  },
  light: "bg-white border-[1px] drop-shadow-sm text-gray-700 border-gray-300 hover:bg-gray-50 disabled:hover:bg-white",
};

const Button = ({
  variant = "primary",
  displayMode = "plain",
  shape = "rouded",
  type = "button",
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  className = "",
  children,
  href,
  to,
  target = "_self",
  rel,
  onClick: handleClick,
  ...rest
}) => {
  const getButtonVariant = () => {
    const buttonVariant = buttonVariants[variant];
    if (typeof buttonVariant === "string") {
      return buttonVariant;
    }
    if (typeof buttonVariant !== "string" && displayMode in buttonVariant) {
      return buttonVariant[displayMode];
    }
    return buttonVariants.primary.plain;
  };

  const getButtonShape = () => {
    switch (shape) {
      case "circle":
        return "rounded-full";
      default:
        return "rounded-md";
    }
  };

  if (to) {
    return (
      <Link
        to={to}
        rel={rel}
        target={target}
        className={`flex justify-center items-center gap-2 px-3 py-2 disabled:opacity-60 ${getButtonVariant()} ${getButtonShape()} ${
          iconPosition === "right" && "flex-row-reverse"
        } ${className}`}
        {...rest}>
        {isLoading ? <BiLoaderAlt className="animate-spin" /> : icon}
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        rel={rel}
        target={target}
        className={`flex justify-center items-center gap-2 px-3 py-2 drop-shadow-sm disabled:opacity-60 ${getButtonVariant()} ${getButtonShape()} ${
          iconPosition === "right" && "flex-row-reverse"
        } ${className}`}
        {...rest}>
        {isLoading ? <BiLoaderAlt className="animate-spin" /> : icon}
        {children}
      </a>
    );
  }

  return (
    <button
      className={`flex justify-center items-center gap-2 px-3 py-2 drop-shadow-sm disabled:opacity-60 ${getButtonVariant()} ${getButtonShape()} ${
        iconPosition === "right" && "flex-row-reverse"
      } ${className}`}
      disabled={isLoading ? true : disabled}
      onClick={handleClick}
      type={type}
      {...rest}>
      {isLoading ? <BiLoaderAlt className="animate-spin" /> : icon}
      {children}
    </button>
  );
};

export default Button;

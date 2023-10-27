import React from "react";

type OwnProps = {
  title: string;
  type?: "primary" | "secondary" | "tertiary" | "wired" | "change" | "cancel";
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

export default function Button({
  title,
  type = "primary",
  className = "",
  leftIcon,
  rightIcon,
  disabled = false,
  onClick,
}: OwnProps) {
  const getStyles = () => {
    switch (type) {
      case "secondary":
        return {
          native: "h-[38px] py-[9px] text-sm",
          base: "text-gray-700 border border-gray-300 bg-white hover:bg-gray-50",
          disabled: "text-gray-700/60 border border-gray-300/60 bg-white/60",
        };
      case "tertiary":
        return {
          native: "h-8 py-2 text-xs",
          base: "text-blue-600 border border-blue-300 bg-blue-100 hover:bg-blue-200",
          disabled: "text-blue-600/60 border border-blue-300/60 bg-blue-100/60",
        };
      case "wired":
        return {
          native: "h-[38px] py-[9px] text-sm pr-3",
          base: "text-blue-600 border border-blue-300 hover:bg-blue-50",
          disabled: "text-blue-600/60 border border-blue-300/60",
        };
      case "change":
        return {
          native: "h-8 py-2 pl-2.5 text-xs",
          base: "text-blue-600 border border-blue-300 bg-blue-100 hover:bg-blue-200",
          disabled: "text-blue-600/60 border border-blue-300/60 bg-blue-100/60",
        };
      case "cancel":
        return {
          native: "h-8 py-2 text-xs",
          base: "text-gray-600 border border-gray-300 bg-gray100 hover:bg-gray-200",
          disabled: "text-gray-600/60 border border-gray-300/60 bg-gray-100/60",
        };
      default:
        return {
          native: "h-[38px] py-[9px] text-sm",
          base: "text-white bg-blue-600 hover:bg-blue-700",
          disabled: "text-white bg-blue-600/60",
        };
    }
  };

  const styles = getStyles();

  return (
    <button
      type="button"
      className={`flex w-fit gap-2 items-center rounded-md font-marianne px-[17px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
        styles.native
      } ${disabled ? styles.disabled : styles.base} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {leftIcon ? leftIcon : null}
      <span className="truncate">{title}</span>
      {rightIcon ? rightIcon : null}
    </button>
  );
}

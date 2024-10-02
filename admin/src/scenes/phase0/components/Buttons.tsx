import React, { ReactNode } from "react";
import { Spinner } from "reactstrap";

interface BorderButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  mode?: string;
}

export function BorderButton({ children, className = "", onClick = () => {}, href, target, rel, mode = "" }: BorderButtonProps) {
  let color;
  switch (mode) {
    case "blue":
      color = "bg-white text-[#1D4ED8] border-[#1D4ED8] hover:!bg-[#1D4ED8] hover:text-white";
      break;
    case "red":
      color = "bg-white text-[#EF4444] border-[#EF4444] hover:!bg-[#EF4444] hover:text-white";
      break;
    case "grey":
      color = "bg-white text-[#374151] border-gray-300 hover:!bg-gray-300 hover:text-white";
      break;
    default:
      color = "bg-white text-[#000091] border-[#000091] hover:!bg-[#000091] hover:text-white";
  }

  if (href) {
    return (
      <a
        className={`inline-flex cursor-pointer items-center justify-center whitespace-nowrap border-[1px] border-solid px-3 py-2 hover:border-[transparent] ${color} ${className}`}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}>
        {children}
      </a>
    );
  } else {
    return (
      <button
        className={`flex cursor-pointer items-center justify-center whitespace-nowrap rounded-[6px] border-[1px] px-3 py-2 hover:border-[transparent] ${color} ${className}`}
        onClick={onClick}>
        {children}
      </button>
    );
  }
}

export function PlainButton({ children, className = "", onClick = () => {}, spinner = false, mode = "blue", disabled = false }) {
  let color;
  switch (mode) {
    case "green":
      color = "bg-[#10B981] text-white hover:!text-[#10B981] hover:border-[#10B981] hover:bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]";
      break;
    case "red":
      color = "bg-[#EF4444] text-white hover:!text-[#EF4444] hover:border-[#EF4444] hover:bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]";
      break;
    case "white":
      color = "bg-[#FFFFFF] text-[#374151] hover:!text-[#FFFFFF] hover:border-[#374151] hover:bg-[#374151] shadow-[0px_4px_10px_3px_rgba(0,0,0,0.07)]";
      break;
    default:
      color = `bg-[#2563EB] text-white  shadow-[0px_1px_2px_rgba(0,0,0,0.05)] ${disabled ? "opacity-70" : "hover:!text-[#2563EB] hover:border-[#2563EB] hover:bg-white"}`;
  }
  return (
    <button
      disabled={disabled}
      className={`flex items-center justify-center whitespace-nowrap rounded-[6px] border-[1px] border-solid border-[transparent] px-3 py-2 ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      } ${color} ${className}`}
      onClick={onClick}>
      {spinner && <Spinner size="sm" style={{ borderWidth: "0.1em", marginRight: "0.5rem" }} />}
      {children}
    </button>
  );
}

export function Button({ children, className = "", onClick = () => {}, spinner = false, icon, href, target, rel }) {
  if (href) {
    return (
      <a
        className={`inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-[6px] border-[1px] border-solid border-[transparent] bg-[#FFFFFF] px-3 py-2 text-[#1F2937] hover:border-[#D1D5DB] ${className}`}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}>
        {icon && <icon.type {...icon.props} className={`mr-[8px] ${icon.props.className}`} />}
        {children}
      </a>
    );
  } else {
    return (
      <button
        className={`flex cursor-pointer items-center justify-center whitespace-nowrap rounded-[6px] border-[1px] border-solid border-[transparent] bg-[#FFFFFF] px-3 py-2 text-[#1F2937] hover:border-[#D1D5DB] ${className}`}
        onClick={onClick}>
        {spinner && <Spinner size="sm" style={{ borderWidth: "0.1em", marginRight: "0.5rem" }} />}
        {icon && <icon.type {...icon.props} className={`mr-[8px] ${icon.props.className}`} />}
        {children}
      </button>
    );
  }
}

export function RoundButton({ children, className = "", onClick = () => {}, spinner = false, icon, href, target, rel, mode = "blue", disabled = false }) {
  let color;

  switch (mode) {
    case "grey":
      color = `bg-[#F3F4F6] text-[#374151] ${disabled ? "opacity-70" : "hover:border-[#374151]"}`;
      break;
    default:
      color = `bg-[#DBEAFE] text-[#2563EB]  ${disabled ? "opacity-70" : "hover:border-[#2563EB]"}`;
      break;
  }

  if (href) {
    return (
      <a
        className={`inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-[6px] border-[1px] border-solid border-[transparent] px-3 py-2 ${color} ${className}`}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}>
        {icon && <icon.type {...icon.props} className={`mr-[8px] ${icon.props.className}`} />}
        {children}
      </a>
    );
  } else {
    return (
      <button
        disabled={disabled}
        className={`flex items-center justify-center whitespace-nowrap rounded-[100px] border-[1px] border-solid border-[transparent] px-[17px] py-[8px] ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        } ${color} ${className}`}
        onClick={onClick}>
        {spinner && <Spinner size="sm" style={{ borderWidth: "0.1em", marginRight: "0.5rem" }} />}
        {icon && <icon.type {...icon.props} className={`mr-[7px] ${icon.props.className}`} />}
        {children}
      </button>
    );
  }
}

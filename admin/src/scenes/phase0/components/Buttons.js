import React from "react";
import { Spinner } from "reactstrap";

export function BorderButton({ children, className = "", onClick = () => {}, href, target, rel }) {
  if (href) {
    return (
      <a
        className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-2 cursor-pointer bg-white text-[#000091] border-[1px] border-[#000091] border-solid hover:!bg-[#000091] hover:text-white hover:border-[transparent] ${className}`}
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
        className={`flex items-center justify-center whitespace-nowrap px-3 py-2 cursor-pointer bg-white text-[#000091] border-[1px] border-[#000091] border-solid hover:!bg-[#000091] hover:text-white hover:border-[transparent] ${className}`}
        onClick={onClick}>
        {children}
      </button>
    );
  }
}

export function PlainButton({ children, className = "", onClick = () => {}, spinner = false }) {
  return (
    <button
      className={`flex items-center justify-center whitespace-nowrap px-3 py-2 cursor-pointer bg-[#2563EB] text-white border-[transparent] border-[1px] border-solid shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[6px] hover:!text-[#2563EB] hover:bg-white hover:border-[#2563EB] ${className}`}
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
        className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-2 cursor-pointer bg-[#FFFFFF] text-[#1F2937] border-[transparent] border-[1px] border-solid rounded-[6px] hover:border-[#D1D5DB] ${className}`}
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
        className={`flex items-center justify-center whitespace-nowrap px-3 py-2 cursor-pointer bg-[#FFFFFF] text-[#1F2937] border-[transparent] border-[1px] border-solid rounded-[6px] hover:border-[#D1D5DB] ${className}`}
        onClick={onClick}>
        {spinner && <Spinner size="sm" style={{ borderWidth: "0.1em", marginRight: "0.5rem" }} />}
        {icon && <icon.type {...icon.props} className={`mr-[8px] ${icon.props.className}`} />}
        {children}
      </button>
    );
  }
}

export function RoundButton({ children, className = "", onClick = () => {}, spinner = false, icon, href, target, rel }) {
  if (href) {
    return (
      <a
        className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-2 cursor-pointer bg-[#FFFFFF] text-[#1F2937] border-[transparent] border-[1px] border-solid rounded-[6px] hover:border-[#D1D5DB] ${className}`}
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
        className={`flex items-center justify-center whitespace-nowrap px-[17px] py-[8px] cursor-pointer bg-[#DBEAFE] text-[#2563EB] border-[transparent] border-[1px] border-solid rounded-[100px] hover:border-[#2563EB] ${className}`}
        onClick={onClick}>
        {spinner && <Spinner size="sm" style={{ borderWidth: "0.1em", marginRight: "0.5rem" }} />}
        {icon && <icon.type {...icon.props} className={`mr-[7px] ${icon.props.className}`} />}
        {children}
      </button>
    );
  }
}

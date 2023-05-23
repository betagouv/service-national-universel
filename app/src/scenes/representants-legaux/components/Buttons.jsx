import React from "react";
import { Spinner } from "reactstrap";

export function BorderButton({ children, className = "", onClick = () => {}, href, target, rel }) {
  if (href) {
    return (
      <a
        className={`inline-flex cursor-pointer items-center justify-center whitespace-nowrap border-[1px] border-solid border-[#000091] bg-white px-3 py-2 text-[#000091] hover:border-[transparent] hover:!bg-[#000091] hover:text-white ${className}`}
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
        className={`flex cursor-pointer items-center justify-center whitespace-nowrap border-[1px] border-solid border-[#000091] bg-white px-3 py-2 text-[#000091] hover:border-[transparent] hover:!bg-[#000091] hover:text-white ${className}`}
        onClick={onClick}>
        {children}
      </button>
    );
  }
}

export function PlainButton({ children, className = "", onClick = () => {}, spinner = false }) {
  return (
    <button
      className={`flex cursor-pointer items-center justify-center whitespace-nowrap border-[1px] border-solid border-[transparent] bg-[#000091] px-3 py-2 text-white hover:border-[#000091] hover:bg-white hover:!text-[#000091] ${className}`}
      onClick={onClick}>
      {spinner && <Spinner size="sm" style={{ borderWidth: "0.1em", marginRight: "0.5rem" }} />}
      {children}
    </button>
  );
}

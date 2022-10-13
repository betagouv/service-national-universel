import React from "react";

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

export function PlainButton({ children, className = "", onClick = () => {} }) {
  return (
    <button
      className={`flex items-center justify-center whitespace-nowrap px-3 py-2 cursor-pointer bg-[#000091] text-white border-[transparent] border-[1px] border-solid hover:!text-[#000091] hover:bg-white hover:border-[#000091] ${className}`}
      onClick={onClick}>
      {children}
    </button>
  );
}

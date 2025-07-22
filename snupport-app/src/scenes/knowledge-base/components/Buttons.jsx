import React from "react";
import Loader from "../../../components/Loader";

// padding: 0.5em 3em;

// display: flex;
// align-items: center;
// justify-content: center;

// background-color: #5145cc;

// color: white;
// font-size: 1rem;
// font-weight: 700;

// border: 2px solid #5145cc;
// border-radius: 10px;
// box-shadow: rgb(0 0 0 / 10%) 0px 10px 15px -3px, rgb(0 0 0 / 5%) 0px 4px 6px -2px;

// opacity: 1;
// cursor: pointer;

export const Button = ({ loading, children, className = "", onClick, disabled, type = "button" }) => {
  return (
    <button
      className={
        "relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-snu-purple-300 bg-snu-purple-300 py-2 px-12 text-base font-bold text-white opacity-100 drop-shadow-md " +
        (loading ? "loading " : "") +
        className
      }
      onClick={onClick}
      type={type}
      disabled={loading || disabled}
    >
      {children}
      {!!loading && <Loader color="#bbbbbb" size={20} className="absolute inset-0" />}
    </button>
  );
};

export const NewButton = ({ loading, children, className = "", onClick, disabled, type = "button" }) => {
  return (
    <button
      className={"relative flex cursor-pointer items-center justify-center py-2 px-12 text-[22px] text-[#2563EB] drop-shadow-md " + (loading ? "loading " : "") + className}
      onClick={onClick}
      type={type}
      disabled={loading || disabled}
    >
      {children}
      {!!loading && <Loader color="#bbbbbb" size={20} className="absolute inset-0" />}
    </button>
  );
};

export const CancelButton = ({ loading, onClick, type, children, disabled, className = "" }) => (
  <Button className={`!border-2 !border-red-500 !bg-white !text-red-500 ${className}`} disabled={disabled} onClick={onClick} type={type} loading={loading}>
    {children}
  </Button>
);

export const OutlinedButton = ({ loading, onClick, type, children, disabled, className = "" }) => (
  <Button className={`!border-2 !bg-white !text-snu-purple-300 ${className}`} disabled={disabled} onClick={onClick} type={type} loading={loading}>
    {children}
  </Button>
);

import React from "react";
import { FiChevronLeft } from "react-icons/fi";

export default function SignupButtonContainer({ onClick, disabled = false, onClickPrevious }) {
  return (
    <div className="w-full mx-auto fixed md:relative bottom-0 left-0 bg-white shadow-ninaInverted md:shadow-none py-4 px-[1rem] md:px-0 ">
      <hr className="mb-8 h-px bg-gray-200 border-0 hidden md:block" />
      <div className="flex justify-end gap-2">
        {onClickPrevious && (
          <DSFRButton onClick={onClick} type="secondary" className="w-10">
            <FiChevronLeft className="text-[#000091] font-bold" />
          </DSFRButton>
        )}
        <DSFRButton onClick={onClick} disabled={disabled} type="primary" size="w-full md:w-auto">
          Continuer
        </DSFRButton>
      </div>
    </div>
  );
}

function DSFRButton({ children, onClick, disabled = false, type, size = "" }) {
  const color = (type) => {
    switch (type) {
      case "primary":
        return "bg-[#000091] text-[#f5f5fe] hover:bg-[#1212ff] active:bg-[#2323ff] disabled:bg-[#E5E5E5] disabled:text-[#929292]";
      case "secondary":
        return "border-[1px] border-[#000091]";
      default:
        return "";
    }
  };

  return (
    <button className={`flex items-center justify-center py-2 px-4 ${color(type)} ${size}}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

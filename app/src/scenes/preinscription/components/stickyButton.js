import React from "react";
import { FiChevronLeft } from "react-icons/fi";

export default function StickyButton({ text, onClick, onClickPrevious, disabled }) {
  return (
    <div className="fixed bottom-0 w-full z-50">
      <div className="flex flex-row shadow-ninaInverted p-4 bg-white gap-4">
        {onClickPrevious ? (
          <button className="flex items-center justify-center w-10 border-[1px] border-[#000091]" onClick={onClickPrevious}>
            <FiChevronLeft className="text-[#000091] font-bold" />
          </button>
        ) : null}
        <button
          className={`flex items-center justify-center p-2 w-full cursor-pointer ${disabled ? "bg-[#E5E5E5] text-[#929292]" : "bg-[#000091] text-white"}`}
          onClick={() => !disabled && onClick}>
          {text}
        </button>
      </div>
    </div>
  );
}

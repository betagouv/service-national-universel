import React from "react";
import { FiChevronLeft } from "react-icons/fi";

export default function SignupButtonContainer({ onClick, disabled, onClickPrevious }) {
  return (
    <div className="w-full mx-auto fixed md:relative bottom-0 left-0 bg-white shadow-ninaInverted md:shadow-none py-4 px-[1rem] md:px-0 ">
      <hr className="mb-8 h-px bg-gray-200 border-0 hidden md:block" />
      <div className="flex justify-end gap-2">
        {onClickPrevious && (
          <button className="flex items-center justify-center w-10 border-[1px] border-[#000091]" onClick={onClickPrevious} disabled={disabled}>
            <FiChevronLeft className="text-[#000091] font-bold" />
          </button>
        )}
        <button
          className="flex items-center justify-center py-2 px-4 w-full md:w-auto cursor-pointer aria-disabled:bg-[#E5E5E5] aria-disabled:text-[#929292] aria-disabled:cursor-not-allowed bg-[#000091] text-white"
          onClick={onClick}
          disabled={disabled}>
          Continuer
        </button>
      </div>
    </div>
  );
}

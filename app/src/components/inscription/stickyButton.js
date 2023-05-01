import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import useDetectKeyboardOpen from "use-detect-keyboard-open";

export default function StickyButton({ text, onClick, onClickPrevious = undefined, disabled = false }) {
  const isKeyboardOpen = useDetectKeyboardOpen();

  if (isKeyboardOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-0 z-50 w-full">
      <div className="flex flex-row gap-4 bg-white p-4 shadow-ninaInverted">
        {onClickPrevious ? (
          <button className="flex w-10 items-center justify-center border-[1px] border-[#000091]" onClick={onClickPrevious}>
            <FiChevronLeft className="font-bold text-[#000091]" />
          </button>
        ) : null}
        <button
          className={`flex w-full cursor-pointer items-center justify-center p-2 ${disabled ? "bg-[#E5E5E5] text-[#929292]" : "bg-[#000091] text-white"}`}
          onClick={() => !disabled && onClick()}>
          {text}
        </button>
      </div>
    </div>
  );
}

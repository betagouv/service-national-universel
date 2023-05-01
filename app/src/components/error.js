import React from "react";
import ErrorIcon from "../assets/icons/ErrorIcon";
import { IoCloseOutline } from "react-icons/io5";

export default function Error({ text, subText, onClose }) {
  return (
    <div className="mb-3 flex border-[1px] border-[#CE0500] ">
      <div className="bg-[#CE0500] py-4 px-2">
        <ErrorIcon />
      </div>
      <div className="flex w-full flex-col pt-2 pb-4 pl-3 pr-2">
        <div className="flex justify-end">
          <IoCloseOutline onClick={onClose} className="text-[#000091]" />
        </div>
        <div className="text-sm text-[#3A3A3A] ">{text}</div>
        {subText ? <div className="mt-2 text-sm text-[#3A3A3A] ">{subText}</div> : null}
      </div>
    </div>
  );
}

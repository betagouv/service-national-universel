import React from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";

export default function ErrorNotice({ text }: { text: string }) {
  return (
    <div className="bg-red-50 text-sm text-red-800 px-3 py-2.5 rounded-md flex gap-2">
      <div className="flex-none">
        <HiOutlineInformationCircle className="text-red-800 h-5 w-5 " />
      </div>
      {text}
    </div>
  );
}

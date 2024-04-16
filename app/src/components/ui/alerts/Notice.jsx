import React from "react";
import { RiInformationFill } from "react-icons/ri";

export default function Notice({ children }) {
  return (
    <div className="m-[1rem] md:m-[2rem] p-4 flex items-center border-2 border-yellow-500 bg-white rounded-md text-yellow-600">
      <RiInformationFill className="inline-block mr-4 h-6 w-6 flex-none" />
      {children}
    </div>
  );
}

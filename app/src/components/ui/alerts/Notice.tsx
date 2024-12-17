import React from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";

export default function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-md flex gap-3">
      <div className="flex-none">
        <HiOutlineInformationCircle className="text-blue-800 h-5 w-5" />
      </div>
      <div>{children}</div>
    </div>
  );
}

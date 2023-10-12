import React from "react";
import { IoWarningOutline } from "react-icons/io5";
import { HiOutlineInformationCircle, HiOutlineExclamationCircle } from "react-icons/hi";

export default function InfoMessage({ bg = "", Icon = null, message = "", data = null }) {
  if (data) {
    switch (data.priority) {
      case "normal":
        bg = "bg-blue-800";
        Icon = HiOutlineInformationCircle;
        break;
      case "important":
        bg = "bg-yellow-700";
        Icon = HiOutlineExclamationCircle;
        break;
      case "urgent":
        bg = "bg-red-800";
        Icon = IoWarningOutline;
        break;
      default:
        bg = "bg-blue-800";
        Icon = HiOutlineInformationCircle;
        break;
    }
    message = data.content;
  }
  return (
    <div className={`flex items-center gap-4 rounded-xl ${bg} p-4 text-base leading-5 text-white`}>
      <Icon className="h-10 w-10 text-white stroke-[1.5px]" />
      <span>{message}</span>
    </div>
  );
}

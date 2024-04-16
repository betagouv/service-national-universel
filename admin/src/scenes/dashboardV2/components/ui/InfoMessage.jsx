import React from "react";
import { HiInformationCircle, HiExclamationCircle, HiExclamation } from "react-icons/hi";
import classNames from "classnames";

export default function InfoMessage({ message, priority }) {
  let Icon = null;
  let bg = "";
  let text = "";
  let border = "";
  switch (priority) {
    case "normal":
      bg = "bg-sky-50";
      text = "text-sky-600";
      border = "border-sky-600";
      Icon = HiInformationCircle;
      break;
    case "important":
      bg = "bg-amber-50";
      text = "text-amber-600";
      border = "border-amber-600";
      Icon = HiExclamationCircle;
      break;
    case "urgent":
      bg = "bg-rose-50";
      text = "text-rose-600";
      border = "border-rose-600";
      Icon = HiExclamation;
      break;
  }
  const containerClasses = classNames("flex", "items-center", "gap-4", "h-14", bg, text, border, "p-4", "text-sm", "leading-5", "font-medium", "border-l-4");

  const iconClasses = classNames(text, "mt-1");
  return (
    <div className={containerClasses}>
      <Icon className={iconClasses} size={24} />
      <span>{message}</span>
    </div>
  );
}

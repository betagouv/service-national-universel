import React from "react";
import { HiInformationCircle, HiExclamationCircle, HiExclamation } from "react-icons/hi";
import cx from "classnames";

interface Props {
  message: string;
  priority?: "normal" | "important" | "urgent";
}

export default function InfoMessage({ message, priority }: Props) {
  let Icon = HiInformationCircle;
  switch (priority) {
    case "normal":
      Icon = HiInformationCircle;
      break;
    case "important":
      Icon = HiExclamationCircle;
      break;
    case "urgent":
      Icon = HiExclamation;
      break;
    default:
      Icon = HiInformationCircle;
  }
  return (
    <div
      className={cx("flex items-center gap-4 h-14 p-4 text-sm leading-5 font-medium border-l-4", {
        "bg-sky-50 text-sky-600 border-sky-600": priority === "normal",
        "bg-amber-50 text-amber-600 border-amber-600": priority === "important",
        "bg-rose-50 text-rose-600 border-rose-600": priority === "urgent",
      })}>
      <Icon
        className={cx("mt-1", {
          "text-sky-600": priority === "normal",
          "text-amber-600": priority === "important",
          "text-rose-600": priority === "urgent",
        })}
        size={24}
      />
      <span>{message}</span>
    </div>
  );
}

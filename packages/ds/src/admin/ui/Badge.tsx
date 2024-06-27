import React from "react";
import cx from "classnames";

type TStatus =
  | "none"
  | "DRAFT"
  | "CANCEL"
  | "REFUSED"
  | "IN_PROGRESS"
  | "WAITING_VALIDATION"
  | "WAITING_CORRECTION"
  | "VALIDATED"
  | "WAITING_LIST"
  | "secondary"
  | "primary";

type OwnProps = {
  title: React.ReactNode;
  status?: TStatus;
  mode?: "default" | "editable";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function Badge({
  title,
  status = "none",
  mode = "default",
  leftIcon,
  rightIcon,
  className = "",
  onClick,
}: OwnProps) {
  const styles = getStyles({ status, mode });

  if (mode === "editable") {
    return (
      <button
        type="button"
        className={cx(
          "flex items-center justify-center w-fit h-8 rounded-3xl py-1.5 gap-1.5 border-[1px] text-xs leading-5 font-[500] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
          {
            "px-3": !leftIcon && !rightIcon,
            "pl-[12px] pr-3 ": !!leftIcon,
            "pl-3 pr-[12px]": !!rightIcon,
          },
          styles,
          className,
        )}
        onClick={onClick}
      >
        {leftIcon}
        {typeof title === "string" ? (
          <span className="truncate">{title}</span>
        ) : (
          title
        )}
        {rightIcon}
      </button>
    );
  }

  return (
    <div
      className={cx(
        `flex items-center justify-center w-fit h-8 rounded-3xl px-3 py-1.5 gap-2 border-[1px] text-xs leading-5 font-[500]`,
        styles,
        className,
      )}
    >
      {leftIcon}
      {typeof title === "string" ? (
        <span className="truncate">{title}</span>
      ) : (
        title
      )}
      {rightIcon}
    </div>
  );
}

const getStyles = ({
  status,
  mode,
}: {
  status: OwnProps["status"];
  mode: OwnProps["mode"];
}) => {
  switch (status) {
    case "CANCEL":
      return cx("text-rose-500 bg-gray-50 border-gray-200", {
        "hover:border-gray-500": mode === "editable",
      });
    case "REFUSED":
      return cx("text-red-600 bg-red-50 border-red-200", {
        "hover:border-red-500": mode === "editable",
      });
    case "IN_PROGRESS":
      return cx("text-indigo-600 bg-indigo-50 border-indigo-300", {
        "hover:border-indigo-500": mode === "editable",
      });
    case "WAITING_VALIDATION":
      return cx("text-amber-600 bg-amber-50 border-amber-300", {
        "hover:border-amber-500": mode === "editable",
      });
    case "WAITING_CORRECTION":
      return cx("text-orange-600 bg-orange-50 border-orange-300", {
        "hover:border-orange-500": mode === "editable",
      });
    case "VALIDATED":
      return cx("text-emerald-600 bg-emerald-50 border-emerald-300", {
        "hover:border-emerald-500": mode === "editable",
      });
    case "WAITING_LIST":
      return cx("text-cyan-600 bg-cyan-50 border-cyan-300", {
        "hover:border-cyan-500": mode === "editable",
      });
    case "DRAFT":
      return cx("text-white bg-indigo-500 italic border-indigo-500", {
        "hover:border-indigo-500": mode === "editable",
      });
    case "primary":
      return cx("text-blue-600 bg-blue-50 border-blue-300", {
        "hover:border-blue-500": mode === "editable",
      });
    case "secondary":
      return cx("text-[#30345B] bg-[#EEEFF5] border-[#B3B5CD]");
    default:
      return cx("text-gray-600 bg-gray-50 border-gray-200", {
        "hover:border-gray-500": mode === "editable",
      });
  }
};

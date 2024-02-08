import React from "react";

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
  const styles = getStyles({ status });

  if (mode === "editable") {
    return (
      <button
        type="button"
        className={`flex items-center justify-center w-fit h-8 rounded-3xl px-3 py-1.5 gap-2 border-[1px] text-xs leading-5 font-[500] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${styles} ${className} `}
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
      className={`flex items-center justify-center w-fit h-8 rounded-3xl px-3 py-1.5 gap-2 border-[1px] text-xs leading-5 font-[500] ${styles} ${className}`}
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

const getStyles = ({ status }: { status: TStatus }) => {
  switch (status) {
    case "CANCEL":
      return "text-rose-500 bg-gray-50 border-gray-200";
    case "REFUSED":
      return "text-red-600 bg-red-50 border-red-200";
    case "IN_PROGRESS":
      return "text-indigo-600 bg-indigo-50 border-indigo-300";
    case "WAITING_VALIDATION":
      return "text-yellow-600 bg-yellow-50 border-yellow-300";
    case "WAITING_CORRECTION":
      return "text-orange-600 bg-orange-50 border-orange-300";
    case "VALIDATED":
      return "text-green-600 bg-green-50 border-green-300";
    case "WAITING_LIST":
      return "text-cyan-600 bg-cyan-50 border-cyan-300";
    case "DRAFT":
      return "text-white bg-indigo-500 italic border-indigo-500";
    case "primary":
      return "text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-100";
    case "secondary":
      return "text-[#30345B] bg-[#EEEFF5] border-[#B3B5CD]";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

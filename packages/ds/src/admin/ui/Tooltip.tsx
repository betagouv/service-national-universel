import React, { ReactNode } from "react";
import ReactTooltip from "react-tooltip";
import cx from "classnames";

interface TooltipProps {
  id: string;
  title?: string;
  className?: string;
  tooltipClassName?: string;
  children: ReactNode;
  disabled?: boolean;
}

export default function Tooltip({
  id,
  title,
  disabled = false,
  children,
  className,
  tooltipClassName,
}: TooltipProps) {
  const tooltipId = `tooltip-${id}`;

  return (
    <div className={cx(className)}>
      <button type="button" data-tip={title} data-for={tooltipId}>
        {children}
      </button>

      <ReactTooltip
        id={tooltipId}
        className={cx(
          "bg-white !opacity-100 shadow-xl rounded-xl",
          tooltipClassName,
        )}
        arrowColor="white"
        disable={disabled}
      >
        <div className="flex max-w-[600px] flex-row flex-wrap gap-2 rounded-xl">
          <div className="rounded bg-white py-2 px-6 text-gray-500">
            {title}
          </div>
        </div>
      </ReactTooltip>
    </div>
  );
}
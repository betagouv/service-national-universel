import React, { ReactNode, useId, useEffect } from "react";
import ReactTooltip from "react-tooltip";
import cx from "classnames";

interface TooltipProps {
  id?: string;
  title: string;
  className?: string;
  tooltipClassName?: string;
  children: ReactNode;
  disabled?: boolean;
  isModal?: boolean;
}

export default function Tooltip({
  id,
  title,
  disabled = false,
  children,
  className,
  tooltipClassName,
  isModal = false,
}: TooltipProps) {
  const alternativeId = useId();
  const tooltipId = id ? `tooltip-${id}` : alternativeId;

  useEffect(() => {
    if (isModal) {
      ReactTooltip.rebuild();
    }
  }, [isModal, title]);

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
        effect="solid"
      >
        <div className="flex max-w-[650px] flex-row flex-wrap gap-2 rounded-xl">
          <div className="rounded bg-white py-2 px-6 text-gray-500 whitespace-pre">
            {title}
          </div>
        </div>
      </ReactTooltip>
    </div>
  );
}

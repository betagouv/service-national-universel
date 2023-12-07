import React from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import ReactTooltip, { TooltipProps } from "react-tooltip";

type OwnProps = {
  title: string;
  name: string;
  className?: string;
  tooltip?: React.ReactNode;
  tooltipProps?: TooltipProps;
  tooltipClassName?: string;
};

export default function Label({
  title,
  name,
  className,
  tooltip,
  tooltipProps,
  tooltipClassName,
}: OwnProps) {
  const tooltipId = `tooltip-${name}`;

  return (
    <label
      htmlFor={name}
      className={
        "flex items-center justify-start mb-2 text-xs font-bold text-ds-gray-900 " +
        className
      }
    >
      {title}
      {tooltip && (
        <>
          <HiOutlineInformationCircle
            size={16}
            className="ml-2 text-gray-400"
            data-tip
            data-for={tooltipId}
          />
          <ReactTooltip
            id={tooltipId}
            type="light"
            place="top"
            effect="solid"
            className="custom-tooltip-radius !opacity-100 !shadow-md"
            tooltipRadius="6"
            {...(tooltipProps || {})}
          >
            <div
              className={
                "w-[275px] list-outside !px-1 !py-2 text-left text-xs font-normal text-gray-600 " +
                tooltipClassName
              }
            >
              {tooltip}
            </div>
          </ReactTooltip>
        </>
      )}
    </label>
  );
}

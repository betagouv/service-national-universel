import React from "react";
import Button from "./Button";
import Modal from "./Modal";
import ReactTooltip, { TooltipProps } from "react-tooltip";
import { HiOutlineInformationCircle } from "react-icons/hi";

type TAction = {
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isCancel?: boolean;
  isDestructive?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
};

type OwnProps = {
  isOpen: boolean;
  onClose: () => void;
  actions: Array<TAction> | React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  text?: React.ReactNode;
  tooltip?: React.ReactNode;
  tooltipProps?: TooltipProps;
  tooltipClassName?: string;
};

export default function ModalConfirmation({
  isOpen,
  onClose,
  actions,
  className,
  icon,
  title,
  text,
  tooltip,
  tooltipProps,
  tooltipClassName,
}: OwnProps) {
  const tooltipId = `tooltip-${title}`;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={className}
      header={icon && <div className="flex justify-center">{icon}</div>}
      content={
        <div className="text-center">
          <div className="flex items-center justify-center">
            {title && (
              <h3 className="text-xl font-medium text-ds-gray-900">{title}</h3>
            )}
            {tooltip && (
              <>
                <HiOutlineInformationCircle
                  size={20}
                  className="ml-3 text-gray-400"
                  data-tip
                  data-for={tooltipId}
                />
                <ReactTooltip
                  id={tooltipId}
                  type="light"
                  place="top"
                  effect="solid"
                  className="custom-tooltip-radius !opacity-100 !shadow-md"
                  {...(tooltipProps || {})}
                >
                  <div
                    className={
                      "w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600 " +
                      tooltipClassName
                    }
                  >
                    {tooltip}
                  </div>
                </ReactTooltip>
              </>
            )}
          </div>

          {text && <div className="mt-2 text-ds-gray-500">{text}</div>}
        </div>
      }
      footer={
        <div
          className={`flex items-center ${
            Array.isArray(actions) && actions.length > 1
              ? "justify-between"
              : "justify-center"
          } gap-3`}
        >
          {Array.isArray(actions)
            ? actions.map((action, index) => (
                <Button
                  key={action.title + index}
                  type={action.isCancel ? "secondary" : "primary"}
                  disabled={action.disabled ?? false}
                  loading={action.loading ?? false}
                  leftIcon={action.leftIcon}
                  title={action.title}
                  rightIcon={action.rightIcon}
                  className={`flex-1 justify-center ${
                    !!action.isDestructive && "bg-red-500 hover:bg-red-700"
                  }`}
                  onClick={() => {
                    action.onClick ? action.onClick?.() : onClose();
                  }}
                />
              ))
            : actions}
        </div>
      }
    />
  );
}

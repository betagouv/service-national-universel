import React from "react";
import Button from "./Button";
import Modal from "./Modal";

type TAction = {
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isCancel?: boolean;
  isDestructive?: boolean;
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
};

export default function ModalConfirmation({
  isOpen,
  onClose,
  actions,
  className,
  icon,
  title,
  text,
}: OwnProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={className}
      header={icon && <div className="flex justify-center">{icon}</div>}
      content={
        <div className="text-center">
          {title && (
            <h3 className="text-xl font-medium text-ds-gray-900">{title}</h3>
          )}
          {text && <div className="mt-2 text-ds-gray-500">{text}</div>}
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          {Array.isArray(actions)
            ? actions.map((action, index) => (
                <Button
                  key={action.title + index}
                  type={action.isCancel ? "secondary" : "primary"}
                  leftIcon={action.leftIcon}
                  title={action.title}
                  rightIcon={action.rightIcon}
                  className={`flex-1 justify-center ${
                    !!action.isDestructive && "bg-red-500 hover:bg-red-700"
                  }`}
                  onClick={() => {
                    onClose();
                    action.onClick?.();
                  }}
                />
              ))
            : actions}
        </div>
      }
    />
  );
}

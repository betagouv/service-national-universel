import React from "react";
import Button from "./Button";
import Modal from "./Modal";

type TAction = {
  title: string;
  isCancel?: boolean;
  isDestructive?: boolean;
  onClick?: () => void;
};

type OwnProps = {
  isOpen: boolean;
  onClose: () => void;
  actions: Array<TAction> | React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  text?: string;
};

export default function ModalConfirmation({
  isOpen,
  onClose,
  actions,
  icon,
  title,
  text,
}: OwnProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={icon && <div className="flex justify-center">{icon}</div>}
      content={
        <div className="text-center">
          {title && (
            <h3 className="text-xl font-bold text-ds-gray-900">{title}</h3>
          )}
          {text && <p className="mt-2 text-ds-gray-500">{text}</p>}
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-6">
          {Array.isArray(actions)
            ? actions.map((action, index) => (
                <Button
                  key={action.title + index}
                  type={action.isCancel ? "secondary" : "primary"}
                  title={action.title}
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

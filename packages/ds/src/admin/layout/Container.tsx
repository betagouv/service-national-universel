import React from "react";

type OwnProps = {
  title?: string;
  actions?: React.ReactNode[];
  children?: React.ReactNode;
};

export default function Container({ title, actions, children }: OwnProps) {
  return (
    <div className="flex flex-col items-start gap-6 mb-6 pt-6 pb-8 px-8 rounded-lg bg-white shadow-sm">
      <div className="flex items-start gap-6">
        {title && (
          <div className="text-gray-900 text-lg font-medium leading-6">
            {title}
          </div>
        )}
        {actions && <div>{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

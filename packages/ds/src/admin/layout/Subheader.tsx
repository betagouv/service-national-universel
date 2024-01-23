import React from "react";

type OwnProps = {
  title: string;
  titleComponent?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode[];
};

export default function Subeader({
  title,
  titleComponent,
  className,
  children,
  actions,
}: OwnProps) {
  return (
    <div className={"flex items-center justify-between mb-4 " + className}>
      <div className="flex flex-col items-start justify-start">
        {/* Title */}
        <div className="flex items-start justify-center">
          <h1 className="text-[24px] font-bold leading-7 text-ds-gray-900">
            {title}
          </h1>
          {titleComponent}
        </div>

        {/* Children */}
        {children}
      </div>

      {/* Actions */}
      {actions && <div className="ml-6">{actions}</div>}
    </div>
  );
}

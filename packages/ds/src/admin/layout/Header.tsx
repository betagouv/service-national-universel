import React from "react";
import Breadcrumbs from "./Breadcrumbs";

type OwnProps = {
  title: string;
  className?: string;
  classNameDivTitle?: string;
  breadcrumb?: Array<{
    title: string | React.ReactNode;
    to?: string;
  }>;
  titleComponent?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode[];
};

export default function Header({
  title,
  className,
  classNameDivTitle,
  breadcrumb,
  titleComponent,
  children,
  actions,
}: OwnProps) {
  return (
    <header className={"mb-6 " + className}>
      {/* Breadcrumb */}
      <Breadcrumbs items={breadcrumb} />

      <div className={"flex items-end justify-between " + classNameDivTitle}>
        <div className="flex flex-col items-start justify-start">
          {/* Title */}
          <div className="flex items-center justify-start">
            <h1 className="text-[30px] font-bold leading-9 text-ds-gray-900">
              {title}
            </h1>
            {titleComponent}
          </div>

          {/* Children */}
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center justify-end ml-6">{actions}</div>
        )}
      </div>
    </header>
  );
}

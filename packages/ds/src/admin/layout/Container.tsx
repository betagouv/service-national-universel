import React from "react";

type OwnProps = {
  className?: string;
  topComponent?: React.ReactNode;
  title?: string;
  titleComponent?: React.ReactNode;
  actions?: React.ReactNode[];
  children?: React.ReactNode;
};

export default function Container({
  className,
  topComponent,
  title,
  titleComponent,
  actions,
  children,
}: OwnProps) {
  return (
    <section
      className={
        "mb-6 pt-6 pb-8 px-8 rounded-lg bg-white shadow-container " + className
      }
    >
      {/* Top component */}
      {topComponent && <div>{topComponent}</div>}

      {/* Title */}
      {title && (
        <div className="flex items-center justify-between mb-6">
          {title && (
            <div className="flex items-center gap-4 text-ds-gray-900 text-lg font-medium leading-6">
              {title}
              {titleComponent}
            </div>
          )}

          {/* Actions */}
          {actions}
        </div>
      )}

      {/* Children */}
      {children}
    </section>
  );
}

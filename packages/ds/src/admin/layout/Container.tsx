import React from "react";
import cx from "classnames";

type OwnProps = {
  className?: string;
  contentClassName?: string;
  topComponent?: React.ReactNode;
  title?: string;
  titleComponent?: React.ReactNode;
  actions?: React.ReactNode[];
  children?: React.ReactNode;
};

export default function Container({
  className,
  contentClassName,
  topComponent,
  title,
  titleComponent,
  actions,
  children,
}: OwnProps) {
  return (
    <section
      className={cx(
        "mb-6 pt-6 pb-8 px-8 rounded-lg bg-white shadow-container",
        className,
      )}
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
      <div className={cx("flex flex-col", contentClassName)}>{children}</div>
    </section>
  );
}

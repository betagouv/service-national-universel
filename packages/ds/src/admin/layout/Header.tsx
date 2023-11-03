import React from "react";
import { HiChevronRight } from "react-icons/hi";

type OwnProps = {
  title: string;
  className?: string;
  breadcrumb?: Array<{
    title: string | React.ReactNode;
    href: string;
  }>;
  titleComponent?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode[];
};

export default function Header({
  title,
  className,
  breadcrumb,
  titleComponent,
  children,
  actions,
}: OwnProps) {
  return (
    <div className={"flex items-end justify-between mb-6 " + className}>
      <div className="flex flex-col items-start justify-start">
        {/* Breadcrumb */}
        {breadcrumb?.length && (
          <div className="flex items-center justify-start mb-2">
            {breadcrumb.map((item, index) => (
              <div
                key={"breadcrumb-" + String(index)}
                className="flex items-center justify-center"
              >
                <div className="flex text-xs leading-[20px] text-ds-gray-400">
                  {item.href ? (
                    <a
                      href={item.href}
                      className="leading-[20px] hover:text-ds-gray-400 hover:underline"
                    >
                      {item.title}
                    </a>
                  ) : (
                    <div className="leading-[20px]">{item.title}</div>
                  )}
                </div>
                {index < breadcrumb.length - 1 ? (
                  <div className="mx-2 text-ds-gray-400">
                    <HiChevronRight size={20} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

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
  );
}

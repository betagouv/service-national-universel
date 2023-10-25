import React from "react";
import { HiChevronRight } from "react-icons/hi";

type OwnProps = {
<<<<<<< HEAD
  title: string;
  className?: string;
=======
>>>>>>> 9ace60be1 (Cle front/lib (#3130))
  breadcrumb?: Array<{
    title: string | React.ReactNode;
    href: string;
  }>;
<<<<<<< HEAD
=======
  title: string;
>>>>>>> 9ace60be1 (Cle front/lib (#3130))
  titleComponent?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode[];
};

export default function Header({
<<<<<<< HEAD
  title,
  className,
  breadcrumb,
=======
  breadcrumb,
  title,
>>>>>>> 9ace60be1 (Cle front/lib (#3130))
  titleComponent,
  children,
  actions,
}: OwnProps) {
  return (
<<<<<<< HEAD
    <div className={"flex items-end justify-between mb-6 " + className}>
      <div className="flex flex-col items-start justify-start">
        {/* Breadcrumb */}
        {breadcrumb?.length && (
          <div className="flex items-center justify-start mb-2">
            {breadcrumb.map((item, index) => (
              <div
                key={"breadcrumb-" + String(index)}
                className="flex items-start justify-center"
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
=======
    <div className="flex items-end justify-between mb-6">
      <div>
        {/* Breadcrumb */}
        {breadcrumb && (
          <div className="flex items-center justify-start mb-2">
            {breadcrumb?.length &&
              breadcrumb.map((item, index) => (
                <>
                  <div
                    key={item.title + String(index)}
                    className="flex text-xs leading-[20px]"
                  >
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-ds-red leading-[20px]"
                      >
                        {item.title}
                      </a>
                    ) : (
                      <div className="text-ds-red  leading-[20px]">
                        {item.title}
                      </div>
                    )}
                  </div>
                  {index < breadcrumb.length - 1 ? (
                    <div className="mx-2 text-gray-500">
                      <HiChevronRight size={20} />
                    </div>
                  ) : null}
                </>
              ))}
>>>>>>> 9ace60be1 (Cle front/lib (#3130))
          </div>
        )}

        {/* Title */}
        <div className="flex items-start justify-center">
<<<<<<< HEAD
          <h1 className="text-[30px] font-bold leading-9 text-ds-gray-900">
            {title}
          </h1>
=======
          <h1 className="text-3xl font-bold leading-9 text-ds-red">{title}</h1>
>>>>>>> 9ace60be1 (Cle front/lib (#3130))
          {titleComponent}
        </div>

        {/* Children */}
<<<<<<< HEAD
        {children}
=======
        {children && <div>{children}</div>}
>>>>>>> 9ace60be1 (Cle front/lib (#3130))
      </div>

      {/* Actions */}
      {actions && <div className="ml-6">{actions}</div>}
    </div>
  );
}

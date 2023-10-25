import React from "react";

type OwnProps = {
  title: string;
  titleComponent?: React.ReactNode;
<<<<<<< HEAD
  className?: string;
=======
>>>>>>> 9ace60be1 (Cle front/lib (#3130))
  children?: React.ReactNode;
  actions?: React.ReactNode[];
};

export default function Subeader({
  title,
  titleComponent,
<<<<<<< HEAD
  className,
=======
>>>>>>> 9ace60be1 (Cle front/lib (#3130))
  children,
  actions,
}: OwnProps) {
  return (
<<<<<<< HEAD
    <div className={"flex items-center justify-between mb-4 " + className}>
      <div className="flex flex-col items-start justify-start">
        {/* Title */}
        <div className="flex items-start justify-center">
          <h1 className="text-[24px] font-bold leading-7 text-ds-gray-900">
            {title}
          </h1>
=======
    <div className="flex items-center justify-between mb-4">
      <div>
        {/* Title */}
        <div>
          <h1 className="text-gray-900 text-sm leading-[normal]">{title}</h1>
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

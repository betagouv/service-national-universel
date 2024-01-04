import React from "react";

type OwnProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Container({ children, className }: OwnProps) {
  return (
    <div
      className={
        "mb-6 py-[60px] px-[102px] bg-[var(--background-default-grey)] shadow-fr-container " +
        className
      }
    >
      {children}
    </div>
  );
}

import React from "react";

type OwnProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Container({ children, className }: OwnProps) {
  return (
    <div
      className={`bg-[var(--background-default-grey)] shadow-fr-container border-b md:border-b-0 ${className}`}
    >
      {children}
    </div>
  );
}

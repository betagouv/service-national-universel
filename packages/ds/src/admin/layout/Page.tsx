import React from "react";

type OwnProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Page({ children, className }: OwnProps) {
  return <main className={"p-8 " + className}>{children}</main>;
}

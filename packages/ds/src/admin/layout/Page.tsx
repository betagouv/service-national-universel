import React from "react";

type OwnProps = {
  children: React.ReactNode;
};

export default function Page({ children }: OwnProps) {
  return <div className="p-8">{children}</div>;
}

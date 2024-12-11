import React from "react";

export default function HomeContainer({ children }: { children: React.ReactNode }) {
  return <div className="max-w-7xl mx-auto p-[1rem] md:p-[4rem]">{children}</div>;
}

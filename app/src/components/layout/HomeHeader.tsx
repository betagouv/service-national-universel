import React from "react";

export default function HomeHeader({ title, img, children }: { title: React.ReactNode; img?: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col items-center md:items-start xl:flex-row-reverse xl:justify-between gap-2">
      <div className="w-64 md:w-[26rem] flex-none md:hidden xl:block">
        <img src={img} width="auto" height="auto" className="md:px-0 mx-auto" />
      </div>
      <div className="max-w-xl">
        <h1 className="font-bold text-3xl md:text-5xl leading-10 md:leading-tight mt-2">{title}</h1>
        {children}
      </div>
    </header>
  );
}

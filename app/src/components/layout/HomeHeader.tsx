import React from "react";

export default function HomeContainer({ title, img, children }: { title: React.ReactNode; img: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col xl:flex-row-reverse xl:justify-between gap-2">
      <div className="w-64 md:w-96 mx-auto flex-none md:hidden xl:block">
        <img src={img} width="auto" height="auto" className="md:px-0 mx-auto" />
      </div>
      <div className="max-w-2xl">
        <h1 className="font-bold text-3xl md:text-5xl leading-10 md:leading-tight mt-2">{title}</h1>
        {children}
      </div>
    </div>
  );
}

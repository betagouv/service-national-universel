import React from "react";

export default function HomeContainer({ title, img, children }: { title: React.ReactNode; img: string; children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto bg-white flex flex-col md:flex-row-reverse md:justify-between gap-2 p-[1rem] md:p-[4rem]">
      <div>
        <img src={img} width="auto" height="auto" className="px-12 md:px-0 mx-auto" />
      </div>
      <div className="max-w-2xl">
        <h1 className="font-bold text-3xl md:text-5xl leading-10 md:leading-tight mt-2">{title}</h1>
        {children}
      </div>
    </div>
  );
}

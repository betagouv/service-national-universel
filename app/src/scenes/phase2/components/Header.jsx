import React from "react";

export default function Header({ title, subtitle, action, backAction, imgSrc }) {
  const style = imgSrc
    ? {
        backgroundImage: `url(${imgSrc})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }
    : { backgroundColor: "white" };
  return (
    <div style={style} className={`relative w-full h-48 ${imgSrc ? "text-white" : ""}`}>
      {imgSrc ? <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800 z-10"></div> : null}
      <header className="relative z-20 max-w-6xl h-48 p-[1rem] md:px-[3rem] mx-auto grid grid-rows-[2rem_auto_2rem] md:grid-rows-1 md:grid-cols-[8rem_auto_8rem] gap-2">
        <div className="flex items-center">{backAction}</div>
        <div className="flex flex-col justify-center">
          {subtitle ? <p className="w-fit mx-auto text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">{subtitle}</p> : null}
          <h1 className="m-0 text-3xl md:text-5xl text-center font-bold md:leading-tight line-clamp-2 pb-8">{title}</h1>
        </div>
        <div className="flex items-center justify-end">{action}</div>
      </header>
    </div>
  );
}

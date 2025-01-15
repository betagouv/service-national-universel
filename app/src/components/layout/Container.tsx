import React from "react";
import { HiArrowLeft } from "react-icons/hi";
import { Link, useHistory } from "react-router-dom";

type Props = {
  title: string;
  subtitle?: string;
  imgSrc?: string;
  action?: React.ReactNode;
  backlink?: string;
  children: React.ReactNode;
};

export default function Container({ title, subtitle, imgSrc, children, action, backlink }: Props) {
  const history = useHistory();

  const style: React.CSSProperties = imgSrc
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
    <div className="bg-white pb-12">
      <div style={style} className={`z-0 relative w-full min-h-[12rem] ${imgSrc ? "text-white" : ""}`}>
        {imgSrc ? <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800 z-10"></div> : null}
        <header className="relative z-20 max-w-6xl min-h-[12rem] p-[0.75rem] md:px-[3rem] mx-auto grid grid-rows-[2rem_auto_2rem] md:grid-rows-1 md:grid-cols-[8rem_auto_8rem] gap-2">
          <div className="flex items-center">
            {backlink ? (
              <Link to={backlink} className={`flex items-center gap-1 row-start-1 md:row-start-2 ${imgSrc ? "text-white" : "text-gray-500"}`}>
                <HiArrowLeft className="text-2xl" />
              </Link>
            ) : (
              <button onClick={() => history.goBack()} className="flex items-center gap-1 row-start-1 md:row-start-2">
                <HiArrowLeft className="text-2xl" />
              </button>
            )}
          </div>
          <div className="flex flex-col justify-center">
            {subtitle ? <p className="w-fit mx-auto text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded uppercase">{subtitle}</p> : null}
            <h1 className="pb-2 text-3xl md:text-5xl text-center font-bold md:leading-tight">{title}</h1>
          </div>
          <div className="flex items-center justify-end">{action}</div>
        </header>
      </div>
      <div className="max-w-6xl mx-auto px-3">{children}</div>
    </div>
  );
}

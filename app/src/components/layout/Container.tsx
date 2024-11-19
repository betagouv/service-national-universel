import React from "react";
import { HiArrowLeft } from "react-icons/hi";
import { Link, useHistory } from "react-router-dom";

type ContainerProps = {
  title: string;
  subtitle?: string;
  imgSrc?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  backLink?: string;
};

export default function Container({ title, subtitle, imgSrc, children, action, backLink }: ContainerProps) {
  return (
    <div className="bg-white pb-12">
      <Header title={title} subtitle={subtitle} imgSrc={imgSrc} action={action} backLink={backLink} />
      <div className="max-w-6xl mx-auto px-4">{children}</div>
    </div>
  );
}

type HeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  imgSrc?: string;
  backLink?: string;
};

function Header({ title, subtitle, action, imgSrc, backLink }: HeaderProps) {
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
    <div style={style} className={`relative w-full h-48 ${imgSrc ? "text-white" : ""}`}>
      {imgSrc ? <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800 z-10"></div> : null}
      <header className="relative z-20 max-w-6xl h-48 p-[1rem] md:px-[3rem] mx-auto grid grid-rows-[2rem_auto_2rem] md:grid-rows-1 md:grid-cols-[8rem_auto_8rem] gap-2">
        <div className="flex items-center">
          {backLink ? (
            <Link to={backLink} className="flex items-center gap-1 row-start-1 md:row-start-2">
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
          <h1 className="m-0 text-3xl md:text-5xl text-center font-bold md:leading-tight">{title}</h1>
        </div>
        <div className="flex items-center justify-end">{action}</div>
      </header>
    </div>
  );
}

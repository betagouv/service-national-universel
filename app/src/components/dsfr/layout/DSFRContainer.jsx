import React from "react";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";

export default function DSFRContainer({ title, subtitle, children, supportLink }) {
  return (
    <main className="relative md:my-10 text-gray-800 mx-auto w-full bg-white px-[1rem] py-[2rem] shadow-sm md:w-[56rem] md:px-[6rem] md:pt-[4rem]">
      {title && (
        <>
          <div className="flex items-center justify-between">
            <h1 className="m-0 text-2xl font-bold">{title}</h1>
            {supportLink ? (
              <a href={supportLink} target="_blank" rel="noreferrer">
                <QuestionMarkBlueCircle />
              </a>
            ) : null}
          </div>
          {subtitle && <p className="mt-2 text-sm text-gray-500 leading-relaxed">{subtitle}</p>}
          <hr className="my-4 h-px border-0 bg-gray-200" />
        </>
      )}
      {children}
    </main>
  );
}

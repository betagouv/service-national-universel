import React from "react";
import { appURL } from "../../config";
import Navbar from "../../scenes/preinscription/components/navbar";
import QuestionMarkBlueCircle from "../../assets/icons/QuestionMarkBlueCircle";

export default function DSFRContainer({ title, subtitle, children, onSave, supportLink = `${appURL}/public-besoin-d-aide/` }) {
  return (
    <>
      <Navbar onSave={onSave} />
      <div className="text-[#161616]">
        <main className="w-full md:w-[56rem] bg-white mx-auto px-[1rem] md:px-[6rem] py-[2rem] md:pt-[4rem] shadow-sm">
          {title && (
            <>
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold m-o">{title}</h1>
                <a href={supportLink} target="_blank" rel="noreferrer">
                  <QuestionMarkBlueCircle />
                </a>
              </div>
              {subtitle && <p className="text-gray-800 mt-2 text-sm">{subtitle}</p>}
              <hr className="my-4 h-px bg-gray-200 border-0" />
            </>
          )}
          {children}
        </main>
      </div>
    </>
  );
}

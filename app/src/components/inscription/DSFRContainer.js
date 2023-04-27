import React from "react";
import { appURL } from "../../config";
import Navbar from "../../scenes/preinscription/components/navbar";
import QuestionMarkBlueCircle from "../../assets/icons/QuestionMarkBlueCircle";

export default function DSFRContainer({ title, subtitle, children, onSave, supportLink = `${appURL}/public-besoin-d-aide/` }) {
  return (
    <>
      <Navbar onSave={onSave} />
      <div className="text-[#161616]">
        <main className="mx-auto w-full bg-white px-[1rem] py-[2rem] shadow-sm md:w-[56rem] md:px-[6rem] md:pt-[4rem]">
          {title && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="m-0 text-xl font-bold">{title}</h1>
                <a href={supportLink} target="_blank" rel="noreferrer">
                  <QuestionMarkBlueCircle />
                </a>
              </div>
              {subtitle && <p className="mt-2 text-sm text-gray-800">{subtitle}</p>}
              <hr className="my-4 h-px border-0 bg-gray-200" />
            </>
          )}
          {children}
        </main>
      </div>
    </>
  );
}

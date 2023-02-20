import React from "react";
import { appURL } from "../config";

import Navbar from "../scenes/preinscription/components/navbar";
import Help from "../scenes/inscription2023/components/Help";

import QuestionMarkBlueCircle from "../assets/icons/QuestionMarkBlueCircle";

export default function DSFRContainer({ title, subTitle, children, onSave, questionMarckLink = `${appURL}/public-besoin-d-aide/`, showHelp = true }) {
  return (
    <>
      <Navbar onSave={onSave} />
      <div className="text-[#161616]">
        <main className="w-full md:w-[56rem] bg-white mx-auto px-[1rem] md:px-[6rem] py-[1rem] md:py-[4rem] shadow-sm">
          {title && (
            <>
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold m-o">{title}</h1>
                <a className="hover:scale-105" href={questionMarckLink} target="_blank" rel="noreferrer">
                  <QuestionMarkBlueCircle />
                </a>
              </div>
              {subTitle && <div className="text-gray-800 mt-2 text-sm">{subTitle}</div>}
              <hr className="my-4 h-px bg-gray-200 border-0" />
            </>
          )}
          {children}
        </main>
        {showHelp ? <Help /> : <div className="m-16 hidden md:block" />}
      </div>
    </>
  );
}

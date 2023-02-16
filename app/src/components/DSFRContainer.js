import React from "react";
import { appURL } from "../config";

import Header from "./header";
import Navbar from "../scenes/preinscription/components/navbar";
import Help from "../scenes/inscription2023/components/Help";
import Footer from "./footerV2";

import QuestionMarkBlueCircle from "../assets/icons/QuestionMarkBlueCircle";

export default function DSFRContainer({ title, subTitle, children, onSave, questionMarckLink = `${appURL}public-besoin-d-aide/`, showHelp = true }) {
  return (
    <div className="flex flex-col h-screen justify-between bg-[#f9f6f2] gap-0 md:gap-8">
      <Header />
      <Navbar onSave={onSave} />
      <div className="bg-[#f9f6f2] text-[#161616]">
        <main className="w-full md:w-[50rem] bg-white mx-auto px-[1rem] md:px-[6rem] pt-14 pb-4 shadow-sm">
          <div className="flex justify-between items-center mt-2">
            <h1 className="text-xl font-bold">{title}</h1>
            <a className="hover:scale-105" href={questionMarckLink} target="_blank" rel="noreferrer">
              <QuestionMarkBlueCircle />
            </a>
          </div>
          {subTitle && <div className="text-gray-800 mt-2 text-sm">{subTitle}</div>}
          <hr className="my-4 h-px bg-gray-200 border-0" />
          {children}
        </main>
        {showHelp && <Help />}
      </div>
      <Footer />
    </div>
  );
}

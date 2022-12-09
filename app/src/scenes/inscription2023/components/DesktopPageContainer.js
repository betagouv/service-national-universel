import React from "react";
import { appURL } from "../../../config";

import Header from "./../../../components/header";
import Navbar from "../components/Navbar";
import Help from "./Help";
import Footer from "../../../components/footerV2";

import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import { FiChevronLeft } from "react-icons/fi";

export default function DesktopPageContainer({
  title,
  subTitle = "",
  children,
  onSave,
  onSubmit,
  onClickPrevious,
  disabled,
  questionMarckLink = `${appURL}public-besoin-d-aide/`,
  childrenContinueButton = "Continuer",
  modeCorrection = false,
  onCorrection,
  loading = false,
}) {
  return (
    <div className="flex flex-col h-screen justify-between bg-[#f9f6f2]">
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
          <div className="w-full mx-auto fixed md:relative bottom-0 left-0 bg-white shadow-ninaInverted md:shadow-none py-4 px-[1rem] md:px-0 ">
            <hr className="mb-8 h-px bg-gray-200 border-0 hidden md:block" />
            <div className="flex justify-end gap-2">
              {onClickPrevious && (
                <button className="flex items-center justify-center w-10 border-[1px] border-[#000091]" onClick={onClickPrevious} disabled={disabled}>
                  <FiChevronLeft className="text-[#000091] font-bold" />
                </button>
              )}
              <button
                className={`flex items-center justify-center py-2 px-4 w-full md:w-auto cursor-pointer ${
                  disabled ? "bg-[#E5E5E5] text-[#929292] cursor-not-allowed" : "bg-[#000091] text-white"
                }`}
                onClick={() => (!disabled && modeCorrection ? onCorrection() : onSubmit())}
                disabled={disabled || loading}>
                {childrenContinueButton}
              </button>
            </div>
          </div>
        </main>
        <Help />
      </div>
      <Footer />
    </div>
  );
}

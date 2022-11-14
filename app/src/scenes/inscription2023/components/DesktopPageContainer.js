import React from "react";

import Navbar from "../components/Navbar";

import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import Button from "../components/Button";
import Help from "./Help";
import { appURL } from "../../../config";

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
    <>
      <Navbar onSave={onSave} />
      <div className="bg-[#f9f6f2] text-[#161616]">
        <div className="w-[50rem] drop-shadow bg-white mx-auto px-24 py-12">
          <div className="flex justify-between items-center mt-2">
            <h1 className="text-xl font-bold">{title}</h1>
            <a className="hover:scale-105" href={questionMarckLink} target="_blank" rel="noreferrer">
              <QuestionMarkBlueCircle />
            </a>
          </div>
          {subTitle && <div className="text-gray-800 mt-2 text-sm">{subTitle}</div>}
          <hr className="my-4 h-px bg-gray-200 border-0" />
          {children}
          <hr className="my-8 h-px bg-gray-200 border-0" />
          {loading && <div>Veuillez patienter : scan antivirus en cours...</div>}
          <div className="flex justify-end gap-4">
            {onClickPrevious && (
              <button
                className="flex items-center justify-center px-3 py-2 border-[1px] border-[#000091] text-[#000091] hover:bg-[#000091] hover:text-white"
                onClick={onClickPrevious}
                disabled={disabled}>
                Précédent
              </button>
            )}
            {modeCorrection ? (
              <Button onClick={onCorrection} disabled={disabled}>
                {childrenContinueButton}
              </Button>
            ) : (
              onSubmit && (
                <Button onClick={onSubmit} disabled={disabled}>
                  {childrenContinueButton}
                </Button>
              )
            )}
          </div>
        </div>
        {/* <div className="w-[55rem] drop-shadow bg-white mx-auto my-8 px-[80px] py-[40px]"> */}
        <Help />
        {/* </div> */}
      </div>
    </>
  );
}

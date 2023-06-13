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
      <div className="flex justify-center bg-[#f9f6f2] py-10 text-[#161616]">
        <div className="mx-auto basis-[70%] ">
          <div className="my-0 bg-white px-[102px] py-[60px]">
            <div className="mt-2 flex w-full items-center justify-between">
              <h1 className="text-xl font-bold">{title}</h1>
              <a className="hover:scale-105" href={questionMarckLink} target="_blank" rel="noreferrer">
                <QuestionMarkBlueCircle />
              </a>
            </div>
            {subTitle && <div className="mt-2 text-sm text-gray-800">{subTitle}</div>}
            <hr className="my-4 h-px border-0 bg-gray-200" />
            {children}
            <hr className="my-8 h-px border-0 bg-gray-200" />
            {loading && <div>Veuillez patienter : scan antivirus en cours...</div>}
            <div className="flex justify-end gap-4">
              {onClickPrevious && (
                <button
                  className="flex items-center justify-center border-[1px] border-[#000091] px-3 py-2 text-[#000091] hover:bg-[#000091] hover:text-white"
                  onClick={onClickPrevious}
                  // disabled={disabled}
                >
                  Précédent
                </button>
              )}
              {modeCorrection ? (
                <Button onClick={onCorrection} disabled={disabled} children={childrenContinueButton} />
              ) : (
                onSubmit && <Button onClick={onSubmit} disabled={disabled} children={childrenContinueButton} />
              )}
            </div>
          </div>
          <div className="mt-8 bg-white">
            <Help />
          </div>
        </div>
      </div>
    </>
  );
}

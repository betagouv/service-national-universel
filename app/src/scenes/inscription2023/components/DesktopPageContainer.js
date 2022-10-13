import React from "react";

import Navbar from "../components/Navbar";

import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import Button from "../components/Button";
import { Link } from "react-router-dom";
import Help from "./Help";

export default function DesktopPageContainer({ title, subTitle = "", children, onSave, onSubmit, onClickPrevious, disabled }) {
  return (
    <>
      <Navbar onSave={onSave} />
      <div className="bg-[#f9f6f2] flex justify-center py-10 text-[#161616]">
        <div className="basis-[70%] mx-auto ">
          <div className="bg-white my-0 px-[102px] py-[60px]">
            <div className="w-full flex justify-between items-center mt-2">
              <h1 className="text-xl font-bold">{title}</h1>
              <Link className="hover:scale-105" to="/public-besoin-d-aide/">
                <QuestionMarkBlueCircle />
              </Link>
            </div>
            {subTitle && <div className="text-gray-800 mt-2 text-sm">{subTitle}</div>}
            <hr className="my-4 h-px bg-gray-200 border-0" />
            {children}
            <hr className="my-8 h-px bg-gray-200 border-0" />
            <div className="flex justify-end gap-4">
              {onClickPrevious && <Button onClick={onClickPrevious}>Précédent</Button>}
              {onSubmit && <Button onClick={onSubmit} disabled={disabled} />}
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

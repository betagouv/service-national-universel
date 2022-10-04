import React from "react";
import Close from "../../../../assets/CloseBlue.svg";
import File from "../../../../assets/file.svg";
import Help from "../../../../assets/icons/QuestionMarkBlue";
import Login from "../../../../assets/icons/Login";
import { Link, useLocation } from "react-router-dom";

const ModalMenu = ({ isOpen, setIsOpen }) => {
  const { pathname } = useLocation();
  return (
    isOpen && (
      <div className="w-screen h-screen bg-[#f9f6f2] text-[#000091] text-sm font-medium ">
        <div className="bg-white w-full px-3 py-3">
          <div
            className="flex w-full justify-end items-center space-x-2 mb-8"
            onClick={() => {
              setIsOpen(false);
            }}>
            <div>Fermer</div>
            <img src={Close} className="w-3" />
          </div>
          <Link className="flex items-center space-x-2 border-b border-b-[#E5E5E5] py-3" to={"/auth"}>
            <Login />
            <div> Se connecter</div>
          </Link>
          <a className="flex space-x-2 items-center border-b border-b-[#E5E5E5] py-3" href="https://www.snu.gouv.fr/" to="/les-programmes">
            <img src={File} />
            <div>Le programme</div>
          </a>
          <Link className="flex space-x-2 items-center pt-3" to={`/public-besoin-d-aide?from${pathname}`}>
            <Help />
            <div>Besoin d&apos;aide ?</div>
          </Link>
        </div>
      </div>
    )
  );
};

export default ModalMenu;

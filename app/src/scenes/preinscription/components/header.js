import React from "react";
import LogoFr from "../../../assets/fr.png";
import SNU from "../../../assets/logo-snu.png";
import Menu from "../../../assets/icons/Burger";
<<<<<<< HEAD
import useDevice from "../../../hooks/useDevice";
import Help from "../../../assets/icons/QuestionMarkBlue";
import File from "../../../assets/file.svg";
import { Link, useLocation } from "react-router-dom";

const Header = ({ setIsOpen }) => {
  const { pathname } = useLocation();
  return (
    <div className="flex  px-3  w-full shadow-[0px_16px_16px_-16px_rgba(0,0,0,0.32)] sticky top-0 bg-white">
      <div className="flex justify-between w-full h-full border-b border-b-[#E5E5E5] py-3 md:pr-[120px] md:pl-[108px]">
        <div className="flex basis-[50%] space-x-6 items-center">
          <img src={LogoFr} className="w-18 h-16" />
          <img src={SNU} className="w-14" />
          {useDevice() === "desktop" && (
            <div>
              <div className="font-bold text-xl">Service National Universel</div>
              <div className="text-sm ">Inscription du volontaire</div>
            </div>
          )}
        </div>
        <div>
          {useDevice() === "mobile" ? (
            <div
              className="flex items-start basis-[50%]"
              onClick={() => {
                setIsOpen(true);
              }}>
              <Menu />
            </div>
          ) : (
            <div className="flex text-sm text-[#000091] items-center basis-[50%%]">
              <Link className="flex items-center space-x-1 border-r border-r-gray-300 py-1 pl-1.5 pr-3 cursor-pointer hover:font-bold hover:text-[#000091]" to="/les-programmes">
                <img src={File} alt="" />
                <div>Programme</div>
              </Link>
              <Link className="flex items-center space-x-1 py-1 px-3 cursor-pointer hover:font-bold hover:text-[#000091]" to={`/public-besoin-d-aide?from${pathname}`}>
                <Help />
                <div>Besoin d&apos;aide</div>{" "}
              </Link>
              <Link className="border border-gray-500 py-1 px-1.5 cursor-pointer hover:text-white hover:bg-[#000091]" to={"/auth"}>
                Se connecter
              </Link>
            </div>
          )}
=======

const Header = () => {
  return (
    <div className="flex  px-3  w-full h-[91px] shadow-md ">
      <div className="flex justify-between w-full h-full border-b border-b-[#E5E5E5] py-3 md:mx-16 ">
        <div className="flex w-2/3 space-x-6 items-center">
          <img src={LogoFr} className="w-18 h-16" />
          <img src={SNU} className="w-14" />
        </div>
        <div className="flex items-start">
          <Menu />
>>>>>>> main
        </div>
      </div>
    </div>
  );
};

export default Header;

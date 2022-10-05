import React from "react";
import LogoFr from "../../../assets/fr.png";
import SNU from "../../../assets/logo-snu.png";
import Menu from "../../../assets/icons/Burger";

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
        </div>
      </div>
    </div>
  );
};

export default Header;

import React from "react";
import { HiOutlineSearch, HiOutlineAdjustments } from "react-icons/hi";

const Header = () => {
  return (
    <div className="bg-gray-700">
      <div className=" px-4 pt-4">
        <div className="text-white font-bold text-3xl">Réalisez votre mission d'intérêt général</div>
        <div className="text-gray-300 text-sm mt-2 mb-2">
          Mettez votre énergie au service d’une société plus solidaire et découvrez {"\n"} votre talent pour l’engagement en réalisant une mission d’intérêt général !
        </div>
        <div className="flex items-center mb-4">
          <HiOutlineAdjustments className="text-white mr-1" />
          <div className="text-gray-300 text-sm underline">Renseigner mes préférences mission </div>
        </div>
        <div className="flex rounded-xl py-2.5 px-4 bg-blue-600 items-center justify-center">
          <HiOutlineSearch className="text-white mr-1" />
          <div className="text-white text-sm">Trouver une mission</div>
        </div>
      </div>
      <img className="rounded-t-lg w-full" src={require("../../../assets/phase2MobileHeader.png")} />
    </div>
  );
};

export default Header;

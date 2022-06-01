import React from "react";
import { HiOutlineSearch, HiOutlineAdjustments } from "react-icons/hi";

const Header = () => {
  return (
    <div className="bg-gray-700 rounded-t-lg flex">
      <div className="p-10 mt-3">
        <div className="text-white font-bold text-3xl">Réalisez votre mission d'intérêt général</div>
        <div className="text-gray-300 text-sm mt-2 mb-4">
          Mettez votre énergie au service d’une société plus solidaire et découvrez {"\n"} votre talent pour l’engagement en réalisant une mission d’intérêt général !
        </div>
        <div className="flex">
          <div className="flex rounded-xl border p-2.5 items-center">
            <HiOutlineAdjustments className="text-white mr-1" />
            <div className="text-white  text-sm">Renseigner mes préférences </div>
          </div>
          <div className="flex rounded-xl py-2.5 px-4 ml-4 bg-blue-600 items-center">
            <HiOutlineSearch className="text-white mr-1" />
            <div className="text-white text-sm">Trouver une mission</div>
          </div>
        </div>
      </div>
      <img className="rounded-t-lg" src={require("../../../assets/phase2Header.png")} />
    </div>
  );
};

export default Header;

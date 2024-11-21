import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import NoSejourSection from "../components/NoSejourSection";
import CurrentSejourNotice from "../components/CurrentSejourNotice";

export default function NoMatchingDate() {
  const history = useHistory();

  return (
    <div className="flex flex-col justify-center items-center bg-white pb-12 px-4 md:px-[8rem]">
      <div className="w-full flex items-center justify-between py-4">
        <button onClick={() => history.push("/changer-de-sejour/")} className="flex items-center gap-1 mr-2">
          <HiArrowLeft className="text-xl text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-center">Aucune date ne me convient</h1>
        <div></div>
      </div>
      <CurrentSejourNotice />
      <hr />
      <p className="mt-4 text-sm leading-5 text-[#6B7280] font-normal">Faites votre choix</p>
      <NoSejourSection />
    </div>
  );
}

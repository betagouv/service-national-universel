import React, { useState } from "react";
import TableauDeBord from "./views/TableauDeBord";
import Preferences from "../preferences";

export default function View() {
  const [currentTab, setCurrentTab] = useState(0);
  return (
    <div className="p-8 bg-white flex flex-col">
      <h1 className="mt-6 mb-6 mx-auto text-center font-bold text-4xl md:text-5xl max-w-xl leading-tight md:leading-tight">Mes engagements</h1>
      <span className="p-8 flex justify-center ">
        <span
          onClick={() => setCurrentTab(0)}
          className={`pr-1 pl-1 pb-2 cursor-pointer hover:text-blue-600 hover:border-b-2 border-blue-600 text-gray-400 cursor-pointer ${
            currentTab === 0 && "!text-blue-600 border-b-2"
          }`}>
          Tableau de bord
        </span>
        <span
          onClick={() => setCurrentTab(1)}
          className={`pr-1 pl-1 ml-4 pb-2 cursor-pointer hover:text-blue-600 hover:border-b-2 border-blue-600 text-gray-400 cursor-pointer ${
            currentTab === 1 && "text-blue-600 border-b-2"
          }`}>
          Mes préférences
        </span>
      </span>
      {currentTab === 0 && <TableauDeBord />}
      {currentTab === 1 && <Preferences />}
    </div>
  );
}

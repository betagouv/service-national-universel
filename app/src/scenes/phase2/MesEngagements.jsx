import React from "react";
import { Link, NavLink } from "react-router-dom";
import TableauDeBord from "./views/TableauDeBord";
import Preferences from "../preferences";
import { HiArrowLeft } from "react-icons/hi";

export default function View() {
  const params = new URLSearchParams(window.location.search);
  return (
    <div className="bg-white pb-12">
      <div className="px-[1rem] md:px-[3rem] max-w-7xl mx-auto bg-white flex flex-col">
        <header className="mt-[3rem] grid grid-cols-[15%_auto_15%]">
          <Link to="/phase2" className="flex items-center gap-1">
            <HiArrowLeft className="text-xl text-gray-500" />
          </Link>
          <div>
            <h1 className="m-0 text-center font-bold text-4xl md:text-5xl leading-tight md:leading-tight">Mes engagements</h1>
          </div>
        </header>

        <nav className="mt-[3rem] flex justify-center gap-4">
          <NavLink
            to="?tab=dashboard"
            isActive={() => {
              return params.get("tab") !== "settings";
            }}
            className="pr-1 pl-1 pb-2 hover:text-blue-600 hover:border-b-2 border-blue-600 text-gray-400"
            activeClassName="!text-blue-600 border-b-2">
            Tableau de bord
          </NavLink>
          <NavLink
            to="?tab=settings"
            isActive={() => {
              return params.get("tab") === "settings";
            }}
            className="pr-1 pl-1 pb-2 hover:text-blue-600 hover:border-b-2 border-blue-600 text-gray-400"
            activeClassName="!text-blue-600 border-b-2">
            Mes préférences
          </NavLink>
        </nav>
        {params.get("tab") === "settings" ? <Preferences /> : <TableauDeBord />}
      </div>
    </div>
  );
}

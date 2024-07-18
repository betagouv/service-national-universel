import React from "react";
import { NavLink } from "react-router-dom";
import TableauDeBord from "./views/TableauDeBord";
import Preferences from "../preferences";

export default function View() {
  const params = new URLSearchParams(window.location.search);
  return (
    <div className="p-1 md:p-8 bg-white flex flex-col">
      <h1 className="mt-6 mb-6 mx-auto text-center font-bold text-4xl md:text-5xl max-w-xl leading-tight md:leading-tight">Mes engagements</h1>
      <span className="p-8 flex justify-center gap-4">
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
            params.get("tab") === "settings";
          }}
          className="pr-1 pl-1 pb-2 hover:text-blue-600 hover:border-b-2 border-blue-600 text-gray-400"
          activeClassName="!text-blue-600 border-b-2">
          Mes préférences
        </NavLink>
      </span>
      {params.get("tab") === "settings" ? <Preferences /> : <TableauDeBord />}
    </div>
  );
}

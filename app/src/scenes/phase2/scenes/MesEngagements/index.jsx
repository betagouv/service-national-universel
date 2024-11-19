import React from "react";
import { NavLink } from "react-router-dom";
import TableauDeBord from "./components/TableauDeBord";
import Preferences from "./components/Preferences";
import plausibleEvent from "@/services/plausible";
import Container from "@/components/layout/Container";

export default function View() {
  const params = new URLSearchParams(window.location.search);
  return (
    <Container title="Mes engagements">
      <nav className="flex justify-center gap-4">
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
          activeClassName="!text-blue-600 border-b-2"
          onClick={() => plausibleEvent("Phase2/Engagement/CTA - Mes préférences")}>
          Mes préférences
        </NavLink>
      </nav>
      {params.get("tab") === "settings" ? <Preferences /> : <TableauDeBord />}
    </Container>
  );
}

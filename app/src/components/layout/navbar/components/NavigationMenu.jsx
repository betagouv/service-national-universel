import React from "react";
import { useSelector } from "react-redux";
import { environment } from "../../../../config";
import { permissionPhase1, permissionPhase2, permissionPhase3 } from "../../../../utils";

import Diagoriente from "./Diagoriente";
import IconHome from "../assets/IconHome";
import IconPhase1 from "../assets/IconPhase1";
import IconPhase2 from "../assets/IconPhase2";
import IconPhase3 from "../assets/IconPhase3";
import IconHelp from "../assets/IconHelp";
import MenuGroup from "./MenuGroup";
import MenuLink from "./MenuLink";
import Socials from "./Socials";
import { GoTools } from "react-icons/go";

export default function NavigationMenu({ onClose = () => {} }) {
  const young = useSelector((state) => state.Auth.young);

  return (
    <nav className="flex h-full w-full flex-col justify-between bg-[#212B44] p-[24px] transition-all md:flex-1 md:p-[8px] md:pb-[24px]">
      <ul>
        <MenuLink to="/" icon={<IconHome />} text="Accueil" onClose={onClose} />
        <MenuLink to="/phase1" icon={<IconPhase1 />} text="Phase 1 - Séjour" enabled={permissionPhase1(young)} status={young.statusPhase1} onClose={onClose} />
        <MenuLink to="/phase2" icon={<IconPhase2 />} text="Phase 2 - MIG" enabled={permissionPhase2(young)} status={young.statusPhase2} onClose={onClose} />
        <MenuGroup to="/phase3" icon={<IconPhase3 />} text="Phase 3 - Engagement" enabled={permissionPhase3(young)} status={young.statusPhase3} onClose={onClose}>
          <MenuLink to="/les-programmes" text="Les programmes" onClose={onClose} />
          <MenuLink to="/phase3/mission" text="Trouver une mission" onClose={onClose} />
          <MenuLink to="/phase3/valider" text="Valider ma phase 3" onClose={onClose} />
        </MenuGroup>
        <div className="m-8" />
        <MenuLink to="/besoin-d-aide" icon={<IconHelp />} text="Besoin d'aide ?" onClose={onClose} />
        {environment === "development" && <MenuLink to="develop-assets" icon={<GoTools />} text="Dev tools" onClose={onClose} />}
      </ul>
      <Diagoriente />
      <Socials />
    </nav>
  );
}

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

export default function NavigationMenu({ setIsOpen = () => {} }) {
  const young = useSelector((state) => state.Auth.young);

  return (
    <nav className="p-[24px] md:p-[8px] md:pb-[24px] bg-[#212B44] w-full transition-all md:flex-1 flex flex-col justify-between h-full">
      <ul>
        <MenuLink setIsOpen={setIsOpen} to="/" icon={<IconHome />} text="Accueil" />
        <MenuLink setIsOpen={setIsOpen} to="/phase1" icon={<IconPhase1 />} text="Phase 1 - Séjour" enabled={permissionPhase1(young)} status={young.statusPhase1} />
        <MenuLink setIsOpen={setIsOpen} to="/phase2" icon={<IconPhase2 />} text="Phase 2 - MIG" enabled={permissionPhase2(young)} status={young.statusPhase2} />
        <MenuGroup icon={<IconPhase3 />} text="Phase 3 - Engagement" enabled={permissionPhase3(young)} status={young.statusPhase3}>
          <MenuLink setIsOpen={setIsOpen} to="/phase3/les-programmes" text="Les programmes" />
          <MenuLink setIsOpen={setIsOpen} to="/phase3/mission" text="Trouver une mission" />
          <MenuLink setIsOpen={setIsOpen} to="/phase3/valider" text="Valider ma phase 3" />
        </MenuGroup>
        <div className="m-8" />
        <MenuLink setIsOpen={setIsOpen} to="/public-besoin-d-aide" icon={<IconHelp />} text="Besoin d'aide ?" />
        {environment === "development" && <MenuLink setIsOpen={setIsOpen} to="develop-assets" icon={<GoTools />} text="Dev tools" />}
      </ul>
      <Diagoriente />
      <Socials />
    </nav>
  );
}

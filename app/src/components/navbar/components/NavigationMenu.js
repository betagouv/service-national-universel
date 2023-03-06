import React from "react";
import { useSelector } from "react-redux";
import IconHome from "../assets/IconHome";
import IconPhase1 from "../assets/IconPhase1";
import IconPhase2 from "../assets/IconPhase2";
import IconPhase3 from "../assets/IconPhase3";
import IconHelp from "../assets/IconHelp";
import Socials from "./Socials";
import { permissionPhase1, permissionPhase2, permissionPhase3 } from "../../../utils";
import Diagoriente from "./Diagoriente";
import MenuItem from "./MenuItem";

export default function NavigationMenu({ setIsOpen = () => {} }) {
  const young = useSelector((state) => state.Auth.young);

  return (
    <nav className="p-[24px] md:p-[8px] pb-6 bg-[#212B44] w-full transition-all flex-none md:flex-1 flex flex-col">
      <ul>
        <MenuItem setOpen={setIsOpen} to="/" icon={<IconHome />} text="Accueil" />
        <MenuItem setOpen={setIsOpen} to="phase1" icon={<IconPhase1 />} text="Phase 1 - Séjour" enabled={permissionPhase1(young)} status={young.statusPhase1} />
        <MenuItem setOpen={setIsOpen} to="phase2" icon={<IconPhase2 />} text="Phase 2 - MIG" enabled={permissionPhase2(young)} status={young.statusPhase2} />
        <MenuItem setOpen={setIsOpen} to="phase3" icon={<IconPhase3 />} text="Phase 3 - Engagement" enabled={permissionPhase3(young)} status={young.statusPhase3} />
        <div className="m-8" />
        <MenuItem setOpen={setIsOpen} to="/public-besoin-d-aide" icon={<IconHelp />} text="Besoin d'aide ?" />
      </ul>
      <div className="flex flex-col h-auto flex-none md:flex-1">
        <Diagoriente />
        <div className="md:pr-4 mt-auto bottom-0">
          <Socials />
        </div>
      </div>
    </nav>
  );
}

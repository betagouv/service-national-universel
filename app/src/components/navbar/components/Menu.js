import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import IconHome from "../assets/IconHome";
import IconPhase1 from "../assets/IconPhase1";
import IconPhase2 from "../assets/IconPhase2";
import IconPhase3 from "../assets/IconPhase3";
import IconHelp from "../assets/IconHelp";
import LogoDiagoriente from "../assets/logoDiagoriente.svg";
import Socials from "./Socials";
import { permissionPhase1, permissionPhase2, permissionPhase3 } from "../../../utils";
import Hamburger from "../assets/Hamburger";
import Close from "../assets/Close";

export default function Menu() {
  const [open, setOpen] = React.useState(false);
  const young = useSelector((state) => state.Auth.young);

  return (
    <>
      <button className="block md:hidden px-4" onClick={() => setOpen(true)}>
        <Hamburger />
      </button>
      <nav className={`p-[16px] md:p-[8px] absolute z-50 md:relative top-0 pb-6 bg-[#212B44] w-full md:flex-1 transition-all ${open ? "block" : "hidden md:block"}`}>
        <div className="flex md:hidden justify-end items-center h-10 mb-3">
          <button onClick={() => setOpen(false)}>
            <Close className="mr-2" />
          </button>
        </div>
        <ul>
          <MenuItem setOpen={setOpen} to="/" icon={<IconHome />} text="Accueil" />
          <MenuItem setOpen={setOpen} to="phase1" icon={<IconPhase1 />} text="Phase 1 - Séjour" enabled={permissionPhase1(young)} status={young.statusPhase1} />
          <MenuItem setOpen={setOpen} to="phase2" icon={<IconPhase2 />} text="Phase 2 - MIG" enabled={permissionPhase2(young)} status={young.statusPhase2} />
          <MenuItem setOpen={setOpen} to="phase3" icon={<IconPhase3 />} text="Phase 3 - Engagement" enabled={permissionPhase3(young)} status={young.statusPhase3} />
          <div className="m-8" />
          <MenuItem setOpen={setOpen} to="/public-besoin-d-aide" icon={<IconHelp />} text="Besoin d'aide ?" />
          <Diagoriente />
          <Socials />
        </ul>
      </nav>
    </>
  );
}

function MenuItem({ to, enabled = true, icon, text, status, setOpen }) {
  const isActive = (to === "/" && location.pathname === "/") || (to !== "/" && location.pathname.includes(to));

  return (
    <li className="flex items-center">
      {enabled ? (
        <NavLink
          onClick={() => setOpen(false)}
          to={to}
          exact
          className="my-[2px] px-2 py-3 w-full rounded-md flex gap-4 text-[#D1DAEF] hover:bg-[#1B243D] hover:text-[#D1DAEF] items-center transition-colors duration-200"
          activeClassName="bg-[#344264] text-[#67A4FF] hover:bg-[#344264] hover:text-[#67A4FF]">
          {icon && <div className={`${isActive ? "text-[#67A4FF]" : "text-[#7A90C3]"}`}>{icon}</div>}
          {text && <span>{text}</span>}
          {status && <StatusPill status={status} />}
        </NavLink>
      ) : (
        <div className="my-[1px] px-2 py-3 w-full rounded-md flex gap-4 text-[#526187] cursor-default items-center">
          {icon}
          <span>{text}</span>
        </div>
      )}
    </li>
  );
}

function StatusPill({ status }) {
  if (status && status === "IN_PROGRESS") {
    return <span className="bg-[#2563EB] rounded-full text-xs text-[#D1DAEF] px-2 py-0.5 shadow-sm ml-auto">En cours</span>;
  }
  if (status && status === "EXEMPTED") {
    return <span className="bg-[#1E3A8A] rounded-full text-xs text-[#D1DAEF] px-2 py-0.5 shadow-sm ml-auto">Dispensé</span>;
  }
  return null;
}

function Diagoriente() {
  return (
    <li>
      <NavLink to="diagoriente">
        <div className="my-6 md:my-24 flex flex-col items-center justify-center border-[1px] border-[#4E6295] rounded-xl text-xs text-[#7C95D2] py-3 gap-1 hover:bg-[#1B243D] hover:border-[#1B243D] hover:text-[#7C95D2] transition-colors duration-200">
          <img src={LogoDiagoriente} alt="logo diagoriente" />
          <span>Outil d&apos;aide à l&apos;orientation</span>
        </div>
      </NavLink>
    </li>
  );
}

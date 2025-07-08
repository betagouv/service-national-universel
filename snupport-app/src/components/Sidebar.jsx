import React from "react";
import { HiOutlineChartBar, HiOutlineCog, HiOutlineCollection, HiOutlineTicket, HiUserGroup } from "react-icons/hi";
import { Link, NavLink } from "react-router-dom";

import LogoSNU from "../assets/logo-snu.png";

export default function Sidebar({ user }) {
  return (
    <div className="flex w-[112px] flex-none flex-col items-center bg-purple-snu py-5 px-2">
      <Link to="/" className="mb-5">
        <img className="h-10 w-10" src={LogoSNU} alt="" />
      </Link>
      <div className="flex w-full flex-col gap-2">
        {user.role !== "DG" && <SidebarLink name="Tableau de bord" to="/" icon={<HiOutlineChartBar />} exact />}
        {user.role === "AGENT" ? <SidebarLink name="Tickets" to="/ticket" icon={<HiOutlineTicket />} /> : <SidebarLink name="Messages" to="/ticket" icon={<HiOutlineTicket />} />}

        {user.role === "AGENT" && <SidebarLink name="Base de connaissance" to="/knowledge-base" icon={<HiOutlineCollection />} />}
        {user.role !== "DG" && <SidebarLink name="Paramètres" to="/setting" icon={<HiOutlineCog />} />}
        {user.role === "AGENT" && <SidebarLink name="Agents" to="/agents" icon={<HiUserGroup />} />}
      </div>
    </div>
  );
}

const SidebarLink = ({ name, to, href, icon, exact }) => (
  <>
    {href ? (
      <a href={href} className="flex flex-col items-center gap-2 px-2 py-3 text-light-purple" target="_blank" rel="noreferrer">
        <span className="text-2xl">{icon}</span>
        <span className="text-center text-xs font-medium">{name}</span>
      </a>
    ) : (
      <NavLink to={to} className="flex cursor-pointer flex-col items-center gap-2 px-2 py-3 text-light-purple" activeClassName="bg-accent-color rounded-md" exact={exact}>
        <span className="text-2xl">{icon}</span>
        <span className="text-center text-xs font-medium">{name}</span>
      </NavLink>
    )}
  </>
);

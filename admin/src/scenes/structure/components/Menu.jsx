import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { canViewPatchesHistory, ROLES } from "snu-lib";
import Clock from "../../../assets/Clock";

export default function Menu({ tab, structure }) {
  const user = useSelector((state) => state.Auth.user);

  const tabs = [{ label: "Détails", id: "details", src: `/structure/${structure._id}` }];
  if ([ROLES.ADMIN, ROLES.SUPERVISOR].includes(user.role)) {
    tabs.push({ label: "Missions", id: "missions", src: `/structure/${structure._id}/missions` });
  }
  if (canViewPatchesHistory(user)) {
    tabs.push({ label: "Historique", id: "historique", src: `/structure/${structure._id}/historique`, icon: Clock });
  }

  return (
    <nav className="mx-8 flex gap-8 text-gray-500">
      {tabs.map((t) => (
        <Tab key={t.id} tab={t} active={t.id === tab} />
      ))}
    </nav>
  );
}

const Tab = ({ tab, active = false }) => {
  return (
    <Link to={tab.src} className={`flex cursor-pointer items-center gap-2 pb-4 ${active && "border-b-2 border-blue-600 text-blue-600"}`}>
      {tab.icon && <tab.icon fill="#6B7280" />}
      <p>{tab.label}</p>
    </Link>
  );
};

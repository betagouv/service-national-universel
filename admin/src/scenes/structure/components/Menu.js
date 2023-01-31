import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { canViewPatchesHistory } from "snu-lib";
import { StructureContext } from "../view";
import { useSelector } from "react-redux";
import Clock from "../../../assets/Clock";

export default function Menu({ tab }) {
  const { structure } = useContext(StructureContext);
  const user = useSelector((state) => state.Auth.user);
  const tabs = [
    { label: "Détails", id: "details", src: `/structure/${structure._id}` },
    { label: "Missions", id: "missions", src: `/structure/${structure._id}/missions` },
  ];
  if (canViewPatchesHistory(user)) {
    tabs.push({ label: "Historique", id: "historique", src: `/structure/${structure._id}/historique`, icon: Clock });
  }

  return (
    <nav className="flex gap-8 mx-8 text-gray-500">
      {tabs.map((t) => (
        <Tab key={t.id} tab={t} active={t.id === tab} />
      ))}
    </nav>
  );
}

const Tab = ({ tab, active = false }) => {
  return (
    <Link to={tab.src} className={`flex items-center gap-2 pb-4 cursor-pointer ${active && "text-blue-600 border-b-2 border-blue-600"}`}>
      {tab.icon && <tab.icon fill="#6B7280" />}
      <p>{tab.label}</p>
    </Link>
  );
};

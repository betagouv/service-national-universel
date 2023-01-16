import React from "react";
import { Link } from "react-router-dom";

export default function Menu({ id }) {
  const tabs = [
    { label: "Details", src: `/structure/${id}` },
    { label: "Missions", src: `/structure/${id}/missions` },
    { label: "Historique", src: `/structure/${id}/historic` },
  ];
  const activeTab = tabs.find((tab) => tab.src === window.location.pathname);

  return (
    <div className="flex justify-between items-center border-bottom">
      <nav className="flex items-center gap-10 w-full">
        {tabs.map((tab) => (
          <Link key={tab.label} to={tab.src} className={`py-3 cursor-pointer ${activeTab.label === tab.label && "text-blue-600 border-b-2 border-blue-600"}`}>
            {tab.label}
          </Link>
        ))}
        <button className="ml-auto">Supprimer</button>
      </nav>
    </div>
  );
}

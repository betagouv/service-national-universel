import React from "react";
import { useParams, useHistory, NavLink } from "react-router-dom";

import { environment } from "../../../config";
import General from "./general";
import Pointage from "./pointage";
import FicheSanitaire from "./fiche-sanitaire";
import Menu from "../../../assets/icons/Menu";
import PencilAlt from "../../../assets/icons/PencilAlt";
import ShieldCheck from "../../../assets/icons/ShieldCheck";

export default function CenterYoungIndex() {
  const history = useHistory();
  const { id, sessionId, currentTab } = useParams();

  React.useEffect(() => {
    const listTab = ["general", "tableau-de-pointage", "fiche-sanitaire"];
    if (!listTab.includes(currentTab)) history.push(`/centre/${id}/${sessionId}/general`);
  }, [currentTab]);

  return (
    <>
      <div className="m-4">
        <div className="font-bold text-2xl mb-4">Volontaires</div>
        <div className=" flex flex-1 flex-col lg:flex-row">
          <nav className="flex flex-1 gap-1">
            <TabItem icon={<Menu />} title="Général" to={`/centre/${id}/${sessionId}/general`} />
            <TabItem icon={<PencilAlt />} title="Tableau de pointage" to={`/centre/${id}/${sessionId}/tableau-de-pointage`} />
            <TabItem icon={<ShieldCheck />} title="Fiche sanitaire" to={`/centre/${id}/${sessionId}/fiche-sanitaire`} />
          </nav>
        </div>
        <div className="bg-white pt-4">
          {currentTab === "general" && <General />}
          {currentTab === "tableau-de-pointage" && <Pointage />}
          {currentTab === "fiche-sanitaire" && <FicheSanitaire />}
        </div>
      </div>
    </>
  );
}

const TabItem = ({ to, title, icon }) => (
  <NavLink
    to={to}
    activeClassName="!text-snu-purple-800 bg-white border-none"
    className="text-[13px] px-3 py-2 cursor-pointer text-gray-600 rounded-t-lg bg-gray-50 border-t-[1px] border-r-[1px] border-l-[1px] border-gray-200 hover:text-snu-purple-800">
    <div className="flex items-center gap-2">
      {icon} {title}
    </div>
  </NavLink>
);

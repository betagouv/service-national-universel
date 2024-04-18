import React from "react";
import { Link } from "react-router-dom";

export default function DashboardContainer({ active = "general", availableTab, navChildren, children }) {
  return (
    <div className="mb-8 flex w-full flex-col gap-12">
      <div className="border-bottom flex items-center justify-between px-8">
        <div className="justify-left flex items-center gap-8">
          {availableTab.includes("general") && <TabItem id="general" active={active} label="Vue générale" route={"/dashboard"} />}
          {availableTab.includes("inscription") && <TabItem id="inscription" active={active} label="Inscriptions" route={"/dashboard/inscription"} />}
          {availableTab.includes("sejour") && <TabItem id="sejour" active={active} label="Séjour" route={"/dashboard/sejour"} />}
          {availableTab.includes("engagement") && <TabItem id="engagement" active={active} label="Engagement" route={"/dashboard/engagement"} />}
          {availableTab.includes("analytics") && <TabItem id="analytics" active={active} label="Analytics" route={"/dashboard/analytics"} />}
        </div>
        <div>{navChildren}</div>
      </div>
      <div className="px-8">{children}</div>
    </div>
  );
}

const TabItem = ({ id, active, label, route }) => {
  return (
    <Link className={`cursor-pointer gap-2 py-4 ${active === id ? "border-b-2  border-blue-600 " : ""}`} to={route}>
      <span className={`text-sm font-medium ${active === id ? "text-blue-600" : "text-gray-500"}`}>{label}</span>
    </Link>
  );
};

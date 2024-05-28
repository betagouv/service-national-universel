import React from "react";
import { Link } from "react-router-dom";
import { HiOutlineEye, HiOutlineClipboardCheck, HiOutlineOfficeBuilding, HiOutlineHand } from "react-icons/hi";

export default function DashboardContainer({ active = "general", availableTab, navChildren, children }) {
  return (
    <div className="mb-8 flex w-full flex-col gap-12">
      <div className="border-bottom flex items-center justify-between">
        <div className="justify-left flex items-center gap-1">
          {availableTab.includes("general") && <TabItem id="general" active={active} label="Vue générale" route={"/dashboard"} icon={HiOutlineEye} />}
          {availableTab.includes("inscription") && (
            <TabItem id="inscription" active={active} label="Inscriptions" route={"/dashboard/inscription"} icon={HiOutlineClipboardCheck} />
          )}
          {availableTab.includes("sejour") && <TabItem id="sejour" active={active} label="Séjour" route={"/dashboard/sejour"} icon={HiOutlineOfficeBuilding} />}
          {availableTab.includes("engagement") && <TabItem id="engagement" active={active} label="Engagement" route={"/dashboard/engagement"} icon={HiOutlineHand} />}
          {availableTab.includes("analytics") && <TabItem id="analytics" active={active} label="Analytics" route={"/dashboard/analytics"} />}
        </div>
        <div>{navChildren}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

const TabItem = ({ id, active, label, route, icon }) => {
  let Icon = icon;
  return (
    <Link
      className={`cursor-pointer gap-1 h-9 pl-2.5 pr-[12px] text-gray-500 hover:text-blue-600 mb-[-1px] pb-[1px] ${active === id && "border-b-2  border-blue-500 "}`}
      to={route}>
      <div className="flex items-center gap-1.5">
        <Icon size={20} className={`${active === id && "text-blue-600"}`} />
        <span className={`text-sm font-medium ${active === id && "text-blue-600"}`}>{label}</span>
      </div>
    </Link>
  );
};

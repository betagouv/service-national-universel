import React from "react";
import FlagFr from "../../../assets/flags/FlagFr";

export default function PlanTransportBreadcrumb({ className = "", region = null, department = null, onGoToRegion = () => {}, onGoToNational = () => {} }) {
  return (
    <div className={`flex ${className}`}>
      <Crumb color="#E5E7EB" onClick={onGoToNational} className="z-[2]" key="national">
        <FlagFr />
      </Crumb>
      {region && (
        <Crumb color="#D1D5DB" onClick={onGoToRegion} className="ml-[-12px] z-[1]" key="region">
          {region.label}
        </Crumb>
      )}
      {department && (
        <Crumb color="#9CA3AF" className="ml-[-12px] z-0" key="department">
          {department.label}
        </Crumb>
      )}
    </div>
  );
}

function Crumb({ color, children, className = "", contentClassName = "", onClick = () => {} }) {
  return (
    <div className={`h-[54px] pr-[12px] relative overflow-hidden ${className}`} onClick={onClick}>
      <div className={`absolute w-[54px] h-[54px] right-[0px] top-[-27px] origin-bottom-right rotate-[-20deg]`} style={{ backgroundColor: color }} />
      <div className={`absolute w-[54px] h-[54px] right-[0px] bottom-[-27px] origin-top-right rotate-[20deg]`} style={{ backgroundColor: color }} />
      <div className={`relative h-[100%] flex pl-[22px] pr-[10px] items-center ${contentClassName}`} style={{ backgroundColor: color }}>
        {children}
      </div>
    </div>
  );
}

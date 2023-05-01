import React from "react";
import FlagFr from "../../../assets/flags/FlagFr";
import { getDepartmentNumber } from "snu-lib";

export default function PlanTransportBreadcrumb({ className = "", region = null, department = null, onGoToRegion = () => {}, onGoToNational = () => {} }) {
  return (
    <div className={`flex ${className}`}>
      <Crumb color="#E5E7EB" onClick={onGoToNational} className="z-[2] hover:cursor-pointer" key="national">
        <FlagFr />
      </Crumb>
      {region && (
        <Crumb color="#D1D5DB" onClick={onGoToRegion} className="z-[1] ml-[-12px] hover:cursor-pointer" key="region">
          {region.label}
        </Crumb>
      )}
      {department && (
        <Crumb color="#9CA3AF" className="z-0 ml-[-12px] hover:cursor-pointer" key="department">
          {department.label} ({getDepartmentNumber(department.label)})
        </Crumb>
      )}
    </div>
  );
}

function Crumb({ color, children, className = "", contentClassName = "", onClick = () => {} }) {
  return (
    <div className={`relative h-[54px] overflow-hidden pr-[12px] ${className}`} onClick={onClick}>
      <div className={`absolute right-[0px] top-[-27px] h-[54px] w-[54px] origin-bottom-right rotate-[-20deg]`} style={{ backgroundColor: color }} />
      <div className={`absolute right-[0px] bottom-[-27px] h-[54px] w-[54px] origin-top-right rotate-[20deg]`} style={{ backgroundColor: color }} />
      <div className={`relative flex h-[100%] items-center pl-[22px] pr-[10px] ${contentClassName}`} style={{ backgroundColor: color }}>
        {children}
      </div>
    </div>
  );
}

import React from "react";
import ArrowNarrowLeft from "../../../assets/icons/ArrowNarrowLeft";
import People from "../../../assets/icons/People";
import ChevronRight from "../../../assets/icons/ChevronRight";

export function Title({ children, className = "" }) {
  return <div className={`text-2xl font-bold leading-7 text-[#242526] ${className}`}>{children}</div>;
}

export function SubTitle({ children, className = "" }) {
  return <div className={`text-sm font-normal leading-[14px] text-gray-800 ${className}`}>{children}</div>;
}

export function MiniTitle({ children, className = "" }) {
  return <div className={`text-["#1F2937] text-[14px] font-bold leading-[20px] ${className}`}>{children}</div>;
}

export function Box({ children, className = "" }) {
  return (
    <div className={`relative rounded-[8px] bg-[#FFFFFF] px-[28px] py-[24px] text-[14px] leading-[20px] text-[#1F2937] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

export function BoxHeader({ children, title, className = "" }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text[#111827] text-[23px] font-bold leading-[28px]">{title ? title : ""}</div>
      <div className="">{children}</div>
    </div>
  );
}

export function Loading({ width }) {
  return (
    <div className={`flex animate-pulse space-x-4 ${width}`}>
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-3 gap-4 ">
          <div className="col-span-2 h-2 rounded bg-gray-300"></div>
          <div className="col-span-1 h-2 rounded bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
}

export function GroupMenuItem({ children, onClick }) {
  return (
    <div
      className="flex cursor-pointer items-center justify-between border-b-[1px] border-b-[#E5E7EB] px-[16px] py-[30px] text-[#1F2937] hover:bg-[#E5E7EB] hover:text-[#1F2937]"
      onClick={onClick}>
      <div className="text-[15px] font-bold leading-[18px]">{children}</div>
      <ChevronRight className="text-[#9CA3AF]" />
    </div>
  );
}

export const regionList = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
  "Guadeloupe",
  "Martinique",
  "Guyane",
  "La Réunion",
  "Mayotte",
  "Polynésie française",
  "Nouvelle-Calédonie",
];

export function Badge({ children, mode = "blue", className = "" }) {
  let modeClass;

  switch (mode) {
    case "green":
      modeClass = "bg-[#E4F3EC] text-[#059669]";
      break;
    case "blue":
    default:
      modeClass = "bg-[#E8EDFF] text-[#0063CB]";
  }
  return <div className={`whitespace-nowrap rounded-[4px] px-[6px] py-[0px] leading-[20px] text-[12x] ${modeClass} ${className}`}>{children}</div>;
}

export function AlertPoint({ threshold, value, className = "" }) {
  if (value > threshold) {
    return null;
  } else {
    return <div className={`mr-[5px] h-[8px] w-[8px] rounded-[100px] bg-[#F97316] ${className}`} />;
  }
}

export function BigDigits({ children, className = "" }) {
  return <div className={`text-[24px] font-bold leading-[28px] text-[#171725] ${className}`}>{children}</div>;
}

export function GroupBox({ className = "", children }) {
  return <div className={`rounded-[8px] bg-[#F7F7F8] p-[16px] ${className}`}>{children}</div>;
}

export function GroupHeader({ className = "", children, onBack, noBack = false }) {
  return (
    <div className={`flex items-center px-[10px] pt-[7px] pb-[19px] text-[20px] font-bold leading-[28px] text-[#242526] ${className}`}>
      {!noBack && (
        <div
          className="mr-[11px] flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full bg-[#E5E7EB] text-[#374151] hover:bg-[#374151] hover:text-[#E5E7EB]"
          onClick={onBack}>
          <ArrowNarrowLeft />
        </div>
      )}
      {children}
    </div>
  );
}

export function GroupSummary({ group, className = "" }) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`rounded-full px-[10px] text-[11px] font-medium leading-[22px] text-[#FFFFFF] ${group.centerId ? "bg-[#9CA3AF]" : "bg-[#0C4A6E]"}`}>
        {group.centerId ? "Affecté" : "En attente d'affectation"}
      </div>
      <div className="flex items-center">
        <People className="mx-[5px] text-[#9CA3AF]" />
        {group.youngsVolume}
      </div>
    </div>
  );
}
export const TabItem = ({ active, title, icon, onClick }) => (
  <div
    onClick={onClick}
    className={`mr-2 cursor-pointer rounded-t-lg px-3 py-2 text-[13px] text-gray-600 hover:text-snu-purple-800 ${
      active ? "border-none bg-white !text-snu-purple-800" : "border-x border-t border-gray-200 bg-gray-100"
    }`}>
    <div className={"flex items-center gap-2"}>
      {icon} {title}
    </div>
  </div>
);

export const getStatusClass = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-[#F97316]";
    case "ACCEPTED":
      return "bg-[#10B981]";
    case "REJECTED":
      return "bg-[#EF4444]";
    default:
      return "bg-orange-500";
  }
};

export const translateStatus = (status) => {
  switch (status) {
    case "PENDING":
      return "À traiter";
    case "ACCEPTED":
      return "Validée";
    case "REJECTED":
      return "Refusée";
    default:
      return "À traiter";
  }
};

export const getInitials = (word) =>
  (word || "")
    .match(/\b(\w)/g)
    .join("")
    .substring(0, 2)
    .toUpperCase();

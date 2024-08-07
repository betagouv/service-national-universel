import { JVA_MISSION_DOMAINS } from "snu-lib";

export const statusColors = {
  WAITING_VALIDATION: "bg-[#ECECFE] text-blue-france-sun-113",
  WAITING_VERIFICATION: "bg-[#ECECFE] text-blue-france-sun-113",
  WAITING_ACCEPTATION: "bg-[#FEF3C7] text-[#78350F]",
  WAITING_CORRECTION: "bg-[#FEF3C7] text-[#78350F]",
  REFUSED: "bg-gray-100 text-gray-700",
  CANCEL: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-600 text-white",
  VALIDATED: "bg-[#B8FEC9] text-[#0F4B26]",
  DONE: "bg-[#B8FEC9] text-[#0F4B26]",
  ABANDON: "bg-gray-100 text-gray-700",
};

export const JvaDomainOptions = Object.entries(JVA_MISSION_DOMAINS).map(([key, value]) => ({ value: key, label: value }));

import React from "react";
import { YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, YOUNG_STATUS_PHASE3 } from "snu-lib";

const statusActive = [YOUNG_STATUS_PHASE1.AFFECTED, YOUNG_STATUS_PHASE1.WAITING_AFFECTATION, YOUNG_STATUS_PHASE2.IN_PROGRESS, YOUNG_STATUS_PHASE3.WAITING_VALIDATION];

export default function StatusPill({ status }) {
  if (status && statusActive.includes(status)) {
    return <p className="bg-[#2563EB] rounded-full text-xs text-[#D1DAEF] px-2 py-0.5 shadow-sm text-center w-fit">En cours</p>;
  }
  if (status && status === "EXEMPTED") {
    return <p className="bg-[#1E3A8A] rounded-full text-xs text-[#D1DAEF] px-2 py-0.5 shadow-sm text-center w-fit">Dispensé</p>;
  }
  return null;
}

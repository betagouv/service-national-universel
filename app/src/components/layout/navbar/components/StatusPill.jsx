import React from "react";
import { YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, YOUNG_STATUS_PHASE3 } from "snu-lib";

const statusActive = [YOUNG_STATUS_PHASE1.AFFECTED, YOUNG_STATUS_PHASE1.WAITING_AFFECTATION, YOUNG_STATUS_PHASE2.IN_PROGRESS, YOUNG_STATUS_PHASE3.WAITING_VALIDATION];

export default function StatusPill({ status }) {
  if (status && statusActive.includes(status)) {
    return <p className="w-fit rounded-full bg-[#2563EB] px-2 py-0.5 text-center text-xs text-[#D1DAEF] shadow-sm">En cours</p>;
  }
  if (status && status === "EXEMPTED") {
    return <p className="w-fit rounded-full bg-[#1E3A8A] px-2 py-0.5 text-center text-xs text-[#D1DAEF] shadow-sm">Dispensé</p>;
  }
  return null;
}

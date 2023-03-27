import React from "react";
import StatusText from "./StatusText";

export default function StatusPhase1({ statusPhase1, total }) {
  const WAITING_AFFECTATION = statusPhase1?.WAITING_AFFECTATION || 0;
  const AFFECTED = statusPhase1?.AFFECTED || 0;
  const DONE = statusPhase1?.DONE || 0;
  const NOT_DONE = statusPhase1?.NOT_DONE || 0;
  const EXEMPTED = statusPhase1?.EXEMPTED || 0;

  return (
    <div className="flex flex-col gap-6 w-[70%] bg-white rounded-lg shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] px-8 py-6 h-[220px]">
      <p className="text-base leading-5 font-bold text-gray-900">Statut de phase 1</p>
      <div className="flex">
        <div className="flex flex-col w-[45%] gap-2">
          <StatusText status="En attente d'affectation" nb={WAITING_AFFECTATION} percentage={total && WAITING_AFFECTATION ? ((WAITING_AFFECTATION / total) * 100).toFixed(0) : 0} />
          <StatusText status="Affectée" nb={AFFECTED || 0} percentage={total && AFFECTED ? ((AFFECTED / total) * 100).toFixed(0) : 0} />
          <StatusText status="Validée" nb={DONE || 0} percentage={total && DONE ? ((DONE / total) * 100).toFixed(0) : 0} />
        </div>
        <div className="flex w-[10%] justify-center items-center">
          <div className="w-[1px] h-3/5 border-r-[1px] border-gray-300"></div>
        </div>
        <div className="flex flex-col w-[45%] gap-1">
          <StatusText status="Non réalisée" nb={NOT_DONE || 0} percentage={total && NOT_DONE ? ((NOT_DONE / total) * 100).toFixed(0) : 0} />
          <StatusText status="Dispensée" nb={EXEMPTED || 0} percentage={total && EXEMPTED ? ((EXEMPTED / total) * 100).toFixed(0) : 0} />
        </div>
      </div>
    </div>
  );
}

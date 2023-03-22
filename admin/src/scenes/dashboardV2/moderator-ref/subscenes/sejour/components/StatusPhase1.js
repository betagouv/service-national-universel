import React from "react";
import StatusText from "./StatusText";

export default function StatusPhase1() {
  return (
    <div className="flex flex-col gap-6 w-[70%] bg-white rounded-lg shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] px-8 py-6 h-[220px]">
      <p className="text-base leading-5 font-bold text-gray-900">Statut de phase 1</p>
      <div className="flex">
        <div className="flex flex-col w-[45%] gap-1">
          <StatusText status="En attente d'affectation" nb={0} percentage={0} />
          <StatusText status="Affectée" nb={0} percentage={0} />
          <StatusText status="Validée" nb={0} percentage={0} />
          <StatusText status="Sur liste complémentaire" nb={0} percentage={0} />
        </div>
        <div className="flex w-[10%] justify-center items-center">
          <div className="w-[1px] h-3/5 border-r-[1px] border-gray-300"></div>
        </div>
        <div className="flex flex-col w-[45%] gap-1">
          <StatusText status="Non réalisée" nb={0} percentage={0} />
          <StatusText status="Dispensée" nb={0} percentage={0} />
          <StatusText status="Désistée" nb={0} percentage={0} />
        </div>
      </div>
    </div>
  );
}

import React from "react";

export default function StatutPhase({ values }) {
  const total = Object.values(values).reduce((acc, cur) => acc + cur, 0);

  const computePercentage = (val) => {
    return Math.round((val / total) * 100);
  };
  return (
    <div className="flex flex-col gap-6  bg-white rounded-lg shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] px-8 py-6">
      <p className="text-base leading-5 font-bold text-gray-900">Statut des inscriptions</p>
      <div className="flex flex-wrap justify-between w-full">
        <div className="flex flex-col min-w-[30%] gap-2">
          <StatusText status="En cours" nb={values.IN_PROGRESS} percentage={computePercentage(values.IN_PROGRESS)} />
          <StatusText status="En attente de validation" nb={values.WAITING_VALIDATION} percentage={computePercentage(values.WAITING_VALIDATION)} />
          <StatusText status="En attente de correction" nb={values.WAITING_CORRECTION} percentage={computePercentage(values.WAITING_CORRECTION)} />
          <StatusText status="Validées sur liste principale" nb={values.VALIDATED} percentage={computePercentage(values.VALIDATED)} />
        </div>
        <div className="flex  justify-center items-center">
          <div className="w-[1px] h-3/5 border-r-[1px] border-gray-300" />
        </div>
        <div className="flex flex-col min-w-[30%] gap-2">
          <StatusText status="Validées sur liste complémentaire" nb={values.WAITING_LIST} percentage={computePercentage(values.WAITING_LIST)} />
          <StatusText status="Refusées" nb={values.REFUSED} percentage={computePercentage(values.REFUSED)} />
          <StatusText status="Réinscriptions" nb={values.REINSCRIPTION} percentage={computePercentage(values.REINSCRIPTION)} />
          <StatusText status="Non éligibles" nb={values.NOT_ELIGIBLE} percentage={computePercentage(values.NOT_ELIGIBLE)} />
        </div>
        <div className="flex  justify-center items-center">
          <div className="w-[1px] h-3/5 border-r-[1px] border-gray-300" />
        </div>
        <div className="flex flex-col min-w-[30%] gap-2 justify-center">
          <StatusText status="Abandonnées" nb={values.ABANDONED} percentage={computePercentage(values.ABANDONED)} />
          <StatusText status="Non autorisées" nb={values.NOT_AUTORISED} percentage={computePercentage(values.NOT_AUTORISED)} />
          <StatusText status="Supprimées" nb={values.DELETED} percentage={computePercentage(values.DELETED)} />
        </div>
      </div>
    </div>
  );
}

function StatusText({ status, nb, percentage }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 justify-end w-full float-right">
        <span className="font-bold text-lg text-gray-900 text-right w-[10%]">{nb}</span>
        <div className="w-[80%] ml-4">
          <p className="text-sm text-gray-600">{status}</p>
        </div>
      </div>
      <p className="text-sm text-gray-400 w-[10%]">({percentage}%)</p>
    </div>
  );
}

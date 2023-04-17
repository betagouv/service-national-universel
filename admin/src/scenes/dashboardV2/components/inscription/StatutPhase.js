import React from "react";

export default function StatutPhase({ values }) {
  const total = Object.values(values).reduce((acc, cur) => acc + cur, 0);

  const computePercentage = (val) => {
    return Math.round((val / total) * 100) || 0;
  };
  return (
    <div className="flex flex-col gap-6  rounded-lg bg-white px-8 py-6 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
      <p className="text-base font-bold leading-5 text-gray-900">Statut des inscriptions</p>
      <div className="flex w-full flex-wrap justify-between">
        <div className="flex min-w-[30%] flex-col gap-2">
          <StatusText status="En cours" nb={values.IN_PROGRESS || 0} percentage={computePercentage(values.IN_PROGRESS)} />
          <StatusText status="En attente de validation" nb={values.WAITING_VALIDATION || 0} percentage={computePercentage(values.WAITING_VALIDATION)} />
          <StatusText status="En attente de correction" nb={values.WAITING_CORRECTION || 0} percentage={computePercentage(values.WAITING_CORRECTION)} />
          <StatusText status="Validées sur liste principale" nb={values.VALIDATED || 0} percentage={computePercentage(values.VALIDATED)} />
        </div>
        <div className="flex  items-center justify-center">
          <div className="h-3/5 w-[1px] border-r-[1px] border-gray-300" />
        </div>
        <div className="flex min-w-[30%] flex-col gap-2">
          <StatusText status="Validées sur liste complémentaire" nb={values.WAITING_LIST || 0} percentage={computePercentage(values.WAITING_LIST)} />
          <StatusText status="Refusées" nb={values.REFUSED || 0} percentage={computePercentage(values.REFUSED)} />
          <StatusText status="Réinscriptions" nb={values.REINSCRIPTION || 0} percentage={computePercentage(values.REINSCRIPTION)} />
          <StatusText status="Non éligibles" nb={values.NOT_ELIGIBLE || 0} percentage={computePercentage(values.NOT_ELIGIBLE)} />
        </div>
        <div className="flex  items-center justify-center">
          <div className="h-3/5 w-[1px] border-r-[1px] border-gray-300" />
        </div>
        <div className="flex min-w-[30%] flex-col justify-center gap-2">
          <StatusText status="Abandonnées" nb={values.ABANDONED || 0} percentage={computePercentage(values.ABANDONED)} />
          <StatusText status="Non autorisées" nb={values.NOT_AUTORISED || 0} percentage={computePercentage(values.NOT_AUTORISED)} />
          <StatusText status="Supprimées" nb={values.DELETED || 0} percentage={computePercentage(values.DELETED)} />
        </div>
      </div>
    </div>
  );
}

function StatusText({ status, nb, percentage }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="float-right flex w-full items-center justify-end gap-2">
        <span className="w-[10%] text-right text-lg font-bold text-gray-900">{nb}</span>
        <div className="ml-4 w-[80%]">
          <p className="text-sm text-gray-600">{status}</p>
        </div>
      </div>
      <p className="w-[10%] text-sm text-gray-400">({percentage}%)</p>
    </div>
  );
}

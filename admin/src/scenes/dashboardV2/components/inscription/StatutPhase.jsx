import queryString from "query-string";
import { Link } from "react-router-dom";
import { getNewLink } from "../../../../utils";
import React from "react";

export default function StatutPhase({ values, filter }) {
  const total = Object.values(values).reduce((acc, cur) => acc + cur, 0);

  const computePercentage = (val) => {
    return Math.round((val / total) * 100) || 0;
  };
  return (
    <div className="flex flex-col gap-6  rounded-lg bg-white px-8 py-6 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
      <p className="text-base font-bold leading-5 text-gray-900">Statut des inscriptions</p>
      <div className="flex w-full flex-wrap justify-between">
        <div className="flex min-w-[30%] flex-col gap-2">
          <StatusText
            status="En cours"
            nb={values.IN_PROGRESS || 0}
            percentage={computePercentage(values.IN_PROGRESS)}
            filter={filter}
            filtersUrl={[queryString.stringify({ status: "IN_PROGRESS" })]}
            base="/inscription"
          />
          <StatusText
            status="En attente de validation"
            nb={values.WAITING_VALIDATION || 0}
            percentage={computePercentage(values.WAITING_VALIDATION)}
            filter={filter}
            filtersUrl={[queryString.stringify({ status: "WAITING_VALIDATION" })]}
            base="/inscription"
          />
          <StatusText
            status="En attente de correction"
            nb={values.WAITING_CORRECTION || 0}
            percentage={computePercentage(values.WAITING_CORRECTION)}
            filter={filter}
            filtersUrl={[queryString.stringify({ status: "WAITING_CORRECTION" })]}
            base="/inscription"
          />
          <StatusText
            status="Validées sur liste principale"
            nb={values.VALIDATED || 0}
            percentage={computePercentage(values.VALIDATED)}
            filter={filter}
            filtersUrl={[queryString.stringify({ status: "VALIDATED" })]}
            base="/volontaire"
          />
        </div>
        <div className="flex  items-center justify-center">
          <div className="h-3/5 w-[1px] border-r-[1px] border-gray-300" />
        </div>
        <div className="flex min-w-[30%] flex-col gap-2">
          <StatusText
            status="Validées sur liste complémentaire"
            nb={values.WAITING_LIST || 0}
            percentage={computePercentage(values.WAITING_LIST)}
            filter={filter}
            filtersUrl={[queryString.stringify({ status: "WAITING_LIST" })]}
            base="/volontaire"
          />
          <StatusText
            status="Refusées"
            nb={values.REFUSED || 0}
            percentage={computePercentage(values.REFUSED)}
            filter={filter}
            filtersUrl={[queryString.stringify({ status: "REFUSED" })]}
            base="/inscription"
          />
          <StatusText
            status="Réinscriptions"
            nb={values.REINSCRIPTION || 0}
            percentage={computePercentage(values.REINSCRIPTION)}
            filter={filter}
            filtersUrl={[queryString.stringify({ status: "REINSCRIPTION" })]}
            base="/inscription"
          />
          <StatusText
            status="Non éligibles"
            nb={values.NOT_ELIGIBLE || 0}
            percentage={computePercentage(values.NOT_ELIGIBLE)}
            filter={filter}
            filtersUrl={[queryString.stringify({ status: "NOT_ELIGIBLE" })]}
            base="/inscription"
          />
        </div>
        <div className="flex  items-center justify-center">
          <div className="h-3/5 w-[1px] border-r-[1px] border-gray-300" />
        </div>
        <div className="flex min-w-[30%] flex-col justify-center gap-2">
          <StatusText
            status="Abandonnées"
            nb={values.ABANDONED || 0}
            percentage={computePercentage(values.ABANDONED)}
            filter={filter}
            filtersUrl={[queryString.stringify({ status: "ABANDONED" })]}
            base="/inscription"
          />

          <StatusText
            status="Non autorisées"
            nb={values.NOT_AUTORISED || 0}
            percentage={computePercentage(values.NOT_AUTORISED)}
            filter={filter}
            filtersUrl={[queryString.stringify({ status: "NOT_AUTORISED" })]}
            base="/inscription"
          />
          <StatusText
            status="Désistées"
            nb={values.WITHDRAWN || 0}
            percentage={computePercentage(values.WITHDRAWN)}
            filter={filter}
            filtersUrl={[[queryString.stringify({ status: "WITHDRAWN" })]]}
            base="/volontaire"
          />
          <StatusText
            status="Supprimées"
            nb={values.DELETED || 0}
            percentage={computePercentage(values.DELETED)}
            filter={filter}
            filtersUrl={[[queryString.stringify({ status: "DELETED" })]]}
            base="/volontaire"
          />
        </div>
      </div>
    </div>
  );
}

function StatusText({ status, nb, percentage, filter, filtersUrl, base }) {
  return (
    <Link className="flex items-center justify-between gap-2" to={getNewLink({ base, filter, filtersUrl })} target={"_blank"}>
      <div className="float-right flex w-full items-center justify-end gap-2">
        <span className="w-[10%] text-right text-lg font-bold text-gray-900">{nb}</span>
        <div className="ml-4 w-[80%]">
          <p className="text-sm text-gray-600">{status}</p>
        </div>
      </div>
      <p className="w-[10%] text-sm text-gray-400">({percentage}%)</p>
    </Link>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { getLink as getOldLink } from "../../../../utils";

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
            filtersUrl={['STATUS=%5B"IN_PROGRESS"%5D']}
            base="/inscription"
          />
          <StatusText
            status="En attente de validation"
            nb={values.WAITING_VALIDATION || 0}
            percentage={computePercentage(values.WAITING_VALIDATION)}
            filter={filter}
            filtersUrl={['STATUS=%5B"WAITING_VALIDATION"%5D']}
            base="/inscription"
          />
          <StatusText
            status="En attente de correction"
            nb={values.WAITING_CORRECTION || 0}
            percentage={computePercentage(values.WAITING_CORRECTION)}
            filter={filter}
            filtersUrl={['STATUS=%5B"WAITING_CORRECTION"%5D']}
            base="/inscription"
          />
          <StatusText
            status="Validées sur liste principale"
            nb={values.VALIDATED || 0}
            percentage={computePercentage(values.VALIDATED)}
            filter={filter}
            filtersUrl={['STATUS=%5B"VALIDATED"%5D']}
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
            filtersUrl={['STATUS=%5B"WAITING_LIST"%5D']}
            base="/volontaire"
          />
          <StatusText
            status="Refusées"
            nb={values.REFUSED || 0}
            percentage={computePercentage(values.REFUSED)}
            filter={filter}
            filtersUrl={['STATUS=%5B"REFUSED"%5D']}
            base="/inscription"
          />
          <StatusText
            status="Réinscriptions"
            nb={values.REINSCRIPTION || 0}
            percentage={computePercentage(values.REINSCRIPTION)}
            filter={filter}
            filtersUrl={['STATUS=%5B"REINSCRIPTION"%5D']}
            base="/inscription"
          />
          <StatusText
            status="Non éligibles"
            nb={values.NOT_ELIGIBLE || 0}
            percentage={computePercentage(values.NOT_ELIGIBLE)}
            filter={filter}
            filtersUrl={['STATUS=%5B"NOT_ELIGIBLE"%5D']}
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
            filtersUrl={['STATUS=%5B"ABANDONED"%5D']}
            base="/inscription"
          />

          <StatusText
            status="Non autorisées"
            nb={values.NOT_AUTORISED || 0}
            percentage={computePercentage(values.NOT_AUTORISED)}
            filter={filter}
            filtersUrl={['STATUS=%5B"NOT_AUTORISED"%5D']}
            base="/inscription"
          />
          <StatusText
            status="Supprimées"
            nb={values.DELETED || 0}
            percentage={computePercentage(values.DELETED)}
            filter={filter}
            filtersUrl={['STATUS=%5B"DELETED"%5D']}
            base="/volontaire"
          />
        </div>
      </div>
    </div>
  );
}

function StatusText({ status, nb, percentage, filter, filtersUrl, base }) {
  return (
    <Link className="flex items-center justify-between gap-2" to={getOldLink({ base, filter, filtersUrl })} target={"_blank"}>
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

import React from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiExclamation } from "react-icons/hi";

import { COHORT_TYPE } from "snu-lib";

import { capture } from "@/sentry";
import api from "@/services/api";
import { CohortState } from "@/redux/cohorts/reducer";

import { PlainButton } from "../../../components/Buttons";
import { ImportSummaryResponse } from "../type";

interface Props {
  cohort: string;
  addLigne?: string | null;
  summary: ImportSummaryResponse | null;
}

export default function Resum({ summary, cohort, addLigne }: Props) {
  const cohorts = useSelector((state: CohortState) => state.Cohorts);
  const currentCohort = cohorts.find((c) => c.name === cohort);
  const [isLoading, setIsLoading] = React.useState(false);
  const history = useHistory();

  async function onSubmit() {
    setIsLoading(true);
    try {
      const { ok } = await api.post(`/plan-de-transport/import/${summary?._id}/execute`, {});
      if (!ok) {
        toastr.error("Impossible d'importer le plan de transport. Veuillez réessayer dans quelques instants.", "");
      } else {
        toastr.success("Import réussi.", "");
        history.push(`/ligne-de-bus?cohort=${cohort}`);
      }
    } catch (err) {
      capture(err);
      toastr.error("Une erreur interne est survenue pendant l'import. Veuillez réessayer dans quelques instants.", "");
    }
    setIsLoading(false);
  }

  return (
    <>
      <div className="mt-8 flex w-full flex-col gap-6 rounded-xl bg-white px-8 pt-12 pb-24">
        <div className="pb-4 text-center text-xl font-medium leading-7 text-gray-900">Vous vous apprêtez à {addLigne ? "ajouter" : "importer"}...</div>
        <div className="bg-amber-50 text-amber-700 py-4 flex gap-4 pl-4 rounded-md">
          <HiExclamation size={20} color="#FBBF24" className="mt-0.5" />
          <div className="text-sm leading-5">
            <p className="font-medium">Attention</p>
            <p>
              Le plus grand nombre de Points de rassemblement importés pour une ligne de bus est de : <span className="font-bold">{summary?.maxPdrOnLine}</span>.
            </p>
            <p>Si vous constatez une incohérence, veuillez vérifier les noms de vos colonnes svp.</p>
          </div>
        </div>
        <div className="flex items-stretch justify-center gap-6 pt-6 pb-12">
          <div className="flex h-32 w-52 flex-col justify-center rounded-xl bg-gray-100 px-4">
            <div className="text-[42px] font-extrabold leading-[120%] text-gray-800">{summary?.busLineCount}</div>
            <div className="text-xs font-medium leading-5 text-gray-800">lignes de transport {addLigne && "supplémentaires"}</div>
          </div>
          <div className="flex h-32 w-52 flex-col justify-center rounded-xl bg-gray-100 px-4">
            <div className="text-[42px] font-extrabold leading-[120%] text-gray-800">{summary?.centerCount}</div>
            <div className="text-xs font-medium leading-5 text-gray-800">centres de cohésion {addLigne && "supplémentaires"}</div>
          </div>
          {currentCohort?.type === COHORT_TYPE.CLE && (
            <div className="flex h-32 w-52 flex-col justify-center rounded-xl bg-gray-100 px-4">
              <div className="text-[42px] font-extrabold leading-[120%] text-gray-800">{summary?.classeCount}</div>
              <div className="text-xs font-medium leading-5 text-gray-800">classes {addLigne && "supplémentaires"}</div>
            </div>
          )}
          <div className="flex h-32 w-52 flex-col justify-center rounded-xl bg-gray-100 px-4">
            <div className="text-[42px] font-extrabold leading-[120%] text-gray-800">{summary?.pdrCount}</div>
            <div className="text-xs font-medium leading-5 text-gray-800">points de rassemblement {addLigne && "supplémentaires"}</div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <PlainButton disabled={isLoading} spinner={isLoading} onClick={onSubmit}>
          {addLigne ? "Importer ces lignes supplémentaires" : "Importer ce plan de transport"}
        </PlainButton>
      </div>
    </>
  );
}

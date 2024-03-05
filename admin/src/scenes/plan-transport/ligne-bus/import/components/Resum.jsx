import React from "react";
import { PlainButton } from "../../../components/Buttons";
import { capture } from "../../../../../sentry";
import { toastr } from "react-redux-toastr";
import api from "../../../../../services/api";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { COHORT_TYPE } from "snu-lib";

export default function Resum({ summary, cohort }) {
  const cohorts = useSelector((state) => state.Cohorts);
  const currentCohort = cohorts.find((c) => c.name === cohort);
  const [isLoading, setIsLoading] = React.useState(false);
  const history = useHistory();

  async function onSubmit() {
    setIsLoading(true);
    try {
      const { ok } = await api.post(`/plan-de-transport/import/${summary._id}/execute`, {});
      if (!ok) {
        toastr.error("Impossible d'importer le plan de transport. Veuillez réessayer dans quelques instants.");
      } else {
        toastr.success("Import réussi.");
        history.push(`/ligne-de-bus?cohort=${cohort}`);
      }
    } catch (err) {
      capture(err);
      toastr.error("Une erreur interne est survenue pendant l'import. Veuillez réessayer dans quelques instants.");
    }
    setIsLoading(false);
  }

  return (
    <>
      <div className="mt-8 flex w-full flex-col gap-6 rounded-xl bg-white px-8 pt-12 pb-24">
        <div className="pb-4 text-center text-xl font-medium leading-7 text-gray-900">Vous vous apprêtez à importer...</div>
        <div className="flex items-stretch justify-center gap-6 pt-6 pb-12">
          <div className="flex h-32 w-52 flex-col justify-center rounded-xl bg-gray-100 px-4">
            <div className="text-[42px] font-extrabold leading-[120%] text-gray-800">{summary.busLineCount}</div>
            <div className="text-xs font-medium leading-5 text-gray-800">lignes de transport</div>
          </div>
          <div className="flex h-32 w-52 flex-col justify-center rounded-xl bg-gray-100 px-4">
            <div className="text-[42px] font-extrabold leading-[120%] text-gray-800">{summary.centerCount}</div>
            <div className="text-xs font-medium leading-5 text-gray-800">centres de cohésion</div>
          </div>
          {currentCohort.type === COHORT_TYPE.CLE && (
            <div className="flex h-32 w-52 flex-col justify-center rounded-xl bg-gray-100 px-4">
              <div className="text-[42px] font-extrabold leading-[120%] text-gray-800">{summary.classeCount}</div>
              <div className="text-xs font-medium leading-5 text-gray-800">classes</div>
            </div>
          )}
          <div className="flex h-32 w-52 flex-col justify-center rounded-xl bg-gray-100 px-4">
            <div className="text-[42px] font-extrabold leading-[120%] text-gray-800">{summary.pdrCount}</div>
            <div className="text-xs font-medium leading-5 text-gray-800">points de rassemblement</div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <PlainButton className="w-52" disabled={isLoading} spinner={isLoading} onClick={onSubmit}>
          Importer
        </PlainButton>
      </div>
    </>
  );
}

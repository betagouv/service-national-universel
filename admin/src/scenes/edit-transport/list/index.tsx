import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import { ROLES, translate } from "snu-lib";

import { BusLine, Young } from "@/types";
import { capture } from "@/sentry";
import api from "@/services/api";
import { CohortState } from "@/redux/cohorts/reducer";
import { AuthState } from "@/redux/auth/reducer";

import Breadcrumbs from "@/components/Breadcrumbs";
import { Filters, ResultTable } from "@/components/filters-system-v2";
import Loader from "@/components/Loader";
import SelectCohort from "@/components/cohorts/SelectCohort";

import { Title } from "../../plan-transport/components/commons";
import LigneDeBus from "./Ligne-de-bus";
import TooltipDeleteButtonPlan from "./components/TooltipDeleteButtonPlan";

export default function List() {
  const history = useHistory();

  const { user, sessionPhase1 } = useSelector((state: AuthState) => state.Auth);
  const cohorts = useSelector((state: CohortState) => state.Cohorts);

  const urlParams = new URLSearchParams(window.location.search);
  const defaultCohort = user.role === ROLES.ADMIN && sessionPhase1 ? sessionPhase1.cohort : cohorts?.[0]?.name;

  const [cohort, setCohort] = useState(urlParams.get("cohort") || defaultCohort);
  const [isLoading, setIsLoading] = useState(true);
  const [hasValue, setHasValue] = useState(false);

  const getPlanDetransport = async () => {
    try {
      setIsLoading(true);
      const { ok, code, data: reponseBus } = await api.get(`/ligne-de-bus/cohort/${cohort}/hasValue`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération du plan de transport", translate(code));
      }
      setHasValue(reponseBus);
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du bus", "");
    }
  };

  useEffect(() => {
    if (cohort) {
      history.push(`/edit-transport?cohort=${cohort}`);
      setCohort(cohort);
    }
    getPlanDetransport();
  }, [cohort]);

  if (isLoading || !cohort) return <Loader />;

  return (
    <>
      <Breadcrumbs items={[{ label: "Edit plan de transport" }]} />
      <div className="flex w-[calc(100vw-240px)] flex-col px-8">
        <div className="flex items-center justify-between px-8 py-8">
          <Title>Edit plan de transport</Title>
          <SelectCohort
            cohort={cohort}
            onChange={(cohortName) => {
              setCohort(cohortName);
              history.replace({ search: `?cohort=${cohortName}` });
            }}
          />
        </div>
        {hasValue ? (
          <ReactiveList cohort={cohort} />
        ) : (
          <div className="m-auto flex w-[450px] flex-col items-center justify-center gap-4 pt-12">
            <div className="text-2xl font-bold leading-7 text-gray-800">Aucun Transport pour cette période</div>
          </div>
        )}
      </div>
    </>
  );
}

const ReactiveList = ({ cohort }) => {
  const history = useHistory();

  const [lines, setLines] = useState<{ _id: string }[]>([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({ page: 0 });
  const [youngs, setYoungs] = useState<Young[]>();
  const [allLines, setAllLines] = useState<BusLine[]>();
  const [size, setSize] = useState(10);

  const pageId = "edittransport";

  useEffect(() => {
    try {
      const getAllLines = async () => {
        const res = await api.get(`/edit-transport/allLines/${cohort}`);
        if (res.ok) setAllLines(res.data.reverse());
        else console.log("Oups, une erreur est survenue lors de la récupération des lines");
      };
      if (cohort) getAllLines();
    } catch (e) {
      capture(e);
      console.log("Oups, une erreur est survenue lors de la récupération des lines");
    }
  }, [cohort]);

  useEffect(() => {
    if (!allLines || !allLines.length) return;
    try {
      const getYoungs = async () => {
        const ligneIds = allLines.map((e) => e._id);

        const res = await api.post("/edit-transport/youngs", { ligneIds, cohort });
        if (res.ok) {
          setYoungs(res.data);
        } else toastr.error("Oups, une erreur est survenue lors de la récupération des jeunes", "");
      };
      getYoungs();
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des jeunes", "");
    }
  }, [allLines]);

  const deletePlan = () => {
    // TODO
  };

  const filterArray = [{ title: "Numéro de la ligne", name: "busId", parentGroup: "Bus", missingLabel: "Non renseigné" }].filter((e) => e);

  return (
    <div className="mb-8 flex flex-col rounded-lg bg-white py-4">
      <div className="flex items-center justify-between bg-white px-4 pt-2">
        <div className="flex items-center justify-center gap-2">
          <Filters
            // @ts-expect-error update Filters types
            defaultUrlParam={`cohort=${cohort}`}
            pageId={pageId}
            route="/elasticsearch/lignebus/search"
            setData={(value) => setLines(value)}
            filters={filterArray}
            searchPlaceholder="Rechercher une ligne (numéro, ville, region)"
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            paramData={paramData}
            setParamData={setParamData}
            size={size}
          />
        </div>
        {youngs && !youngs.length ? (
          <button onClick={deletePlan} className="bg-red-600 rounded shadow-xl px-3 py-2 hover:scale-105 duration-200 ease-in-out border text-white">
            Supprimer le plan de transport
          </button>
        ) : (
          <TooltipDeleteButtonPlan youngs={youngs} cohort={cohort}>
            <button disabled className="bg-red-600 rounded px-3 py-2 duration-200 ease-in-out border text-white cursor-not-allowed opacity-50">
              Supprimer le plan de transport
            </button>
          </TooltipDeleteButtonPlan>
        )}
        <button
          className="flex min-w-[100px] h-8 cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-3 py-3 disabled:cursor-wait disabled:opacity-50"
          onClick={() => {
            history.push(`/edit-transport/deplacement?cohort=${cohort}`);
          }}>
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-sm font-medium text-snu-purple-800">Déplacement des jeunes</span>
          </div>
        </button>
      </div>
      <ResultTable
        paramData={paramData}
        setParamData={setParamData}
        currentEntryOnPage={lines?.length}
        size={size}
        // @ts-expect-error update ResultTable types
        setSize={setSize}
        render={
          <div className="overflow-x-scroll w-full mt-2">
            <table className="top-0 w-full divide-y divide-gray-100" style={{ borderCollapse: "separate", borderSpacing: "0 0.1em" }}>
              <thead className="w-full">
                <tr className="divide-x divide-y divide-gray-300 w-full text-xs uppercase text-gray-400 ">
                  <th className="px-1 py-3 whitespace-nowrap font-normal"></th>
                  <th className="px-1 py-3 whitespace-nowrap font-normal">Lignes</th>
                  <th className="px-1 whitespace-nowrap font-normal">Pts de Rdv</th>
                  <th className="px-1 whitespace-nowrap font-normal">Date de départ</th>
                  <th className="px-1 whitespace-nowrap font-normal">Départ</th>
                  <th className="px-1 whitespace-nowrap font-normal">Arrivée</th>
                  <th className="px-1 whitespace-nowrap font-normal">Heure d'arrivée</th>
                  <th className="px-1 whitespace-nowrap font-normal">Centre de destination</th>
                  <th className="px-1 whitespace-nowrap font-normal">Date de retour</th>
                  <th className="px-1 whitespace-nowrap font-normal">Heure départ retour</th>
                  <th className="px-1 whitespace-nowrap font-normal">Affectation</th>
                  <th className="px-1 whitespace-nowrap font-normal">Capacité volontaire</th>
                  <th className="px-1 whitespace-nowrap font-normal">Capacité accompagnateur</th>
                  <th className="px-1 whitespace-nowrap font-normal">Capacité totale</th>
                  <th className="px-1 whitespace-nowrap font-normal">Temps de route</th>
                  <th className="px-1 whitespace-nowrap font-normal">Pause déj aller</th>
                  <th className="px-1 whitespace-nowrap font-normal">Pause déj retour</th>
                  <th className="px-1 whitespace-nowrap font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {lines?.map((hit) => {
                  return <LigneDeBus key={hit._id} hit={hit} cohort={cohort} />;
                })}
              </tbody>
            </table>
          </div>
        }
      />
    </div>
  );
};

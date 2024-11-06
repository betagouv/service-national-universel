import React, { useState, useEffect } from "react";
import { HiHome } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import ReactTooltip from "react-tooltip";
import { useSelector } from "react-redux";
import queryString from "query-string";
import { Link } from "react-router-dom";

import { APPLICATION_STATUS, ROLES, getNewLink } from "@/utils";
import InformationCircle from "@/assets/icons/InformationCircle";
import API from "@/services/api";
import Loader from "@/components/Loader";
import { Page, Header } from "@snu/ds/admin";

import DashboardContainer from "../../../components/DashboardContainer";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const [isPrepaMilitary, setIsPrepaMilitary] = useState(false);
  const [structureId, setStructureId] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMission, setLoadingMission] = useState(true);

  const [error, setError] = useState(null);
  const [errorMission, setErrorMission] = useState(null);

  const [valuesApplication, setValuesApplication] = useState({});
  const [valuesMission, setValuesMission] = useState({});

  const statusForRedirectContract = [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.IN_PROGRESS, APPLICATION_STATUS.DONE];

  let filters = { structureId: structureId };
  let missionFilters = {};

  useEffect(() => {
    checkIsPrepaMilitary();
  }, []);

  useEffect(() => {
    loadDataApplication();
    loadDataMission();
  }, [structureId]);

  async function checkIsPrepaMilitary() {
    const id = user.structureId;
    try {
      const { ok, data } = await API.get(`/structure/${id}`);
      if (ok) {
        if (data.isMilitaryPreparation === "true") setIsPrepaMilitary(true);
        if (user.role === ROLES.RESPONSIBLE) setStructureId([user.structureId]);
        if (user.role === ROLES.SUPERVISOR) {
          let networkName = data.networkName;
          const { responses } = await API.post(`/elasticsearch/structure/search`, { filters: { searchbar: [], networkName: [networkName] }, size: 100 });
          setStructureId(
            responses[0].hits?.hits.map((item) => {
              return item._id;
            }),
          );
          setIsPrepaMilitary(responses[0].hits?.hits.some((item) => item._source.isMilitaryPreparation === "true"));
        }
      } else {
        toastr.error("Aucune structure n'a été trouvée.");
      }
    } catch (err) {
      toastr.error("Impossible de charger la structure.");
    }
  }

  async function loadDataApplication() {
    setError(null);
    setLoading(true);
    try {
      const result = await API.post(`/elasticsearch/dashboard/engagement/application-status`, { filters });
      if (result.ok) {
        setValuesApplication(result.data);
      } else {
        setError("Erreur: impossible de charger les données.");
      }
    } catch (err) {
      setError("Erreur: impossible de charger les données.");
    }
    setLoading(false);
  }

  async function loadDataMission() {
    setErrorMission(null);
    setLoadingMission(true);
    try {
      const result = await API.post(`/elasticsearch/dashboard/engagement/mission-status`, { filters, missionFilters });
      if (result.ok) {
        setValuesMission(
          result.data.reduce((acc, status) => {
            const key = status.status;
            acc[key] = {
              nb: status.value,
              percentage: Math.round(status.percentage * 100),
            };
            return acc;
          }, {}),
        );
      } else {
        setErrorMission("Erreur: impossible de charger les données.");
      }
    } catch (err) {
      setErrorMission("Erreur: impossible de charger les données.");
    }
    setLoadingMission(false);
  }

  return (
    <Page>
      <Header title="Tableau de bord" breadcrumb={[{ title: "Tableau de bord" }]} />
      <DashboardContainer active="engagement" availableTab={["general", "engagement"]}>
        <div className="flex flex-col gap-8">
          <h1 className="text-[28px] font-bold leading-8 text-gray-900">Candidatures</h1>
          <div className="flex flex-row gap-4">
            <div className="flex flex-col gap-6  rounded-lg bg-white px-8 py-6 w-1/2 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
              <p className="text-base font-bold leading-5 text-gray-900">Candidatures à traiter</p>
              <div className="flex w-full flex-wrap">
                {loading && <Loader />}
                {error && <div className="flex items-center justify-center p-8 text-center text-sm font-medium text-red-600">{errorMission}</div>}
                {!loading && !error && (
                  <div className="flex min-w-[30%] flex-col gap-2 w-full">
                    <StatusText
                      status="En attente de validation"
                      nb={valuesApplication.APPLICATION.WAITING_VALIDATION?.nb || 0}
                      percentage={valuesApplication.APPLICATION.WAITING_VALIDATION?.percentage || 0}
                      filtersUrl={[queryString.stringify({ status: "WAITING_VALIDATION" })]}
                      base="/volontaire/list/pending"
                      icon={!!valuesApplication.APPLICATION.WAITING_VALIDATION?.nb}
                    />
                  </div>
                )}
              </div>
              <p className="text-base font-bold leading-5 text-gray-900">Autres candidatures</p>
              <div className="flex w-full flex-wrap justify-between">
                {loading && <Loader />}
                {error && <div className="flex items-center justify-center p-8 text-center text-sm font-medium text-red-600">{errorMission}</div>}
                {!loading && !error && (
                  <div className="flex min-w-[30%] flex-col gap-2 w-full">
                    {isPrepaMilitary ? (
                      <StatusText
                        status="En attente de verification d'éligibilité"
                        nb={valuesApplication.APPLICATION.WAITING_VERIFICATION?.nb || 0}
                        percentage={valuesApplication.APPLICATION.WAITING_VERIFICATION?.percentage || 0}
                        filtersUrl={[queryString.stringify({ status: "WAITING_VERIFICATION" })]}
                        base="/volontaire/list/all"
                        tooltip={true}
                      />
                    ) : null}
                    <StatusText
                      status="Refusée"
                      nb={valuesApplication.APPLICATION.REFUSED?.nb || 0}
                      percentage={valuesApplication.APPLICATION.REFUSED?.percentage || 0}
                      filtersUrl={[queryString.stringify({ status: "REFUSED" })]}
                      base="/volontaire/list/all"
                    />
                    <StatusText
                      status="Annulée"
                      nb={valuesApplication.APPLICATION.CANCEL?.nb || 0}
                      percentage={valuesApplication.APPLICATION.CANCEL?.percentage || 0}
                      filtersUrl={[queryString.stringify({ status: "CANCEL" })]}
                      base="/volontaire/list/all"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-6 rounded-lg bg-white px-8 py-6 w-1/2 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
              <div className="flex align-middle">
                <p className="text-base font-bold leading-5 text-gray-900">Volontaires au sein de votre structure</p>
                <div className="bg-blue-100 px-3 py-1 text-xs font-medium rounded-full ml-2 flex self-start">
                  <p className="text-blue-700">À suivre</p>
                </div>
              </div>
              <div className="flex w-full flex-wrap">
                {loading && <Loader />}
                {error && <div className="flex items-center justify-center p-8 text-center text-sm font-medium text-red-600">{errorMission}</div>}
                {!loading && !error && (
                  <div className="flex min-w-[30%] flex-col gap-2 w-full">
                    <StatusText
                      status="Candidature approuvée"
                      nb={valuesApplication.APPLICATION.VALIDATED?.nb || 0}
                      percentage={valuesApplication.APPLICATION.VALIDATED?.percentage || 0}
                      filtersUrl={[queryString.stringify({ status: "VALIDATED" })]}
                      base="/volontaire/list/follow"
                    />
                    <StatusText
                      status="Mission en cours"
                      nb={valuesApplication.APPLICATION.IN_PROGRESS?.nb || 0}
                      percentage={valuesApplication.APPLICATION.IN_PROGRESS?.percentage || 0}
                      filtersUrl={[queryString.stringify({ status: "IN_PROGRESS" })]}
                      base="/volontaire/list/follow"
                    />
                  </div>
                )}
              </div>
              <p className="text-base font-bold leading-5 text-gray-900">Volontaires passés au sein de votre structure</p>
              <div className="flex w-full flex-wrap">
                {loading && <Loader />}
                {error && <div className="flex items-center justify-center p-8 text-center text-sm font-medium text-red-600">{errorMission}</div>}
                {!loading && !error && (
                  <div className="flex min-w-[30%] flex-col gap-2 w-full">
                    <StatusText
                      status="Mission effectué"
                      nb={valuesApplication.APPLICATION.DONE?.nb || 0}
                      percentage={valuesApplication.APPLICATION.DONE?.percentage || 0}
                      filtersUrl={[queryString.stringify({ status: "DONE" })]}
                      base="/volontaire/list/all"
                    />
                    <StatusText
                      status="Mission Abandonnée"
                      nb={valuesApplication.APPLICATION.ABANDON?.nb || 0}
                      percentage={valuesApplication.APPLICATION.ABANDON?.percentage || 0}
                      filtersUrl={[queryString.stringify({ status: "ABANDON" })]}
                      base="/volontaire/list/all"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6  rounded-lg bg-white px-8 py-6 w-full shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
            <p className="text-base font-bold leading-5 text-gray-900">Contrat d'engagement</p>
            <div className="flex flex-wrap">
              {loading && <Loader />}
              {error && <div className="flex items-center justify-center p-8 text-center text-sm font-medium text-red-600">{errorMission}</div>}
              {!loading && !error && (
                <div className="flex w-full m-min-[30%] gap-8 mx-4">
                  <div className="w-1/3">
                    <StatusText
                      status="Brouillon"
                      nb={valuesApplication.CONTRACT.DRAFT?.nb || 0}
                      percentage={valuesApplication.CONTRACT.DRAFT?.percentage || 0}
                      filtersUrl={[queryString.stringify({ contractStatus: "DRAFT", status: statusForRedirectContract.join("~") })]}
                      base="/volontaire/list/all"
                      icon={!!valuesApplication.CONTRACT.DRAFT?.nb}
                    />
                  </div>
                  <div className="flex  items-center justify-center">
                    <div className="h-full w-[1px] border-r-[1px] border-gray-300" />
                  </div>
                  <div className="w-1/3">
                    <StatusText
                      status="Envoyés"
                      nb={valuesApplication.CONTRACT.SENT?.nb || 0}
                      percentage={valuesApplication.CONTRACT.SENT?.percentage || 0}
                      filtersUrl={[queryString.stringify({ contractStatus: "SENT", status: statusForRedirectContract.join("~") })]}
                      base="/volontaire/list/all"
                    />
                  </div>
                  <div className="flex  items-center justify-center">
                    <div className="h-full w-[1px] border-r-[1px] border-gray-300" />
                  </div>
                  <div className="w-1/3">
                    <StatusText
                      status="Signés"
                      nb={valuesApplication.CONTRACT.VALIDATED?.nb || 0}
                      percentage={valuesApplication.CONTRACT.VALIDATED?.percentage || 0}
                      filtersUrl={[queryString.stringify({ contractStatus: "VALIDATED", status: statusForRedirectContract.join("~") })]}
                      base="/volontaire/list/all"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <h1 className="text-[28px] font-bold leading-8 text-gray-900">Missions</h1>
          <div className="flex flex-col gap-6  rounded-lg bg-white px-8 py-6 w-full shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
            <p className="text-base font-bold leading-5 text-gray-900">Statut des missions proposées par ma structure</p>
            <div className="flex w-full flex-wrap justify-center gap-7">
              {loadingMission && <Loader />}
              {errorMission && <div className="flex items-center justify-center p-8 text-center text-sm font-medium text-red-600">{errorMission}</div>}
              {!loadingMission && !errorMission && (
                <>
                  <div className="flex min-w-[30%] flex-col gap-2">
                    <StatusText
                      status="En attente de validation"
                      nb={valuesMission.WAITING_VALIDATION?.nb || 0}
                      percentage={valuesMission.WAITING_VALIDATION?.percentage || 0}
                      filtersUrl={[queryString.stringify({ status: "WAITING_VALIDATION" })]}
                      base="/mission"
                    />
                    <StatusText
                      status="En attente de correction"
                      nb={valuesMission.WAITING_CORRECTION?.nb || 0}
                      percentage={valuesMission.WAITING_CORRECTION?.percentage || 0}
                      filtersUrl={[queryString.stringify({ status: "WAITING_CORRECTION" })]}
                      base="/mission"
                    />
                    <StatusText
                      status="Validée"
                      nb={valuesMission.VALIDATED?.nb || 0}
                      percentage={valuesMission.VALIDATED?.percentage || 0}
                      filtersUrl={[queryString.stringify({ status: "VALIDATED" })]}
                      base="/mission"
                    />
                    <StatusText
                      status="Brouillon"
                      nb={valuesMission.DRAFT?.nb || 0}
                      percentage={valuesMission.DRAFT?.percentage || 0}
                      filtersUrl={[queryString.stringify({ status: "DRAFT" })]}
                      base="/mission"
                    />
                  </div>
                  <div className="flex  items-center justify-center">
                    <div className="h-full w-[1px] border-r-[1px] border-gray-300 mx-2" />
                  </div>
                  <div className="flex min-w-[30%] flex-col gap-2 justify-center">
                    <StatusText
                      status="Refusée"
                      nb={valuesMission.REFUSED?.nb || 0}
                      percentage={valuesMission.REFUSED?.percentage || 0}
                      filtersUrl={[queryString.stringify({ status: "REFUSED" })]}
                      base="/mission"
                    />
                    <StatusText
                      status="Annulée"
                      nb={valuesMission.CANCEL?.nb || 0}
                      percentage={valuesMission.CANCEL?.percentage || 0}
                      filtersUrl={[queryString.stringify({ status: "CANCEL" })]}
                      base="/mission"
                    />
                    <StatusText
                      status="Archivée"
                      nb={valuesMission.ARCHIVED?.nb || 0}
                      percentage={valuesMission.ARCHIVED?.percentage || 0}
                      filtersUrl={[queryString.stringify({ status: "ARCHIVED" })]}
                      base="/mission"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </DashboardContainer>
    </Page>
  );
}

function StatusText({ status, nb, percentage, filter = {}, filtersUrl, base, icon = false, tooltip = false }) {
  return (
    <Link className="flex items-center justify-between gap-2" to={getNewLink({ base, filter, filtersUrl })} target={"_blank"}>
      <div className="float-right flex w-full items-center justify-start gap-2">
        <span className="w-[10%] text-right text-lg font-bold text-gray-900">{nb}</span>
        <div className=" ml-4 w-[80%] flex">
          <p className="text-sm text-left text-gray-600 mr-2">{status}</p>
          {icon === true ? <Bell></Bell> : null}
          {tooltip === true ? (
            <>
              <span data-tip data-for="tooltip">
                <InformationCircle height={16} width={16} color="#9ca3af" className="mt-0.5" />
              </span>
              <ReactTooltip id="tooltip" type="light" place="top" effect="solid" className="!opacity-100 !shadow-md" tooltipRadius="6">
                <p className="w-[200px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">En cours de traitement par les équipes départementales SNU</p>
              </ReactTooltip>
            </>
          ) : null}
        </div>
      </div>
      <p className="w-[10%] text-sm text-gray-400">({percentage}%)</p>
    </Link>
  );
}
function Bell() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect width="22" height="22" rx="11" fill="#F97316" />
      <path
        d="M11 6.2002C9.01178 6.2002 7.40001 7.81197 7.40001 9.8002V11.9517L6.97574 12.3759C6.80414 12.5475 6.75281 12.8056 6.84568 13.0298C6.93855 13.254 7.15733 13.4002 7.40001 13.4002H14.6C14.8427 13.4002 15.0615 13.254 15.1543 13.0298C15.2472 12.8056 15.1959 12.5475 15.0243 12.3759L14.6 11.9517V9.8002C14.6 7.81197 12.9882 6.2002 11 6.2002Z"
        fill="white"
      />
      <path d="M11 15.8002C10.0059 15.8002 9.19999 14.9943 9.19999 14.0002H12.8C12.8 14.9943 11.9941 15.8002 11 15.8002Z" fill="white" />
    </svg>
  );
}

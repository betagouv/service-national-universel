import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import { FiFolderPlus } from "react-icons/fi";
import { HiOutlineChartSquareBar, HiOutlineAdjustments } from "react-icons/hi";
import { LuArrowRightCircle, LuArrowLeftCircle, LuHistory } from "react-icons/lu";
import { GoPlus } from "react-icons/go";

import { ROLES, canExportConvoyeur, getDepartmentNumber, translate } from "snu-lib";
import { Button, Container, Header, Page, Navbar, DropdownButton } from "@snu/ds/admin";

import { capture } from "@/sentry";
import api from "@/services/api";
import plausibleEvent from "@/services/plausible";

import ArrowUp from "@/assets/ArrowUp";
import Comment from "@/assets/comment";
import { ExportComponent, Filters, ResultTable, Save, SelectedFilters, SortOption } from "@/components/filters-system-v2";
import Loader from "@/components/Loader";
import SelectCohort from "@/components/cohorts/SelectCohort";

import { PlainButton } from "../components/Buttons";
import { translateStatus } from "../components/commons";
import { exportLigneBus, getTransportIcon, exportConvoyeur } from "../util";
import ListPanel from "./modificationPanel/List";
import Historic from "./Historic";
import ListeDemandeModif from "./ListeDemandeModif";

export default function List() {
  const { user, sessionPhase1 } = useSelector((state) => state.Auth);
  const cohorts = useSelector((state) => state.Cohorts);
  const urlParams = new URLSearchParams(window.location.search);
  const defaultCohort = user.role === ROLES.HEAD_CENTER && sessionPhase1 ? sessionPhase1.cohort : undefined;
  const [cohort, setCohort] = React.useState(urlParams.get("cohort") || defaultCohort);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasValue, setHasValue] = React.useState(false);
  const history = useHistory();
  const [showHistoric, setShowHistoric] = useState(false);
  const [showModifications, setShowModifications] = useState(false);

  const [currentTab, setCurrentTab] = React.useState("aller");
  const [panel, setPanel] = React.useState({ open: false, id: null });
  const cohortInURL = new URLSearchParams(history.location.search).get("cohort");

  const [data, setData] = React.useState([]);
  const pageId = "plandetransport";
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const [paramData, setParamData] = React.useState({
    page: 0,
  });
  const [size, setSize] = useState(10);

  const filterArray = [
    { title: "Numéro de la ligne", name: "busId", parentGroup: "Bus", missingLabel: "Non renseigné" },
    { title: "Date aller", name: "departureString", parentGroup: "Bus", missingLabel: "Non renseigné" },
    { title: "Date retour", name: "returnString", parentGroup: "Bus", missingLabel: "Non renseigné" },
    {
      title: "Taux de remplissage",
      name: "lineFillingRate",
      parentGroup: "Bus",
      missingLabel: "Non renseigné",
      transformData: (value) => transformDataTaux(value),
    },
    { title: "Nom", name: "pointDeRassemblements.name", parentGroup: "Points de rassemblement", missingLabel: "Non renseigné" },
    {
      title: "Région",
      name: "pointDeRassemblements.region",
      parentGroup: "Points de rassemblement",
      missingLabel: "Non renseigné",
      defaultValue: user.role === ROLES.REFERENT_REGION ? [user.region] : [],
    },
    {
      title: "Département",
      name: "pointDeRassemblements.department",
      parentGroup: "Points de rassemblement",
      missingLabel: "Non renseigné",
      defaultValue: user.role === ROLES.REFERENT_DEPARTMENT ? user.department : [],
      translate: (e) => getDepartmentNumber(e) + " - " + e,
    },
    { title: "Ville", name: "pointDeRassemblements.city", parentGroup: "Points de rassemblement", missingLabel: "Non renseigné" },
    { title: "Code", name: "pointDeRassemblements.code", parentGroup: "Points de rassemblement", missingLabel: "Non renseigné" },
    { title: "Nom", name: "centerName", parentGroup: "Centre", missingLabel: "Non renseigné" },
    { title: "Région", name: "centerRegion", parentGroup: "Centre", missingLabel: "Non renseigné" },
    {
      title: "Département",

      name: "centerDepartment",
      parentGroup: "Centre",
      missingLabel: "Non renseigné",
      translate: (e) => getDepartmentNumber(e) + " - " + e,
    },
    { title: "Code", name: "centerCode", parentGroup: "Centre", missingLabel: "Non renseigné" },
    {
      title: "Modification demandée",

      name: "modificationBuses.requestMessage",
      parentGroup: "Modification",
      missingLabel: "Non renseigné",
    },
    {
      title: "Statut de la modification",

      name: "modificationBuses.status",
      parentGroup: "Modification",
      missingLabel: "Non renseigné",
      translate: translateStatus,
    },
    user.role === ROLES.ADMIN
      ? {
          title: "Opinion sur la modification",

          name: "modificationBuses.opinion",
          parentGroup: "Modification",
          missingLabel: "Non renseigné",
          translate: translate,
        }
      : null,
    {
      title: "Aller",
      name: "delayedForth",
      parentGroup: "Retard",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Retour",
      name: "delayedBack",
      parentGroup: "Retard",
      missingLabel: "Non renseigné",
      translate: translate,
    },
  ].filter((e) => e);

  useEffect(() => {
    if (cohortInURL) return;
    if (!selectedFilters.cohort) setSelectedFilters({ ...selectedFilters, ["cohort"]: { filter: [cohort] } });
  }, [selectedFilters]);

  useEffect(() => {
    if (!cohort) setCohort(cohorts?.[0]?.name);
  }, []);

  const getPlanDetransport = async () => {
    try {
      const { ok, code, data: reponseBus } = await api.get(`/ligne-de-bus/cohort/${cohort}/hasValue`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération du plan de transport", translate(code));
      }
      setHasValue(reponseBus);
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du bus");
    }
  };

  useEffect(() => {
    if (user.role === ROLES.HEAD_CENTER && sessionPhase1) {
      history.push(`/ligne-de-bus?cohort=${sessionPhase1.cohort}`);
      setCohort(sessionPhase1.cohort);
    }
    setIsLoading(true);
    getPlanDetransport();
  }, [cohort]);

  if (isLoading) return <Loader />;

  return (
    <Page>
      <Header
        title="Plan de transport"
        breadcrumb={[{ title: <HiOutlineChartSquareBar size={20} /> }, { title: "Plan de transport" }]}
        actions={
          <SelectCohort
            cohort={cohort}
            onChange={(cohortName) => {
              setCohort(cohortName);
              history.replace({ search: `?cohort=${cohortName}` });
            }}
          />
        }
      />
      {hasValue && (
        <Navbar
          tab={[
            {
              title: "Aller",
              leftIcon: <LuArrowRightCircle size={20} className="mt-0.5 ml-2.5" />,
              isActive: currentTab === "aller",
              onClick: () => {
                setCurrentTab("aller");
                setShowHistoric(false);
                setShowModifications(false);
              },
            },
            {
              title: "Retour",
              leftIcon: <LuArrowLeftCircle size={20} className="mt-0.5 ml-2.5" />,
              isActive: currentTab === "retour",
              onClick: () => {
                setCurrentTab("retour");
                setShowHistoric(false);
                setShowModifications(false);
              },
            },
            ...(user.role !== ROLES.HEAD_CENTER
              ? [
                  {
                    title: "Historique",
                    leftIcon: <LuHistory size={20} className="mt-0.5 ml-2.5" />,
                    isActive: currentTab === "historique",
                    onClick: () => {
                      setCurrentTab("historique");
                      setShowModifications(false);
                      setShowHistoric(true);
                      plausibleEvent(`Historique du PDT - ${cohort}`);
                    },
                  },
                  {
                    title: "Demande de modification",
                    leftIcon: <HiOutlineAdjustments size={22} className="mt-0.5 ml-2.5" />,
                    isActive: currentTab === "modification",
                    onClick: () => {
                      setCurrentTab("modification");
                      setShowHistoric(false);
                      setShowModifications(true);
                      plausibleEvent(`Demande de modifications du PDT - ${cohort}`);
                    },
                  },
                ]
              : []),
          ]}
          button={[
            <Button
              title="Importer des lignes supplémentaires"
              leftIcon={<GoPlus size={20} className="mt-0.5" />}
              key={"btn-2"}
              type="wired"
              onClick={() => history.push(`/ligne-de-bus/import?cohort=${cohort}&add=true`)}
            />,
            returnSelect(cohort, selectedFilters, user),
          ]}
        />
      )}

      {hasValue && !showHistoric && !showModifications && (
        <Container className="!p-0">
          <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
            <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
              <Filters
                defaultUrlParam={`cohort=${cohort}`}
                pageId={pageId}
                route="/elasticsearch/plandetransport/search"
                setData={(value) => setData(value)}
                filters={filterArray}
                searchPlaceholder="Rechercher une ligne (numéro, ville, region)"
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                paramData={paramData}
                setParamData={setParamData}
                size={size}
              />
              <SortOption
                sortOptions={[
                  { label: "Nom (A > Z)", field: "busId.keyword", order: "asc" },
                  { label: "Nom (Z > A)", field: "busId.keyword", order: "desc" },
                ]}
                selectedFilters={selectedFilters}
                pagination={paramData}
                onPaginationChange={setParamData}
              />
            </div>

            <div className="mt-2 flex flex-row flex-wrap items-center px-4">
              <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
              <SelectedFilters
                filterArray={filterArray}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                paramData={paramData}
                setParamData={setParamData}
              />
            </div>
            <ResultTable
              paramData={paramData}
              setParamData={setParamData}
              currentEntryOnPage={data?.length}
              size={size}
              setSize={setSize}
              render={
                <div className="mt-6 mb-2 flex w-full flex-col">
                  <hr />
                  <div className="flex w-full items-center py-3 px-4 text-xs uppercase text-gray-400">
                    <div className="w-[30%]">Lignes</div>
                    <div className="w-[40%]">Points de rassemblements</div>
                    <div className="w-[15%]">Centres de destinations</div>
                    <div className="w-[10%]">Taux de remplissage</div>
                    <div className="h-1 w-[5%]"></div>
                  </div>
                  {data?.map((hit) => {
                    return <Line key={hit._id} hit={hit} currentTab={currentTab} setPanel={setPanel} />;
                  })}
                  <hr />
                </div>
              }
            />
            <ListPanel busId={panel?.id} open={panel?.open} setOpen={setPanel} />
          </div>
        </Container>
      )}
      {hasValue && showHistoric && !showModifications && (
        <Container className="!p-0">
          <Historic />
        </Container>
      )}
      {hasValue && !showHistoric && showModifications && <Container className="!p-0">{<ListeDemandeModif />}</Container>}
      {!hasValue && !showHistoric && !showModifications && (
        <Container className="!p-8">
          <div className="m-auto flex w-full flex-col items-center justify-center gap-4 pt-12 bg-gray-50 pb-5">
            <FiFolderPlus size={36} className="text-gray-400" />
            <div className="text-lg leading-6 font-medium">Aucun document importé</div>
            {[ROLES.ADMIN, ROLES.TRANSPORTER].includes(user.role) && (
              <>
                <div className="text-center text-sm leading-5 text-gray-800">Importez votre plan de transport au format .xls (fichier Excel) afin de le voir apparaître ici.</div>
                <PlainButton className="mt-2" onClick={() => history.push(`/ligne-de-bus/import?cohort=${cohort}`)}>
                  <GoPlus size={20} className="mr-2 mt-0.5" />
                  Importer mon fichier
                </PlainButton>
              </>
            )}
          </div>
        </Container>
      )}
    </Page>
  );
}

const returnSelect = (cohort, selectedFilters, user) => {
  const selectTest = [
    {
      key: "1",
      items: [
        {
          action: async () => {},
          render: (
            <ExportComponent
              title="Plan de transport"
              exportTitle="Plan_de_transport"
              route="/elasticsearch/plandetransport/export"
              selectedFilters={selectedFilters}
              setIsOpen={() => true}
              customCss={{
                override: true,
                button: `flex items-center gap-2 p-2 px-3 text-gray-700 cursor-pointer w-full text-sm text-gray-700`,
                loadingButton: `text-sm text-gray-700`,
              }}
              transform={async (data) => {
                let all = data;
                // Get the length of the longest array of PDRs
                const maxPDRs = all.reduce((max, item) => (item.pointDeRassemblements.length > max ? item.pointDeRassemblements.length : max), 0);

                return all.map((data) => {
                  let pdrs = {};

                  for (let i = 0; i < maxPDRs; i++) {
                    const pdr = data.pointDeRassemblements?.[i];
                    const num = i + 1;
                    pdrs[`N° DE DEPARTEMENT PDR ${num}`] = pdr?.department ? getDepartmentNumber(pdr.department) : "";
                    pdrs[`REGION DU PDR ${num}`] = pdr?.region || "";
                    pdrs[`ID PDR ${num}`] = pdr?.meetingPointId || "";
                    pdrs[`TYPE DE TRANSPORT PDR ${num}`] = pdr?.transportType || "";
                    pdrs[`NOM + ADRESSE DU PDR ${num}`] = pdr?.name ? pdr.name + " / " + pdr.address : "";
                    pdrs[`HEURE ALLER ARRIVÉE AU PDR ${num}`] = pdr?.busArrivalHour || "";
                    pdrs[`HEURE DE CONVOCATION AU PDR ${num}`] = pdr?.meetingHour || "";
                    pdrs[`HEURE DEPART DU PDR ${num}`] = pdr?.departureHour || "";
                    pdrs[`HEURE DE RETOUR ARRIVÉE AU PDR ${num}`] = pdr?.returnHour || "";
                  }

                  return {
                    "NUMERO DE LIGNE": data.busId,
                    "DATE DE TRANSPORT ALLER": data.departureString,
                    "DATE DE TRANSPORT RETOUR": data.returnString,
                    ...pdrs,
                    "N° DU DEPARTEMENT DU CENTRE": getDepartmentNumber(data.centerDepartment),
                    "REGION DU CENTRE": data.centerRegion,
                    "ID CENTRE": data.centerId,
                    "NOM + ADRESSE DU CENTRE": data.centerName + " / " + data.centerAddress,
                    "HEURE D'ARRIVEE AU CENTRE": data.centerArrivalTime,
                    "HEURE DE DÉPART DU CENTRE": data.centerDepartureTime,

                    // * followerCapacity !== Total des followers mais c'est la sémantique ici
                    "TOTAL ACCOMPAGNATEURS": data.followerCapacity,

                    "CAPACITÉ VOLONTAIRE TOTALE": data.youngCapacity,
                    "CAPACITE TOTALE LIGNE": data.totalCapacity,
                    "PAUSE DÉJEUNER ALLER": data.lunchBreak ? "Oui" : "Non",
                    "PAUSE DÉJEUNER RETOUR": data.lunchBreakReturn ? "Oui" : "Non",
                    "TEMPS DE ROUTE": data.travelTime.includes(":") ? data.travelTime : `${data.travelTime}:00`,
                    "RETARD ALLER": data.delayedForth === "true" ? "Oui" : "Non",
                    "RETARD RETOUR": data.delayedBack === "true" ? "Oui" : "Non",
                    "LIGNES FUSIONNÉES": data.mergedBusIds?.join(",") || "",
                  };
                });
              }}
            />
          ),
        },
        [ROLES.ADMIN, ROLES.TRANSPORTER, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role)
          ? {
              action: async () => {
                await exportLigneBus(cohort);
              },
              render: (
                <div className="flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 ">
                  <div className="text-sm text-gray-700">Volontaires par ligne</div>
                </div>
              ),
            }
          : null,
        canExportConvoyeur(user)
          ? {
              action: async () => {
                await exportConvoyeur(cohort);
              },
              render: (
                <div className="flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 ">
                  <div className="text-sm text-gray-700">Convoyeurs</div>
                </div>
              ),
            }
          : null,
      ].filter((x) => x),
    },
  ];
  return <DropdownButton title={"Exporter"} optionsGroup={selectTest} position={"right"} />;
};

const Line = ({ hit, currentTab, setPanel }) => {
  const meetingPoints =
    currentTab === "aller"
      ? //sort meetingPoints by departureHour
        hit.pointDeRassemblements.sort((a, b) => a.departureHour.replace(":", "") - b.departureHour.replace(":", ""))
      : hit.pointDeRassemblements.sort((a, b) => a.returnHour.replace(":", "") - b.returnHour.replace(":", ""));

  const hasPendingModification = hit.modificationBuses?.some((modification) => modification.status === "PENDING");

  return (
    <>
      <hr />
      <div className="flex items-center py-6 px-4 hover:bg-gray-50">
        <Link className="w-[30%] cursor-pointer" to={`/ligne-de-bus/${hit._id.toString()}`} target="_blank" rel="noreferrer">
          <div className="flex flex-col">
            <div className="text-sm font-medium">{hit.busId}</div>
            <div className="text-xs text-gray-400">
              {currentTab === "aller" ? `${hit.pointDeRassemblements[0]?.region} > ${hit.centerRegion}` : `${hit.centerRegion} > ${hit.pointDeRassemblements[0]?.region}`}
            </div>
          </div>
        </Link>
        <div className="w-[40%]">
          <div className="flex gap-2">
            {meetingPoints.map((meetingPoint) => {
              return (
                <TooltipMeetingPoint key={meetingPoint.meetingPointId} meetingPoint={meetingPoint} currentTab={currentTab}>
                  <a
                    href={`/point-de-rassemblement/${meetingPoint.meetingPointId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-3xl bg-gray-100 px-2 py-1 text-sm font-normal hover:scale-105">
                    {meetingPoint.city}
                    <ArrowUp />
                  </a>
                </TooltipMeetingPoint>
              );
            })}
          </div>
        </div>
        <div className="w-[15%]">
          <div className="flex gap-2">
            <TooltipCenter key={hit.centerId} name={hit.centerName} region={hit.centerRegion} department={hit.centerDepartment}>
              <a
                href={`/centre/${hit.centerId}`}
                target="_blank"
                rel="noreferrer"
                className="flex cursor-pointer items-center justify-center gap-2 px-2 py-1 text-sm font-normal hover:scale-105">
                {hit.centerCode}
                <ArrowUp />
              </a>
            </TooltipCenter>
          </div>
        </div>
        <div className="flex w-[10%] items-center gap-4">
          <div className="text-sm font-normal">{hit.lineFillingRate}%</div>
          <div className="flex flex-col items-center">
            <svg className="h-9 w-9 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="40" fill="none" stroke="#F0F0F0" strokeDashoffset={`calc(100 - 0)`} strokeWidth="15" />
              <circle
                className="percent fifty"
                strokeDasharray={100}
                strokeDashoffset={`calc(100 - ${Math.round(hit.lineFillingRate)})`}
                cx="60"
                cy="60"
                r="40"
                fill="none"
                stroke="#1E40AF"
                strokeWidth="15"
                pathLength="100"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <div className="flex w-[5%] justify-center">
          {hit.modificationBuses?.length > 0 ? (
            <div
              className={`flex cursor-pointer rounded-full p-2 ${hasPendingModification ? "bg-orange-500" : "bg-gray-200"}`}
              onClick={() => setPanel({ open: true, id: hit._id })}>
              <Comment stroke={hasPendingModification && "white"} />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

const TooltipMeetingPoint = ({ children, meetingPoint, currentTab, ...props }) => {
  if (!meetingPoint) return children;

  return (
    <div className="group relative flex flex-col items-center " {...props}>
      {children}
      <div className="absolute !top-8 left-0 mb-3 hidden items-center group-hover:flex">
        <div className="leading-2 relative z-[500] whitespace-nowrap rounded-lg bg-white p-3 text-xs text-[#414458] shadow-lg">
          <div className="flex w-[524px] items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center rounded-lg bg-gray-100 px-2 py-1 text-sm font-medium">
                {currentTab === "aller" ? meetingPoint.departureHour : meetingPoint.returnHour}
              </div>
              <svg id="triangle" viewBox="0 0 100 100" width={10} height={10} className="z-[600]">
                <polygon points="0 0, 100 0, 50 55" transform="rotate(-90 50 50)" fill="#F5F5F5" />
              </svg>
              <div className="ml-1 flex flex-col">
                <div className="text-sm font-medium">{meetingPoint.name}</div>
                <div className="text-xs text-gray-400">{`${meetingPoint.region} • ${meetingPoint.department}`}</div>
              </div>
            </div>
            {getTransportIcon(meetingPoint.transportType)}
          </div>
        </div>
      </div>
    </div>
  );
};

const TooltipCenter = ({ children, name, region, department, ...props }) => {
  return (
    <div className="group relative flex flex-col items-center" {...props}>
      {children}
      <div className="absolute !top-8 left-0 mb-3 hidden flex-col items-center group-hover:flex">
        <div className="leading-2 relative z-[500] whitespace-nowrap rounded-lg bg-white py-3 px-3 text-xs text-[#414458] shadow-lg">
          <div className="flex flex-col">
            <div className="text-sm font-medium">{`${name}`}</div>
            <div className="text-xs text-gray-400">{`${region} • ${department}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const translateLineFillingRate = (e) => {
  if (e == 0) return "Vide";
  if (e == 100) return "Rempli";
  return `${Math.floor(e / 10) * 10}-${Math.floor(e / 10) * 10 + 10}%`;
};
const transformDataTaux = (data) => {
  const newData = [];
  data.map((d) => {
    const dizaine = translateLineFillingRate(parseInt(d.key));
    const val = newData.find((e) => e.key === dizaine);
    if (val) {
      newData[newData.indexOf(val)].doc_count += d.doc_count;
    } else {
      newData.push({ key: dizaine, doc_count: d.doc_count });
    }
  });
  return newData;
};

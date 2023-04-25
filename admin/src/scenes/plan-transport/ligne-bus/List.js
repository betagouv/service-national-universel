import React from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { ROLES, getDepartmentNumber, translate } from "snu-lib";
import ArrowUp from "../../../assets/ArrowUp";
import Comment from "../../../assets/comment";
import History from "../../../assets/icons/History";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { ExportComponent, Filters, ResultTable, Save, SelectedFilters } from "../../../components/filters-system-v2";
import Loader from "../../../components/Loader";
import SelectAction from "../../../components/SelectAction";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { PlainButton } from "../components/Buttons";
import Select from "../components/Select";
import { TabItem, Title, translateStatus } from "../components/commons";
import { exportLigneBus, getTransportIcon } from "../util";
import Excel from "./components/Icons/Excel.png";
import ListPanel from "./modificationPanel/List";

const cohortList = [
  { label: "Séjour du <b>19 Février au 3 Mars 2023</b>", value: "Février 2023 - C" },
  { label: "Séjour du <b>9 au 21 Avril 2023</b>", value: "Avril 2023 - A" },
  { label: "Séjour du <b>16 au 28 Avril 2023</b>", value: "Avril 2023 - B" },
  { label: "Séjour du <b>11 au 23 Juin 2023</b>", value: "Juin 2023" },
  { label: "Séjour du <b>4 au 16 Juillet 2023</b>", value: "Juillet 2023" },
];

export default function List() {
  const { user } = useSelector((state) => state.Auth);
  const urlParams = new URLSearchParams(window.location.search);
  const [cohort, setCohort] = React.useState(urlParams.get("cohort") || "Février 2023 - C");
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasValue, setHasValue] = React.useState(false);
  const history = useHistory();

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

  React.useEffect(() => {
    setIsLoading(true);
    getPlanDetransport();
  }, [cohort]);

  if (isLoading) return <Loader />;

  return (
    <>
      <Breadcrumbs items={[{ label: "Plan de transport" }]} />
      <div className="flex flex-col w-full px-8 pb-8 ">
        <div className="py-8 flex items-center justify-between">
          <Title>Plan de transport</Title>
          <Select
            options={cohortList}
            value={cohort}
            onChange={(e) => {
              setCohort(e);
              history.replace({ search: `?cohort=${e}` });
            }}
          />
        </div>
        {hasValue ? (
          <ReactiveList cohort={cohort} history={history} />
        ) : (
          <div className="flex flex-col items-center justify-center pt-12 gap-4 w-[450px] m-auto">
            <img src={Excel} alt="Excel" className="w-32 bg-[#f4f5f7]" />
            <div className="font-bold text-2xl leading-7 text-gray-800">Aucun document importé</div>
            {[ROLES.ADMIN, ROLES.TRANSPORTER].includes(user.role) && (
              <>
                <div className="text-gray-800 text-sm leading-5 text-center">
                  Importez votre plan de transport au format .xls (fichier Excel) afin de voir apparaître ici le plan de transport.
                </div>
                <PlainButton className="mt-2" onClick={() => history.push(`/ligne-de-bus/import?cohort=${cohort}`)}>
                  Importer mon fichier
                </PlainButton>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

const ReactiveList = ({ cohort, history }) => {
  const { user } = useSelector((state) => state.Auth);
  const [currentTab, setCurrentTab] = React.useState("aller");
  const [panel, setPanel] = React.useState({ open: false, id: null });

  const [data, setData] = React.useState([]);
  const pageId = "plandetransport";
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const [paramData, setParamData] = React.useState({
    page: 0,
  });
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
    { title: "Région", name: "pointDeRassemblements.region", parentGroup: "Points de rassemblement", missingLabel: "Non renseigné" },
    {
      title: "Département",
      name: "pointDeRassemblements.department",
      parentGroup: "Points de rassemblement",
      missingLabel: "Non renseigné",
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
  ].filter((e) => e);

  return (
    <>
      <div className="flex flex-1">
        <TabItem icon={<BsArrowRight />} title="Aller" onClick={() => setCurrentTab("aller")} active={currentTab === "aller"} />
        <TabItem icon={<BsArrowLeft />} title="Retour" onClick={() => setCurrentTab("retour")} active={currentTab === "retour"} />
      </div>
      <div className="flex flex-col bg-white py-4 mb-8 rounded-lg">
        <div className="flex items-center justify-between bg-white pt-2 px-4">
          <div className="flex items-center gap-2">
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
            />
          </div>
          <div className="flex gap-2 items-center">
            <button
              className="flex gap-2 items-center text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm"
              onClick={() => history.push(`/ligne-de-bus/historique?cohort=${cohort}`)}>
              <History className="text-gray-400" />
              Historique
            </button>
            <button
              className="text-gray-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm"
              onClick={() => history.push(`/ligne-de-bus/demande-de-modification?cohort=${cohort}`)}>
              Demande de modification
            </button>
            <SelectAction
              title="Exporter"
              alignItems="right"
              buttonClassNames="bg-white border border-gray-300 h-10 rounded-md px-3"
              textClassNames="text-grey-700 font-medium text-sm"
              rightIconClassNames="text-gray-300"
              optionsGroup={[
                {
                  items: [
                    {
                      action: async () => {},
                      render: (
                        <ExportComponent
                          title="Plan de transport"
                          exportTitle="Plan_de_transport"
                          route="/elasticsearch/plandetransport/export"
                          filters={filterArray}
                          selectedFilters={selectedFilters}
                          setIsOpen={() => true}
                          css={{
                            override: true,
                            button: `flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer w-full text-sm text-gray-700`,
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
                                pdrs[`N° DU DEPARTEMENT DU PDR ${num}`] = pdr?.department ? getDepartmentNumber(pdr.department) : "";
                                pdrs[`REGION DU PDR ${num}`] = pdr?.region || "";
                                pdrs[`ID PDR ${num}`] = pdr?.meetingPointId || "";
                                pdrs[`TYPE DE TRANSPORT PDR ${num}`] = pdr?.transportType || "";
                                pdrs[`NOM + ADRESSE DU PDR ${num}`] = pdr?.name ? pdr.name + " / " + pdr.address : "";
                                pdrs[`HEURE ALLER ARRIVÉE AU PDR ${num}`] = pdr?.busArrivalHour || "";
                                pdrs[`HEURE DE DEPART DU PDR ${num}`] = pdr?.departureHour || "";
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
                                "CAPACITÉ TOTALE LIGNE": data.totalCapacity,
                                "PAUSE DÉJEUNER ALLER": data.lunchBreak ? "Oui" : "Non",
                                "PAUSE DÉJEUNER RETOUR": data.lunchBreakReturn ? "Oui" : "Non",
                                "TEMPS DE ROUTE": data.travelTime,
                              };
                            });
                          }}
                        />
                      ),
                    },
                    [ROLES.ADMIN, ROLES.TRANSPORTER, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role)
                      ? {
                          action: async () => {
                            await exportLigneBus(user, cohort);
                          },
                          render: (
                            <div className="flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
                              <div className="text-sm text-gray-700">Volontaires par ligne</div>
                            </div>
                          ),
                        }
                      : null,
                  ].filter((x) => x),
                },
              ]}
            />
          </div>
        </div>
        <div className="mt-2 px-4 flex flex-row flex-wrap items-center">
          <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
          <SelectedFilters filterArray={filterArray} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} paramData={paramData} setParamData={setParamData} />
        </div>
        <ResultTable
          paramData={paramData}
          setParamData={setParamData}
          currentEntryOnPage={data?.length}
          render={
            <div className="flex w-full flex-col mt-6 mb-2">
              <hr />
              <div className="flex py-3 items-center text-xs uppercase text-gray-400 px-4 w-full">
                <div className="w-[30%]">Lignes</div>
                <div className="w-[40%]">Points de rassemblements</div>
                <div className="w-[15%]">Centres de destinations</div>
                <div className="w-[10%]">Taux de remplissage</div>
                <div className="w-[5%] h-1"></div>
              </div>
              {data?.map((hit) => {
                return <Line key={hit._id} hit={hit} currentTab={currentTab} setPanel={setPanel} />;
              })}
              <hr />
            </div>
          }
        />
      </div>
      <ListPanel busId={panel?.id} open={panel?.open} setOpen={setPanel} />
    </>
  );
};

const Line = ({ hit, currentTab, setPanel }) => {
  const history = useHistory();

  const meetingPoints =
    currentTab === "aller"
      ? //sort meetingPoints by departureHour
        hit.pointDeRassemblements.sort((a, b) => a.departureHour.replace(":", "") - b.departureHour.replace(":", ""))
      : hit.pointDeRassemblements.sort((a, b) => a.returnHour.replace(":", "") - b.returnHour.replace(":", ""));

  const hasPendingModification = hit.modificationBuses?.some((modification) => modification.status === "PENDING");

  return (
    <>
      <hr />
      <div className="flex py-6 items-center px-4 hover:bg-gray-50">
        <div className="w-[30%] cursor-pointer" onClick={() => history.push(`/ligne-de-bus/${hit._id.toString()}`)}>
          <div className="flex flex-col">
            <div className="text-sm font-medium">{hit.busId}</div>
            <div className="text-xs text-gray-400">
              {currentTab === "aller" ? `${hit.pointDeRassemblements[0].region} > ${hit.centerRegion}` : `${hit.centerRegion} > ${hit.pointDeRassemblements[0].region}`}
            </div>
          </div>
        </div>
        <div className="w-[40%]">
          <div className="flex gap-2">
            {meetingPoints.map((meetingPoint) => {
              return (
                <TooltipMeetingPoint key={meetingPoint.meetingPointId} meetingPoint={meetingPoint} currentTab={currentTab}>
                  <a
                    href={`/point-de-rassemblement/${meetingPoint.meetingPointId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:scale-105 cursor-pointer gap-2 text-sm font-normal flex justify-center px-2 py-1 items-center bg-gray-100 rounded-3xl">
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
                className="hover:scale-105 cursor-pointer gap-2 text-sm font-normal flex justify-center px-2 py-1 items-center">
                {hit.centerCode}
                <ArrowUp />
              </a>
            </TooltipCenter>
          </div>
        </div>
        <div className="w-[10%] flex gap-4 items-center">
          <div className="text-sm font-normal">{hit.lineFillingRate}%</div>
          <div className="flex flex-col items-center">
            <svg className="-rotate-90 w-9 h-9" viewBox="0 0 120 120">
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
        <div className="w-[5%] flex justify-center">
          {hit.modificationBuses?.length > 0 ? (
            <div
              className={`flex p-2 rounded-full cursor-pointer ${hasPendingModification ? "bg-orange-500" : "bg-gray-200"}`}
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
    <div className="relative flex flex-col items-center group " {...props}>
      {children}
      <div className="absolute hidden group-hover:flex !top-8 mb-3 items-center left-0">
        <div className="relative p-3 text-xs leading-2 text-[#414458] whitespace-nowrap bg-white shadow-lg z-[500] rounded-lg">
          <div className="flex items-center justify-between w-[524px]">
            <div className="flex items-center">
              <div className="text-sm font-medium flex justify-center px-2 py-1 items-center bg-gray-100 rounded-lg">
                {currentTab === "aller" ? meetingPoint.departureHour : meetingPoint.returnHour}
              </div>
              <svg id="triangle" viewBox="0 0 100 100" width={10} height={10} className="z-[600]">
                <polygon points="0 0, 100 0, 50 55" transform="rotate(-90 50 50)" fill="#F5F5F5" />
              </svg>
              <div className="flex flex-col ml-1">
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
    <div className="relative flex flex-col items-center group" {...props}>
      {children}
      <div className="absolute flex-col hidden group-hover:flex !top-8 mb-3 items-center left-0">
        <div className="relative py-3 px-3 text-xs leading-2 text-[#414458] whitespace-nowrap bg-white shadow-lg z-[500] rounded-lg">
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

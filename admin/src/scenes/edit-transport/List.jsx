import React from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { ROLES, translate } from "snu-lib";
import ArrowUp from "../../assets/ArrowUp";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Filters, ResultTable } from "../../components/filters-system-v2";
import Loader from "../../components/Loader";
import { capture } from "../../sentry";
import api from "../../services/api";
import Select from "../plan-transport/components/Select";
import { TabItem, Title } from "../plan-transport/components/commons";


const cohortList = [
  { label: "Séjour du <b>19 Février au 3 Mars 2023</b>", value: "Février 2023 - C" },
  { label: "Séjour du <b>9 au 21 Avril 2023</b>", value: "Avril 2023 - A" },
  { label: "Séjour du <b>16 au 28 Avril 2023</b>", value: "Avril 2023 - B" },
  { label: "Séjour du <b>11 au 23 Juin 2023</b>", value: "Juin 2023" },
  { label: "Séjour du <b>4 au 16 Juillet 2023</b>", value: "Juillet 2023" },
];

export default function List() {
  const { user, sessionPhase1 } = useSelector((state) => state.Auth);
  const urlParams = new URLSearchParams(window.location.search);
  const defaultCohort = user.role === ROLES.ADMIN && sessionPhase1 ? sessionPhase1.cohort : "Février 2023 - C";
  const [cohort, setCohort] = React.useState(urlParams.get("cohort") || defaultCohort);
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
    if (cohort) {
      history.push(`/edit-transport?cohort=${cohort}`);
      setCohort(cohort);
    }
    setIsLoading(true);
    getPlanDetransport();
  }, [cohort]);

  if (isLoading) return <Loader />;

  return (
    <>
      <Breadcrumbs items={[{ label: "Plan de transport" }]} />
      <div className="flex w-full flex-col px-8 pb-8 ">
        <div className="flex items-center justify-between py-8">
          <Title>Edit plan de transport</Title>
          <Select
            options={cohortList}
            value={cohort}
            disabled={user.role !== ROLES.ADMIN && user.subRole !== "god"}
            onChange={(e) => {
              setCohort(e);
              history.replace({ search: `?cohort=${e}` });
            }}
          />
        </div>
        {hasValue ? (
          <ReactiveList cohort={cohort} history={history} />
        ) : (
          <div className="m-auto flex w-[450px] flex-col items-center justify-center gap-4 pt-12">
            <div className="text-2xl font-bold leading-7 text-gray-800">Aucun Transport pour cette période</div>
          </div>
        )}
      </div>
    </>
  );
}

const ReactiveList = ({ cohort, history }) => {
  const { user } = useSelector((state) => state.Auth);
  const [currentTab, setCurrentTab] = React.useState("aller");
  const [data, setData] = React.useState([]);
  const pageId = "edittransport";
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const [paramData, setParamData] = React.useState({page: 0});
  const [ligneOpen, setLigneOpen] = React.useState(null);
  const filterArray = [].filter((e) => e);

  return (
    <>
      <div className="flex flex-1">
        <TabItem icon={<BsArrowRight />} title="Aller" onClick={() => setCurrentTab("aller")} active={currentTab === "aller"} />
        <TabItem icon={<BsArrowLeft />} title="Retour" onClick={() => setCurrentTab("retour")} active={currentTab === "retour"} />
      </div>
      <div className="mb-8 flex flex-col rounded-lg bg-white py-4">
        <div className="flex items-center justify-between bg-white px-4 pt-2">
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
        </div>
        <ResultTable
          paramData={paramData}
          setParamData={setParamData}
          currentEntryOnPage={data?.length > 0}
          render={
            <div className="mt-6 mb-2 flex w-full flex-col">
              <hr />
              <div className="flex w-full items-center py-3 px-4 text-xs uppercase text-gray-400">
                <div className="w-[30%]">Lignes</div>
                <div className="w-[40%]">Traget</div>
                <div className="w-[15%]">Centres de destinations</div>
                <div className="w-[10%]">Taux de remplissage</div>
              </div>
              {data?.map((hit) => {
                return <Line key={hit._id} hit={hit} currentTab={currentTab} onClick={() => setLigneOpen(ligneOpen === hit._id ? null : hit._id)} open={ligneOpen === hit._id}/>;
              })}
              <hr />
            </div>
          }
        />
      </div>
    </>
  );
};

const Line = ({ hit, currentTab, onClick, open }) => {
  const meetingPoints =
    currentTab === "aller"
      ? //sort meetingPoints by departureHour
        hit.pointDeRassemblements.sort((a, b) => a.departureHour.replace(":", "") - b.departureHour.replace(":", ""))
      : hit.pointDeRassemblements.sort((a, b) => a.returnHour.replace(":", "") - b.returnHour.replace(":", ""));

  return (
    <>
      <hr />
      <div className={`flex items-center py-6 px-4 ${open ? "" : "hover:bg-gray-50"} ${open ? "bg-gray-200" : ""}`} onClick={onClick}>
        <div className="flex flex-col w-[30%]">
          <div className="text-sm font-medium">{hit.busId}</div>
        </div>
        <div className="text-sm w-[40%]">
          {currentTab === "aller" ? `${hit.pointDeRassemblements[0]?.region} > ${hit.centerRegion}` : `${hit.centerRegion} > ${hit.pointDeRassemblements[0]?.region}`}
        </div>
        <div className="w-[15%]">
          <div className="flex gap-2">
            <TooltipCenter key={hit.centerId} name={hit.centerName} region={hit.centerRegion} department={hit.centerDepartment}>
              <div className="flex items-center justify-center gap-2 px-2 py-1 text-sm font-normal">
                {hit.centerCode || hit.centerName}
                <ArrowUp />
              </div>
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
      </div>
      {open ? meetingPoints.length ?
      <>
        <div className="flex justify-between w-full items-center py-3 px-4 text-xs uppercase text-gray-400">
          <div className="w-1/5">name</div>
          <div className="w-1/5">Type de transport</div>
          <div className="w-1/5">Heure de rendez-vous</div>
          <div className="w-1/5">Heure de depart</div>
          <div className="w-1/5">Adresse</div>
        </div>
        {meetingPoints.map(meetingPoint => {    
          return (
            <div key={meetingPoint.meetingPointId} className="flex justify-between items-center py-6 px-4 hover:bg-gray-50 text-snu-purple-800">
              <div className="w-1/5">{meetingPoint.name.replace("PDR-", "").replace("PDR -", "")}</div>
              <div className="w-1/5">{meetingPoint.transportType}</div>
              <div className="w-1/5">{meetingPoint.meetingHour}</div>
              <div className="w-1/5">{meetingPoint.departureHour}</div>
              <div className="w-1/5">
                {`${meetingPoint.address}`}
              </div>
            </div>
            )
        })}
      </> : <p className="flex items-center justify-center py-3 text-snu-purple-800">Aucun points de rencontres</p> : <></>
      }
    </>
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

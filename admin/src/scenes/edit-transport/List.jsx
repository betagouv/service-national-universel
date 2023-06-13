import React, { useState, useEffect, useRef } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { HiX, HiCheck } from "react-icons/hi";
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
import Select from "./components/Select";
import { TabItem, Title } from "../plan-transport/components/commons";
import TimePicker from "./components/TimePicker";
import TooltipCapacity from "./components/TooltipCapacity";
import TooltipAddress from "./components/TooltipAddress";
import TooltipDeleteButtonPlan from "./components/TooltipDeleteButtonPlan";
import TooltipCenter from "./components/TooltipCenter";
import ChevronDown from "../../assets/icons/ChevronDown";

const cohortList = [
  { label: "Séjour du <b>19 Février au 3 Mars 2023</b>", value: "Février 2023 - C" },
  { label: "Séjour du <b>9 au 21 Avril 2023</b>", value: "Avril 2023 - A" },
  { label: "Séjour du <b>16 au 28 Avril 2023</b>", value: "Avril 2023 - B" },
  { label: "Séjour du <b>11 au 23 Juin 2023</b>", value: "Juin 2023" },
  { label: "Séjour du <b>4 au 16 Juillet 2023</b>", value: "Juillet 2023" },
];

const transportTypeList = [
  { label: "bus", value: "bus" },
  { label: "train", value: "train" },
  { label: "avion", value: "avion" },
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
      setIsLoading(true);
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
  const [lines, setLines] = React.useState([]);
  const pageId = "edittransport";
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const [paramData, setParamData] = React.useState({ page: 0 });
  const filterArray = [].filter((e) => e);
  const [meetingPtsToSave, setMeetingPtsToSave] = useState([]);
  const [youngs, setYoungs] = useState();

  useEffect(() => {
    if (!lines.length) return;
    try {
      const getYoungs = async () => {
        const ligneIds = lines.map((e) => e._id);

        const res = await api.post("/edit-transport/youngs", { ligneIds, cohort });
        if (res.ok) {
          setYoungs(res.data);
        } else toastr.error("Oups, une erreur est survenue lors de la récupération des jeunes");
      };
      getYoungs();
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des jeunes");
    }
  }, [lines]);

  const deletePlan = () => {
    // TODO
  };

  return (
    <>
      <div className="flex flex-1">
        <TabItem icon={<BsArrowRight />} title="Aller" onClick={() => setCurrentTab("aller")} active={currentTab === "aller"} />
        <TabItem icon={<BsArrowLeft />} title="Retour" onClick={() => setCurrentTab("retour")} active={currentTab === "retour"} />
      </div>
      <div className="mb-8 flex flex-col rounded-lg bg-white py-4">
        <div className="flex items-center justify-between bg-white px-4 pt-2">
          <div className="flex items-center justify-center gap-2">
            <Filters
              defaultUrlParam={`cohort=${cohort}`}
              pageId={pageId}
              route="/elasticsearch/plandetransport/search"
              setData={(value) => setLines(value)}
              filters={filterArray}
              searchPlaceholder="Rechercher une ligne (numéro, ville, region)"
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              paramData={paramData}
              setParamData={setParamData}
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
        </div>
        <ResultTable
          paramData={paramData}
          setParamData={setParamData}
          currentEntryOnPage={lines?.length > 0}
          render={
            <div className="mt-6 mb-2 flex w-full flex-col">
              <hr />
              <div className="flex w-full items-center justify-center py-3 px-4 text-xs uppercase text-gray-400">
                <div className="w-[15%]">Lignes</div>
                <div className="w-[10%]">Pts de Rdv</div>
                <div className="w-[20%]">Date de départ</div>
                <div className="w-[25%]">Traget</div>
                <div className="w-[15%]">Centres de destinations</div>
                <div className="w-[15%]">Taux de remplissage</div>
              </div>
              {lines?.map((hit) => {
                return <Line key={hit._id} hit={hit} currentTab={currentTab} meetingPtsToSave={meetingPtsToSave} setMeetingPtsToSave={setMeetingPtsToSave} youngs={youngs} />;
              })}
              <hr />
            </div>
          }
        />
      </div>
    </>
  );
};

const Line = ({ hit, currentTab, meetingPtsToSave, setMeetingPtsToSave, youngs }) => {
  const [open, setOpen] = useState(false);

  const [meetingPoints, setMeetingPoints] = useState(
    currentTab === "aller"
      ? //sort meetingPoints by departureHour
        hit.pointDeRassemblements.sort((a, b) => a.departureHour.replace(":", "") - b.departureHour.replace(":", ""))
      : hit.pointDeRassemblements.sort((a, b) => a.returnHour.replace(":", "") - b.returnHour.replace(":", "")),
  );

  return (
    <>
      <hr />
      <div className={`flex items-center py-6 px-4 cursor-pointer ${open ? "" : "hover:bg-gray-50"} ${open ? "bg-gray-200" : ""}`} onClick={() => setOpen((o) => !o)}>
        <div className="flex flex-col w-[15%]">
          <div className="text-sm font-medium">{hit.busId}</div>
        </div>
        <div className="flex flex-col w-[10%]">{meetingPoints.length}</div>
        <div className="flex flex-col w-[20%]">{currentTab === "aller" ? hit.departureString : hit.returnString}</div>
        <div className="text-sm w-[25%]">
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
        <div className="flex w-[15%]">
          <TooltipCapacity youngCapacity={hit.youngCapacity} youngSeatsTaken={hit.youngSeatsTaken} followerCapacity={hit.followerCapacity}>
            <div className="flex items-center gap-4 justify-center">
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
          </TooltipCapacity>
        </div>
      </div>
      {open ? (
        meetingPoints.length ? (
          <>
            <div className="flex justify-between w-full items-center py-3 px-4 text-xs uppercase text-gray-400">
              <div className="w-[5%] mr-5"></div>
              <div className="w-[10%]">Nom</div>
              <div className="w-[20%]">Type de transport</div>
              {currentTab === "aller" ? (
                <>
                  <div className="w-[20%]">Heure de rendez-vous</div>
                  <div className="w-[20%]">Heure de depart</div>
                </>
              ) : (
                <div className="w-[20%]">Heure de retour</div>
              )}
              <div className="w-[20%]">Adresse</div>
              <div className="w-[10%]"></div>
            </div>
            {meetingPoints?.map((meetingPoint) => {
              return <MeetingPoint key={meetingPoint._id} meetingPoint={meetingPoint} currentTab={currentTab} youngs={youngs} ligneId={hit._id} />;
            })}
          </>
        ) : (
          <p className="flex items-center justify-center py-3 text-snu-purple-800">Aucun points de rencontres</p>
        )
      ) : (
        <></>
      )}
    </>
  );
};

const MeetingPoint = ({ meetingPoint, currentTab, youngs, ligneId }) => {
  const [tempMeetingPoint, setTempMeetingPoint] = useState(meetingPoint);
  const [open, setOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  React.useEffect(() => {
    setTempMeetingPoint(meetingPoint);
  }, [meetingPoint]);

  const handleChange = ({ path, value }) => {
    setIsDirty(true);
    setTempMeetingPoint((prev) => ({ ...prev, [path]: value }));
  };

  const cancel = () => {
    console.log("cancel");
    setTempMeetingPoint(meetingPoint);
    setIsDirty(false);
  };

  const save = async (data) => {
    toastr.info("Sauvegarde en cours...");
    try {
      console.log(data);
      const { ok } = await api.put(`/edit-transport/${ligneId}`, {
        ...data,
      });
      if (ok) {
        setIsDirty(false);
        toastr.success("Le points de rendez-vous a été modifié.");
      } else toastr.error("Oups, une erreur est survenue lors de la modifications du points de rendez-vous.");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modifications du points de rendez-vous.");
    }
  };

  const young = youngs?.filter((e) => e.meetingPointId === tempMeetingPoint.meetingPointId);
  return (
    <div>
      <div
        className={`flex justify-between items-center py-6 px-4 text-snu-purple-800 cursor-pointer ${isDirty ? "bg-snu-purple-100" : "hover:bg-gray-50"}`}
        onClick={() => setOpen((o) => !o)}>
        <ChevronDown className={`text-gray-400 ${open ? "rotate-180" : ""}`} />
        <div className="w-[10%]">{tempMeetingPoint.name.replace("PDR-", "").replace("PDR -", "")}</div>
        <div className="w-[20%]">
          <Select
            options={transportTypeList}
            value={tempMeetingPoint.transportType}
            onChange={(value) => {
              handleChange({ path: "transportType", value });
            }}
          />
        </div>
        {currentTab === "aller" ? (
          <>
            <div className="w-[20%]">
              <TimePicker value={tempMeetingPoint.meetingHour} onChange={(value) => handleChange({ path: "meetingHour", value })} />
            </div>
            <div className="w-[20%]">
              <TimePicker value={tempMeetingPoint.departureHour} onChange={(value) => handleChange({ path: "departureHour", value })} />
            </div>
          </>
        ) : (
          <div className="w-[20%]">
            <TimePicker value={tempMeetingPoint.returnHour} onChange={(value) => handleChange({ path: "returnHour", value })} />
          </div>
        )}
        <div className="w-[20%]">
          <TooltipAddress meetingPt={tempMeetingPoint} handleChange={handleChange}>
            <div className="h-[40px] w-full">
              <input
                onClick={(event) => event.stopPropagation()}
                className="h-8 w-full"
                type="text"
                name="address"
                value={tempMeetingPoint.address}
                onChange={(event) => handleChange({ path: "address", value: event.target.value })}
              />
            </div>
          </TooltipAddress>
        </div>
        <div className="w-[10%] flex items-center justify-center">
          {isDirty ? (
            <div className="flex items-center gap-1">
              <button className="bg-white text-gray-700 h-8 w-8 flex items-center justify-center border border-gray-700" onClick={cancel}>
                <HiX />
              </button>
              <button className="bg-snu-purple-800 text-white h-8 w-8 flex items-center justify-center" onClick={() => save(tempMeetingPoint)}>
                <HiCheck />
              </button>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      {open ? (
        <div className="flex flex-col w-1/3 items-start justify-center py-6 px-4 text-snu-purple-800 border rounded m-5 shadow-xl">
          <div className="w-full text-gray-400 px-4 pb-3">{`${young.length} Jeune${young.length > 1 ? "s" : ""} affectés a ce point de rendez-vous.`}</div>
          {young.length ? (
            <div className="flex justify-start items-center w-full pb-3 px-4  text-snu-purple-800">
              <div className="w-1/4 mr-5 text-gray-400">Lastname</div>
              <div className="w-1/4 text-gray-400">FirstName</div>
            </div>
          ) : (
            <></>
          )}
          {young.map((y, i) => {
            return (
              <div key={`young-${i}`} className="flex justify-start items-center w-full pb-3 px-4  text-snu-purple-800">
                <div className="w-1/4 mr-5">{y.lastName}</div>
                <div className="w-1/4">{y.firstName}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

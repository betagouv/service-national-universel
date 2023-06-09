import React, { useState, useEffect } from "react";
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
import Select from "./components/Select";
import { TabItem, Title } from "../plan-transport/components/commons";
import TimePicker from "./components/TimePicker";

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
  const [paramData, setParamData] = React.useState({ page: 0 });
  const [lignesOpen, setLignesOpen] = React.useState([]);
  const filterArray = [].filter((e) => e);
  const [meetingPtsToSave, setMeetingPtsToSave] = useState([]);

  const openLignes = (id, meetingPointIds) => {
    const tmp = lignesOpen;
    const index = tmp.findIndex((e) => e === id);
    let mustSave = false;
    for (let id of meetingPointIds) if (meetingPtsToSave.includes(id)) mustSave = true;
    if (index < 0) tmp.push(id);
    else {
      if (mustSave) toastr.warning("Certaines modifivations n'ont pas été enregistrées.", { autoClose: 6000 });
      tmp.splice(index, 1);
    }

    setLignesOpen([...tmp]);
  };

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
              <div className="flex w-full items-center justify-center py-3 px-4 text-xs uppercase text-gray-400">
                <div className="w-[15%]">Lignes</div>
                <div className="w-[10%]">Pts de Rdv</div>
                <div className="w-[20%]">Date de départ</div>
                <div className="w-[25%]">Traget</div>
                <div className="w-[15%]">Centres de destinations</div>
                <div className="w-[15%]">Taux de remplissage</div>
              </div>
              {data?.map((hit) => {
                return (
                  <Line
                    key={hit._id}
                    hit={hit}
                    currentTab={currentTab}
                    onClick={() =>
                      openLignes(
                        hit._id,
                        hit.pointDeRassemblements.map((e) => e.meetingPointId),
                      )
                    }
                    open={lignesOpen.includes(hit._id)}
                    meetingPtsToSave={meetingPtsToSave}
                    setMeetingPtsToSave={setMeetingPtsToSave}
                  />
                );
              })}
              <hr />
            </div>
          }
        />
      </div>
    </>
  );
};

const Line = ({ hit, currentTab, onClick, open, meetingPtsToSave, setMeetingPtsToSave }) => {
  const [meetingPoints, setMeetingPoints] = useState(
    currentTab === "aller"
      ? //sort meetingPoints by departureHour
      hit.pointDeRassemblements.sort((a, b) => a.departureHour.replace(":", "") - b.departureHour.replace(":", ""))
      : hit.pointDeRassemblements.sort((a, b) => a.returnHour.replace(":", "") - b.returnHour.replace(":", "")),
  );

  return (
    <>
      <hr />
      <div className={`flex items-center py-6 px-4 ${open ? "" : "hover:bg-gray-50"} ${open ? "bg-gray-200" : ""}`} onClick={onClick}>
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
            <MeetingPoints
              meetingPoints={meetingPoints}
              setMeetingPoints={setMeetingPoints}
              id={hit._id}
              currentTab={currentTab}
              meetingPtsToSave={meetingPtsToSave}
              setMeetingPtsToSave={setMeetingPtsToSave}
            />
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

const MeetingPoints = ({ meetingPoints, setMeetingPoints, id, currentTab, meetingPtsToSave, setMeetingPtsToSave }) => {
  {
    const handleChange = (path, value, i) => {
      const tmp = meetingPtsToSave;
      const index = tmp.findIndex((e) => e === meetingPoints[i].meetingPointId);
      if (index < 0) tmp.push(meetingPoints[i].meetingPointId);
      setMeetingPtsToSave([...tmp]);
      const newMeetingPts = meetingPoints;
      newMeetingPts[i][path] = value;
      setMeetingPoints([...newMeetingPts]);
    };

    const save = async (data) => {
      toastr.info("Sauvegarde en cours...");
      try {
        const { ok } = await api.put(`/edit-transport/${id}`, {
          ...data,
        });
        if (ok) {
          const tmp = meetingPtsToSave;
          const index = tmp.findIndex((e) => e === data.meetingPointId);
          if (index >= 0) tmp.splice(index, 1);
          setMeetingPtsToSave([...tmp]);
          toastr.success("Le points de rendez-vous a été modifié.");
        } else toastr.error("Oups, une erreur est survenue lors de la modifications du points de rendez-vous.");
      } catch (e) {
        capture(e);
        toastr.error("Oups, une erreur est survenue lors de la modifications du points de rendez-vous.");
      }
    };

    return meetingPoints.map((_, i) => {
      return (
        <div key={meetingPoints[i].meetingPointId} className="flex justify-between items-center py-6 px-4 hover:bg-gray-50 text-snu-purple-800">
          <div className="w-[10%]">{meetingPoints[i].name.replace("PDR-", "").replace("PDR -", "")}</div>
          <div className="w-[20%]">
            <Select
              options={transportTypeList}
              value={meetingPoints[i].transportType}
              onChange={(e) => {
                handleChange("transportType", e, i);
              }}
            />
          </div>
          {currentTab === "aller" ? (
            <>
              <div className="w-[20%]">
                <TimePicker value={meetingPoints[i].meetingHour} onChange={(value) => handleChange("meetingHour", value, i)} />
              </div>
              <div className="w-[20%]">
                <TimePicker value={meetingPoints[i].departureHour} onChange={(value) => handleChange("departureHour", value, i)} />
              </div>
            </>
          ) : (
            <div className="w-[20%]">
              <TimePicker value={meetingPoints[i].returnHour} onChange={(value) => handleChange("returnHour", value, i)} />
            </div>
          )}
          <div className="w-[20%]">
            <TooltipAddress meetingPt={meetingPoints[i]} handleChange={handleChange} index={i}>
              <div className="h-[40px] w-full">
                <input className="h-8 w-full" type="text" name="address" value={meetingPoints[i].address} onChange={(e) => handleChange("address", e.target.value, i)} />
              </div>
            </TooltipAddress>
          </div>
          <div className="w-[10%] flex items-center justify-center">
            {meetingPtsToSave.includes(meetingPoints[i].meetingPointId) ? (
              <button className="bg-snu-purple-800 text-white rounded h-8 px-3 py-2 flex items-center justify-center" onClick={() => save(meetingPoints[i])}>
                Save
              </button>
            ) : (
              <></>
            )}
          </div>
        </div>
      );
    });
  }
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

const TooltipCapacity = ({ children, youngCapacity, youngSeatsTaken, followerCapacity, ...props }) => {
  return (
    <div className="group relative flex flex-col items-center" {...props}>
      {children}
      <div className="absolute !top-8 rigth-0 mb-3 hidden flex-col items-center group-hover:flex">
        <div className="leading-2 relative z-[500] whitespace-nowrap rounded-lg bg-white py-3 px-3 text-xs text-[#414458] shadow-lg">
          <div className="flex flex-col">
            <div className="text-sm font-medium">{`Capacité pour jeunes: ${youngSeatsTaken} / ${youngCapacity}`}</div>
            <div className="text-xs text-gray-400">{`Capacité pour accompagnateurs: ${followerCapacity}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TooltipAddress = ({ children, meetingPt, handleChange, index }) => {
  return (
    <div className="group relative flex flex-col items-center">
      {children}
      <div className="absolute !top-8 left-0 mb-3 hidden flex-col items-center group-hover:flex">
        <div className="leading-2 relative z-[500] whitespace-nowrap rounded-lg bg-white py-3 px-3 text-xs text-[#414458] shadow-lg">
          <div className="flex flex-col">
            <div className="text-sm font-medium">
              {"Ville: "}
              <span className="text-xs text-gray-400">
                <input type="text" name="city" value={meetingPt.city} onChange={(e) => handleChange("city", e.target.value, index)} />
              </span>
            </div>
            <div className="text-sm font-medium">
              {"Departement: "}
              <span className="text-xs text-gray-400">
                <input type="text" name="department" value={meetingPt.department} onChange={(e) => handleChange("department", e.target.value, index)} />
              </span>
            </div>
            <div className="text-sm font-medium">
              {"Region: "}
              <span className="text-xs text-gray-400">
                <input type="text" name="region" value={meetingPt.region} onChange={(e) => handleChange("region", e.target.value, index)} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

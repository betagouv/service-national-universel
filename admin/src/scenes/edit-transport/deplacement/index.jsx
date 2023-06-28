import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ROLES } from "snu-lib";
import { capture } from "../../../sentry";

import Select from "./components/Select";
import MainSelect from "../components/Select";
import { HiX, HiCheck } from "react-icons/hi";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import Loader from "../../../components/Loader";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { Title } from "../../plan-transport/components/commons";
import { useHistory } from "react-router-dom";
import SelectInput from "./components/SelectInput";
import { MdMan } from "react-icons/md";

const cohortList = [
  { label: "Séjour du <b>19 Février au 3 Mars 2023</b>", value: "Février 2023 - C" },
  { label: "Séjour du <b>9 au 21 Avril 2023</b>", value: "Avril 2023 - A" },
  { label: "Séjour du <b>16 au 28 Avril 2023</b>", value: "Avril 2023 - B" },
  { label: "Séjour du <b>11 au 23 Juin 2023</b>", value: "Juin 2023" },
  { label: "Séjour du <b>4 au 16 Juillet 2023</b>", value: "Juillet 2023" },
];

const ChangeYoungs = () => {
  const { user, sessionPhase1 } = useSelector((state) => state.Auth);
  const urlParams = new URLSearchParams(window.location.search);
  const defaultCohort = user.role === ROLES.ADMIN && sessionPhase1 ? sessionPhase1.cohort : "Février 2023 - C";
  const [cohort, setCohort] = React.useState(urlParams.get("cohort") || defaultCohort);
  const ligne_id_from = urlParams.get("ligne_id_from");
  const history = useHistory();
  return (
    <>
      <div className="w-full flex justify-between items-center">
        <Breadcrumbs items={[{ label: "Edit plan de transport", to: "/edit-transport" }, { label: "Déplacement de volontaires" }]} />
        <button
          className="border border-white  hover:scale-110 duration-200 ease-in-out rounded px-2 py-1 bg-snu-purple-800 text-white shadow-xl mt-2 mr-2"
          onClick={() => history.push(`/edit-transport?cohort=${cohort}`)}>
          retour
        </button>
      </div>

      <div className="flex w-full flex-col px-8 pb-8 h-full">
        <div className="flex items-center justify-between py-8">
          <Title>Déplacement de volontaires</Title>
          <MainSelect
            options={cohortList}
            value={cohort}
            disabled={user.role !== ROLES.ADMIN && user.subRole !== "god"}
            onChange={(e) => {
              setCohort(e);
              history.replace({ search: `?cohort=${e}` });
            }}
          />
        </div>
        <ChangeYoung cohort={cohort} defaultLine={ligne_id_from} />
      </div>
    </>
  );
};

export default ChangeYoungs;

const ChangeYoung = ({ cohort, defaultLine }) => {
  const [allLines, setAllLines] = useState();
  const [youngs, setYoungs] = useState();
  const [linesInView, setLinesInView] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isCancel, setIsCancel] = useState(false);
  const [currentTab, setCurrentTab] = useState("aller");
  const [selectedPdr, setSelectedPdr] = useState([null, null]);
  const [checkedAll, setCheckedAll] = useState(false);
  const [checkedYoungs, setCheckedYoungs] = useState();
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (!cohort) return;
    try {
      const getAllLines = async () => {
        const res = await api.get(`/edit-transport/allLines/${cohort}`);
        if (res.ok) {
          const lineDefault = res.data.find((e) => e._id === defaultLine);
          setAllLines(res.data.reverse());
          setLinesInView([lineDefault ? lineDefault : res.data[0], lineDefault ? lineDefault : res.data[0]]);
        } else toastr.error("Oups, une erreur est survenue lors de la récupération des linesInView");
      };
      getAllLines();
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des linesInView");
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
        } else toastr.error("Oups, une erreur est survenue lors de la récupération des jeunes");
      };
      getYoungs();
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des jeunes");
    }
  }, [allLines, isCancel]);

  const cancel = () => {
    setIsCancel((o) => !o);
    setIsDirty(false);
  };

  const save = () => {
    try {
      const saveYoungs = async (data) => {
        const res = await api.post("/edit-transport/saveYoungs", { data, busFrom: linesInView[0], busTo: linesInView[1] });
        if (res.ok) {
          toastr.success("Les jeunes ont bien été déplacé.");
          setIsDirty(false);
        } else toastr.error("Oups, une erreur est survenue lors de l'enregistrement des données");
      };
      const data = [];
      for (let id of checkedYoungs.filter((e) => e !== null)) {
        const index = youngs.findIndex((e) => e._id === id);
        if (index >= 0) data.push(youngs[index]);
      }
      saveYoungs(data);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'enregistrement des données");
    }
  };

  const onChangeLine = (value, index) => {
    const newLignes = linesInView;
    newLignes.splice(index, 1);
    newLignes.splice(
      index,
      0,
      allLines.find((e) => e._id === value),
    );
    const newSelectPdr = selectedPdr;
    newSelectPdr.splice(index, 1);
    newSelectPdr.splice(index, 0, null);
    setSelectedPdr([...newSelectPdr]);
    setLinesInView([...newLignes]);
  };

  useEffect(() => {
    const line = linesInView[1];
    if (!line || !checkedYoungs) return;
    const checkedNumber = line._id === linesInView[0]._id ? 0 : checkedYoungs.filter((e) => e).length;
    const total = line.youngCapacity;
    const numOfYoung = youngs.filter((e) => e.ligneId === line._id).length;
    setUnauthorized(numOfYoung + checkedNumber > total);
  }, [checkedYoungs, linesInView[1]]);

  const onChangePdr = (value, index, ligne) => {
    const select = ligne.pointDeRassemblements.find((e) => e.meetingPointId === value);
    const tmp = selectedPdr;
    tmp.splice(index, 1);
    tmp.splice(index, 0, select);
    setSelectedPdr([...tmp]);
  };

  const move = () => {
    if (unauthorized) return toastr.error("La capacité du bus ne permet pas de faire le transfert");
    if (!checkedYoungs) return;
    if (!checkedYoungs.filter((e) => e).length) return toastr.error("Aucun jeunes selectionnés");
    const toLine = linesInView[1]._id;
    const toPdr = selectedPdr[1].meetingPointId;
    const tmp = youngs;
    for (let id of checkedYoungs) {
      const index = youngs.findIndex((e) => e._id === id);
      if (index >= 0) {
        tmp[index].meetingPointId = toPdr;
        tmp[index].ligneId = toLine;
      }
    }
    setCheckedYoungs([]);
    setIsDirty(true);
    setYoungs([...tmp]);
  };

  if (!allLines || !youngs) return <Loader />;

  return (
    <div className={`flex flex-col`}>
      <div className="flex w-full justify-between">
        <button
          disabled={!selectedPdr?.[0] || !selectedPdr?.[1] || selectedPdr?.[0]?.name === selectedPdr?.[1]?.name}
          type="button"
          className={`${
            unauthorized || !checkedYoungs || !checkedYoungs[0] || !selectedPdr?.[0] || !selectedPdr?.[1] || selectedPdr?.[0]?.name === selectedPdr?.[1]?.name
              ? "cursor-not-allowed opacity-50"
              : ""
          } border-2 border-snu-purple-800  hover:text-white hover:bg-snu-purple-800 rounded shadow-xl mb-2 w-1/2 py-2`}
          onClick={() => move()}>
          {`Deplacer from: ${linesInView?.[0].busId} to: ${linesInView?.[1].busId}`}
        </button>
        {isDirty ? (
          <div className="flex items-center gap-1">
            <button
              className="bg-white hover:scale-105 duration-200 ease-in-out rounded shadow-xl text-gray-700 h-8 w-8 flex items-center justify-center border border-gray-700"
              onClick={cancel}>
              <HiX />
            </button>
            <button
              className="bg-snu-purple-800 hover:scale-105 duration-200 ease-in-out rounded shadow-xl text-white h-8 w-8 flex items-center justify-center"
              onClick={() => save()}>
              <HiCheck />
            </button>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="flex justify-center p-5 w-wull h-full bg-white shadow-xl rounded">
        {linesInView.map((ligne, index) => {
          const total = ligne.youngCapacity;
          const youngsCount =
            linesInView[0]._id === linesInView[1]._id
              ? youngs.filter((e) => e.meetingPointId === selectedPdr[index]?.meetingPointId).length
              : youngs?.filter((e) => e.ligneId === ligne._id).length;
          const factor = index ? 1 : -1;
          const checkedNumber = factor * (!checkedYoungs ? 0 : checkedYoungs?.filter((e) => e).length);
          const capacityPercent = Math.round(((checkedNumber + youngsCount) * 100) / total);

          return (
            <div className={`flex flex-col w-1/2 items-start ml-3 ${!index % 2 ? "border-r" : ""}`} key={`doppable-${index}`}>
              <div className="text-md mb-2 w-full">
                {currentTab === "aller" ? (
                  <>
                    <p>
                      From:
                      <span className="text-gray-400 ml-2">{`${linesInView[index].pointDeRassemblements[0]?.region}`}</span>
                    </p>
                    <p>
                      To:
                      <span className="text-gray-400 ml-2">{`${linesInView[index].centerRegion}`}</span>
                    </p>
                    {youngs ? (
                      <>
                        <div className="flex w-4/5 justify-between items-center">
                          <p className="w-1/5 ">{"Capacité: "}</p>
                          <div className="w-2/5 flex justify-center items-center">
                            <span className="text-gray-400 mx-2">{`${checkedNumber + youngsCount} / ${total}`}</span>
                            <MdMan color={youngsCount + checkedNumber > total ? "#e6000c" : "#00e667"} />
                          </div>
                          {total ? (
                            <div className="flex w-2/5 items-center gap-4">
                              <div className="text-sm font-normal">{capacityPercent}%</div>
                              <div className="flex flex-col items-center">
                                <svg className="h-9 w-9 -rotate-90" viewBox="0 0 120 120">
                                  <circle cx="60" cy="60" r="40" fill="none" stroke="#F0F0F0" strokeDashoffset={`calc(100 - 0)`} strokeWidth="15" />
                                  <circle
                                    className="percent fifty"
                                    strokeDasharray={100}
                                    strokeDashoffset={`calc(100 - ${Math.min(capacityPercent, 100)}`}
                                    cx="60"
                                    cy="60"
                                    r="40"
                                    fill="none"
                                    stroke={capacityPercent > 100 ? "#e6000c" : "#1E40AF"}
                                    strokeWidth="15"
                                    pathLength="100"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </>
                ) : (
                  <>
                    <p>
                      {"From: "}
                      <span className="text-gray-400">{`${linesInView[index].centerRegion}`}</span>
                    </p>
                    <p className="text-gray-400">
                      {"To: "}
                      <span>{`${linesInView[index].pointDeRassemblements[0]?.region}`}</span>
                    </p>
                  </>
                )}
              </div>
              <div className="text-gray-400">Ligne :</div>
              <div className="flex w-4/5">
                <SelectInput
                  val={ligne.busId}
                  disabled={isDirty ? true : false}
                  options={allLines.map((e) => {
                    return { label: e.busId, value: e._id };
                  })}
                  onChange={(value) => onChangeLine(value, index)}
                  placeholder="Choisir une ligne de transport"
                  renderOption={(option) => {
                    const numOfYoung = youngs.filter((e) => e.ligneId === option.value).length;
                    const total = allLines.find((e) => e._id === option.value).youngCapacity;

                    return (
                      <div className="group flex cursor-pointer items-center justify-between gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                        <div className="w-3/4" dangerouslySetInnerHTML={{ __html: option.label }} />
                        <div className="flex w-1/4 justify-between items-center">
                          <p className="text-gray-400 text-xs">{`${numOfYoung} / ${total}`}</p>
                          <MdMan color={numOfYoung > total ? "#e6000c" : "#00e667"} />
                        </div>
                      </div>
                    );
                  }}
                />
              </div>
              <div className="flex flex-col my-3 w-4/5">
                <div className="text-gray-400">PDR :</div>
                <Select
                  disabled={isDirty ? true : false}
                  options={ligne.pointDeRassemblements.map((e) => {
                    return { label: e.name.replace("PDR-", "").replace("PDR -", ""), value: e.meetingPointId };
                  })}
                  value={selectedPdr[index] ? selectedPdr[index].meetingPointId : { placeholder: "Selectionner un point de rassemblement" }}
                  onChange={(value) => onChangePdr(value, index, ligne)}
                  renderOption={(option) => {
                    const numOfYoung = youngs.filter((e) => e.meetingPointId === option.value).length;
                    const total = linesInView[index] ? linesInView[index].youngCapacity : 0;
                    return (
                      <div className="group flex cursor-pointer items-center justify-between gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                        <div className="w-3/4" dangerouslySetInnerHTML={{ __html: option.label }} />
                        <div className="flex w-1/4 justify-between items-center">
                          <p className="text-gray-400 text-xs">{`${numOfYoung} / ${total}`}</p>
                          <MdMan color={numOfYoung > total ? "#e6000c" : "#00e667"} />
                        </div>
                      </div>
                    );
                  }}
                />
                {!index % 2 && selectedPdr[index] ? (
                  <div className="mt-2 h-[40px]">
                    <input className="accent-snu-purple-800" type="checkbox" onChange={(e) => setCheckedAll(e.target.checked, index)} />
                    <span className="ml-2">{checkedAll ? "Tous déselectionner" : "Tous sélectionner"}</span>
                    <p className="mt-2">
                      Jeunes selectioné : <span className="text-gray-400">{checkedYoungs ? checkedYoungs.filter((e) => e).length : 0}</span>
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 h-[40px]"></div>
                )}
              </div>
              {selectedPdr[index] ? (
                <div className={`flex flex-col overflow-scroll justify-start items-center bg-white rounded shadow-xl w-[80%] h-[200px] mt-1 p-3`}>
                  <YoungLine
                    youngs={youngs}
                    checkedYoungs={checkedYoungs}
                    setCheckedYoungs={setCheckedYoungs}
                    meetingPointId={selectedPdr[index].meetingPointId}
                    checkedAll={!index % 2 ? checkedAll : undefined}
                  />
                </div>
              ) : (
                <></>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const YoungLine = ({ youngs, meetingPointId, checkedYoungs, checkedAll, setCheckedYoungs }) => {
  if (!youngs) return <></>;
  const youngsFilter = youngs.filter((y) => y.meetingPointId === meetingPointId);

  useEffect(() => {
    if (checkedAll !== undefined) setCheckedYoungs(youngsFilter.map((y) => (checkedAll ? y._id : null)));
  }, [checkedAll]);

  const onChecked = (value, index) => {
    const tmp = checkedYoungs;
    tmp.splice(index, 1);
    tmp.splice(index, 0, value ? youngsFilter[index]._id : null);
    setCheckedYoungs([...tmp]);
  };

  if (!youngsFilter || !youngsFilter.length)
    return (
      <div className="flex justify-center items-center h-[80%] mt-[10%]">
        <span className="text-center mx-5">Aucun jeunes ne sont affilié a ce PDR</span>
      </div>
    );

  return youngsFilter.map((e, i) => {
    return (
      <div className="flex w-full justify-between items-center border-b mb-2 px-1 py-2 bg-white" key={`youngFilter-${i}`}>
        {checkedAll !== undefined ? (
          <input
            className="accent-snu-purple-800"
            type="checkbox"
            checked={checkedYoungs && checkedYoungs[i] === e._id ? true : false}
            onChange={(e) => onChecked(e.target.checked, i)}
          />
        ) : (
          <></>
        )}
        <p className="w-1/3">{e.lastName}</p>
        <p className="w-1/3">{e.firstName}</p>
      </div>
    );
  });
};

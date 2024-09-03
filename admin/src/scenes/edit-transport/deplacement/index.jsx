import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ROLES } from "snu-lib";
import { capture } from "../../../sentry";

import MainSelect from "../components/Select";
import { HiX, HiCheck } from "react-icons/hi";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import Loader from "../../../components/Loader";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { Title } from "../../plan-transport/components/commons";
import { useHistory } from "react-router-dom";
import From from "./From";
import To from "./To";
import { environment } from "../../../config";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { getCohortSelectOptions } from "@/services/cohort.service";

const ChangeYoungs = () => {
  const { user, sessionPhase1 } = useSelector((state) => state.Auth);
  const cohorts = useSelector((state) => state.Cohorts);
  const urlParams = new URLSearchParams(window.location.search);
  const defaultCohort = user.role === ROLES.ADMIN && sessionPhase1 ? sessionPhase1.cohort : undefined;
  const [cohort, setCohort] = useState(urlParams.get("cohort") || defaultCohort);
  const [cohortList, setCohortList] = useState();
  const history = useHistory();

  useEffect(() => {
    const cohortList = getCohortSelectOptions(cohorts);
    setCohortList(cohortList);
    if (!cohort) setCohort(cohortList[0].value);
  }, []);

  if (!cohort || !cohortList) return <Loader />;

  return (
    <>
      <div className="w-full flex justify-between items-center">
        <Breadcrumbs items={[{ label: "Edit plan de transport", to: "/edit-transport" }, { label: "Déplacement de volontaires" }]} />
      </div>
      <div className="flex w-full flex-col px-8 pb-8 h-full">
        <div className="flex items-center justify-between py-8">
          <Title>Déplacement de volontaires</Title>
          <MainSelect
            options={cohortList}
            value={cohort}
            onChange={(e) => {
              setCohort(e);
              history.replace({ search: `?cohort=${e}` });
            }}
          />
        </div>
        <ChangeYoung cohort={cohort} />
      </div>
    </>
  );
};

export default ChangeYoungs;

const ChangeYoung = ({ cohort }) => {
  const [allLines, setAllLines] = useState();
  const [youngs, setYoungs] = useState();
  const [isDirty, setIsDirty] = useState(false);
  const [isCancel, setIsCancel] = useState(false);
  const [checkedYoungs, setCheckedYoungs] = useState([]);
  const [unauthorized, setUnauthorized] = useState(false);

  const [selectedLigneFrom, setSelectedLigneFrom] = useState();
  const [selectedPDRFrom, setSelectedPDRFrom] = useState();
  const [selectedLigneTo, setSelectedLigneTo] = useState();
  const [selectedPDRTo, setSelectedPDRTo] = useState();

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    setAllLines();
    setSelectedLigneFrom(null);
    setSelectedPDRFrom(null);
    setSelectedLigneTo(null);
    setSelectedPDRTo(null);
    setCheckedYoungs([]);
    if (!cohort) {
      return;
    }
    try {
      const getAllLines = async () => {
        const res = await api.get(`/edit-transport/allLines/${cohort}`);
        if (res.ok) {
          setAllLines(res.data);
          if (urlParams.get("ligne_from_id")) {
            const ligne = res.data.find((e) => e._id === urlParams.get("ligne_from_id"));
            if (ligne) {
              setSelectedLigneFrom(ligne);
            }
          }
          if (urlParams.get("ligne_from_to")) {
            const ligne = res.data.find((e) => e._id === urlParams.get("ligne_from_to"));
            if (ligne) {
              setSelectedLigneTo(ligne);
            }
          }
        } else toastr.error("Oups, une erreur est survenue lors de la récupération des lignes");
      };
      getAllLines();
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des lignes");
    }
  }, [cohort]);

  //todo pourquoi mettre ca ici ?
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
    // todo : reset directement ici ? pourquoi faire un state ?
    setIsCancel((o) => !o);
    setIsDirty(false);
  };

  const save = () => {
    try {
      const saveYoungs = async (data) => {
        // todo make it more explicit in url : /edit-transport/from/:ligne_id_from/to/:ligne_id_to
        const res = await api.post("/edit-transport/saveYoungs", {
          data,
          busFrom: selectedLigneFrom._id,
          busTo: selectedLigneTo._id,
        });
        if (res.ok) {
          toastr.success("Les jeunes ont bien été déplacé.");
          setIsDirty(false);
        } else toastr.error("Oups, une erreur est survenue lors de l'enregistrement des données");
      };
      const data = [];
      for (let y of checkedYoungs.filter((e) => e !== null)) {
        const index = youngs.findIndex((e) => e._id === y._id);
        if (index >= 0) data.push(youngs[index]);
      }
      setCheckedYoungs([]);
      saveYoungs(data);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'enregistrement des données");
    }
  };

  // todo: reprendre cette logique
  useEffect(() => {
    const line = selectedLigneTo;
    if (!line || !checkedYoungs) return;
    const checkedNumber = line._id === selectedLigneFrom._id ? 0 : checkedYoungs.length;
    const total = line.youngCapacity;
    const numOfYoung = youngs.filter((e) => e.ligneId === line._id).length;
    setUnauthorized(numOfYoung + checkedNumber > total);
  }, [checkedYoungs, setSelectedLigneTo]);

  // revoir la logique? plus simple
  const move = () => {
    if (environment === "production") return toastr.error("Cette fonctionnalité est désactivée en production.");
    if (unauthorized) return toastr.error("La capacité du bus ne permet pas de faire le transfert");
    if (!checkedYoungs) return;
    if (!checkedYoungs.length) return toastr.error("Aucun jeunes selectionnés");
    const toLine = selectedLigneTo._id;
    const toPdr = selectedPDRTo._id;
    const tmp = youngs;
    for (let young of checkedYoungs) {
      const index = youngs.findIndex((e) => e._id === young._id);
      if (index >= 0) {
        tmp[index].meetingPointId = toPdr;
        tmp[index].ligneId = toLine;
        tmp[index].sessionPhase1Id = selectedLigneTo.sessionId;
        tmp[index].cohensioncenterId = selectedLigneTo.cohensioncenterId;
      }
    }
    setIsDirty(true);
    setYoungs([...tmp]);
  };

  if (!allLines || !youngs) return <Loader />;

  return (
    <div className={`flex flex-col`}>
      <div className="flex w-full justify-between">
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
      <div className="flex justify-between items-center gap-4 p-5 w-full h-full bg-white shadow-xl rounded">
        <From
          youngs={youngs}
          allLines={allLines}
          isDirty={isDirty}
          selectedMeetingPoint={selectedPDRFrom}
          setSelectedMeetingPoint={setSelectedPDRFrom}
          selectedLigne={selectedLigneFrom}
          setSelectedLigne={setSelectedLigneFrom}
          checkedYoungs={checkedYoungs}
          setCheckedYoungs={setCheckedYoungs}
          cohort={cohort}
        />
        <div>
          <button
            disabled={!selectedPDRFrom || !selectedPDRTo}
            type="button"
            className={`${
              unauthorized || !checkedYoungs || !checkedYoungs[0] || !selectedPDRTo || !selectedPDRFrom ? "cursor-not-allowed opacity-50 text-gray-300" : "text-snu-purple-800"
            } flex flex-col items-center justify-center`}
            onClick={() => move()}>
            <IoArrowForwardCircleOutline className="text-5xl" />
            {unauthorized || !checkedYoungs || !checkedYoungs[0] || !selectedPDRTo || !selectedPDRFrom ? null : <span className="text-sm">cliquer pour déplacer</span>}
          </button>
        </div>
        <To
          youngs={youngs}
          allLines={allLines}
          isDirty={isDirty}
          selectedMeetingPoint={selectedPDRTo}
          setSelectedMeetingPoint={setSelectedPDRTo}
          selectedLigneFrom={selectedLigneFrom}
          selectedLigne={selectedLigneTo}
          setSelectedLigne={setSelectedLigneTo}
        />
      </div>
    </div>
  );
};

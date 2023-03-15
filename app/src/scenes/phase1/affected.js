import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import dayjs from "dayjs";
import { translate, translateCohort, youngCanChangeSession } from "snu-lib";
import { getCohortDetail } from "../../utils/cohorts.js";
import api from "../../services/api";
import plausibleEvent from "../../services/plausible.js";

import { AlertBoxInformation } from "../../components/Content";
import ChangeStayLink from "./components/ChangeStayLink.js";
import FaqAffected from "./components/FaqAffected.js";
import Iceberg from "../../assets/Iceberg.js";
import Loader from "../../components/Loader";
import { RiErrorWarningLine } from "react-icons/ri";
import StepsAffected from "./components/StepsAffected";
import LongArrow from "../../assets/icons/LongArrow.js";
import SnuBackPack from "../../assets/SnuBackPack.js";
import { ModalConvocation } from "./components/modals/ModalConvocation.js";
import JDMA from "../../components/JDMA.js";

export default function Affected() {
  const young = useSelector((state) => state.Auth.young);
  const [center, setCenter] = useState();
  const [meetingPoint, setMeetingPoint] = useState();
  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const cohortDetails = getCohortDetail(young.cohort);
  const nbvalid = getNbValid(young);
  const areStepsDone = nbvalid === 4;

  const [modalConvocationOpen, setModalConvocationOpen] = useState(false);

  function getNbValid(young) {
    if (young) {
      let nb = 0;
      if (young.meetingPointId || young.deplacementPhase1Autonomous === "true" || young.transportInfoGivenByLocal === "true") nb++;
      if (young.youngPhase1Agreement === "true") nb++;
      if (young.convocationFileDownload === "true") nb++;
      if (young.cohesionStayMedicalFileDownload === "true") nb++;
      return nb;
    }
  }

  const getMeetingPoint = async () => {
    const { data, ok } = await api.get(`/young/${young._id}/point-de-rassemblement?withbus=true`);
    if (!ok) setMeetingPoint(null);
    setMeetingPoint(data);
  };

  useEffect(() => {
    if (!young.sessionPhase1Id) return;
    (async () => {
      setLoading(true);
      const { data, code, ok } = await api.get(`/session-phase1/${young.sessionPhase1Id}/cohesion-center`);
      if (!ok) return toastr.error("error", translate(code));
      setCenter(data);
      getMeetingPoint();
      setLoading(false);
    })();
  }, [young]);

  if (loading) {
    return (
      <div className="my-12 mx-10 w-full">
        <Loader />
      </div>
    );
  }

  if (!center && !meetingPoint) {
    return <Problem young={young} />;
  }

  return (
    <div className="md:m-10">
      <div className="max-w-[80rem] rounded-xl shadow-nina md:mx-auto px-4 md:!px-8 lg:!px-16 py-8 lg:!py-16 relative overflow-hidden flex flex-col justify-between bg-gray-50 md:bg-white mb-4">
        {showInfoMessage && (
          <AlertBoxInformation
            title="Information"
            message="Suite au séjour de cohésion, les espaces volontaires vont s'actualiser dans les prochaines semaines, les attestations seront disponibles directement en ligne."
            onClose={() => setShowInfoMessage(false)}
          />
        )}

        <header className="flex flex-col items-between lg:justify-between lg:flex-row order-1">
          <div>
            <h1 className="text-2xl md:text-5xl md:space-y-4">
              Mon séjour de cohésion
              <br />
              <strong className="flex items-center">{translateCohort(young.cohort)}</strong>
            </h1>
            {youngCanChangeSession(young) ? <ChangeStayLink className="my-4 md:my-8" /> : null}
          </div>

          <LieuAffectation center={center} />
        </header>

        <div
          className={`border flex flex-col md:flex-row flex-none
          gap-12 md:gap-32 order-2 overflow-hidden transition-all ease-in-out duration-500
          ${areStepsDone ? "h-[800px] md:h-[400px]" : "h-0"}`}>
          <ResumeDuVoyage meetingPoint={meetingPoint} cohortDetails={cohortDetails} />
          <DansMonSac setModalConvocationOpen={setModalConvocationOpen} />
        </div>

        <StepsAffected young={young} center={center} nbvalid={nbvalid} />

        <FaqAffected className={`transition-all ${areStepsDone ? "order-3" : "order-4"}`} />
      </div>

      <JDMA id="3504" />

      <ModalConvocation open={modalConvocationOpen} setOpen={setModalConvocationOpen} />
    </div>
  );
}

function Problem({ young }) {
  return (
    <div className="my-12 mx-10 w-full">
      <div className="max-w-[80rem] rounded-xl shadow my-0 md:mx-auto px-4 md:!px-8 lg:!px-16 py-8 relative overflow-hidden justify-between bg-gray-50 md:bg-white mb-4">
        <section className="content">
          <section>
            <article className="flex flex-col items-center lg:flex-row lg:items-center">
              <div className="hidden md:flex flex-col mb-4 mr-8">
                <h1 className="text-5xl">Mon séjour de cohésion</h1>
                <div className="flex flex-row items-center">
                  <h1 className="text-5xl">
                    <strong>{translateCohort(young.cohort)}</strong>
                  </h1>
                </div>
              </div>
              <div className="flex md:hidden flex-col mb-4">
                <h1 className="text-sm text-gray-600 ">Séjour {translateCohort(young.cohort)}</h1>
              </div>
            </article>
          </section>
          <div className="flex flex-col md:flex-row items-center space-x-3 bg-yellow-50 rounded-xl p-4 mt-6">
            <RiErrorWarningLine className="text-yellow-400 text-3xl" />
            <div className="text-center md:!text-left">
              Il y a un problème avec votre affectation.
              <br />
              Nous sommes en train de le résoudre. Revenez plus tard dans l&apos;après-midi, avec nos excuses pour la gêne occasionnée.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function LieuAffectation({ center }) {
  return (
    <div className="bg-gray-100 md:bg-gray-50 rounded-2xl flex p-4 gap-4 md:w-auto justify-between items-center h-fit">
      <article className="md:order-last">
        <h1 className="font-semibold text-xl leading-7">Votre lieu d&apos;affectation</h1>
        <p className="text-sm leading-5 text-gray-700">
          {center?.name}, {center?.city}
          <br />({center?.zip}), {center?.department}
        </p>
      </article>
      <Iceberg className="w-10 h-10 md:w-16 md:h-16" />
    </div>
  );
}

function ResumeDuVoyage({ meetingPoint, cohortDetails }) {
  if (!meetingPoint || !cohortDetails) {
    return <></>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold m-4">Résumé du voyage</h1>
      <div className="border-l-4 border-gray-500 pl-4 space-y-4 my-2">
        <div>
          <p className="flex gap-2 items-center">
            <strong>Aller</strong>
            <span>
              <LongArrow className="text-gray-500" />
            </span>
          </p>
          <p className="leading-relaxed text-sm">
            <span className="capitalize">{dayjs(cohortDetails.dateStart).locale("fr").format("dddd")}</span>{" "}
            <span>{dayjs(cohortDetails.dateStart).locale("fr").format("D MMMM")}</span> à {meetingPoint.ligneToPoint.departureHour}
            <br />
            {meetingPoint.name},
            <br />
            {meetingPoint.address}
          </p>
        </div>

        <div>
          <p className="flex gap-2 items-center">
            <strong>Retour</strong>
            <span>
              <LongArrow className="text-gray-500 rotate-180" />
            </span>
          </p>
          <p className="leading-relaxed text-sm">
            <span className="capitalize">{dayjs(cohortDetails.dateEnd).locale("fr").format("dddd")}</span> <span>{dayjs(cohortDetails.dateEnd).locale("fr").format("D MMMM")}</span>{" "}
            à {meetingPoint.ligneToPoint.returnHour}
            <br />
            {meetingPoint.name},
            <br />
            {meetingPoint.address}
          </p>
        </div>
      </div>
    </div>
  );
}

function DansMonSac({ setModalConvocationOpen }) {
  const persistedTodo = JSON.parse(localStorage.getItem("todo")) || {
    convocation: false,
    identite: false,
    sanitaire: false,
    masques: false,
    collation: false,
  };

  const [todo, setTodo] = useState(persistedTodo);

  function handleCheck(e) {
    setTodo({
      ...todo,
      [e.target.name]: e.target.checked,
    });
    if (Object.values(todo).filter((e) => e === true).length === 2) {
      plausibleEvent("Phase1/Sac a dos 2e case cochee");
    }
    localStorage.setItem("todo", JSON.stringify(todo));
  }

  return (
    <div className="border relative bg-white rounded-xl shadow-nina md:shadow-none p-[1rem] md:p-[0rem] md:w-full">
      <SnuBackPack className="absolute right-0" />
      <div className="max-w-lg bg-cyan-200 space-y-4">
        <h1 className="text-xl font-bold mb-4 md:pt-2">Dans mon sac...</h1>
        <div className="flex gap-4 items-center">
          <input type="checkbox" name="convocation" id="convocation" checked={todo.convocation} onChange={handleCheck} />
          <label htmlFor="convocation">
            Votre{" "}
            <button onClick={() => setModalConvocationOpen(true)} className="font-semibold underline-offset-4 underline decoration-2">
              convocation
            </button>
          </label>
        </div>

        <div className="flex gap-4 items-center">
          <input type="checkbox" name="identite" id="identite" checked={todo.identite} onChange={handleCheck} />
          <label htmlFor="identite">
            Votre <strong>pièce d&apos;identité</strong>
          </label>
        </div>

        <div className="flex gap-4 items-center">
          <input type="checkbox" name="sanitaire" id="sanitaire" checked={todo.sanitaire} onChange={handleCheck} />
          <label htmlFor="sanitaire">
            La <strong>fiche sanitaire</strong> complétée, sous enveloppe destinée au référent sanitaire
          </label>
        </div>

        <div className="flex gap-4 items-center">
          <input type="checkbox" name="masques" id="masques" checked={todo.masques} onChange={handleCheck} />
          <label htmlFor="masques">
            Deux <strong>masques jetables</strong> à usage médical pour le transport en commun
          </label>
        </div>

        <div className="flex gap-4 items-center">
          <input type="checkbox" name="collation" id="collation" checked={todo.collation} onChange={handleCheck} />
          <label htmlFor="collation">
            Une <strong>collation ou un déjeuner froid</strong> pour le repas.
          </label>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import ModalTailwind from "../../components/ui/modals/Modal.js";
import { HiOutlineDownload, HiOutlineMail } from "react-icons/hi";
import { setYoung } from "../../redux/auth/actions.js";
import { capture } from "../../sentry.js";
import ModalConfirm from "../../components/modals/ModalConfirm.js";
import downloadPDF from "../../utils/download-pdf.js";
import ButtonPrimary from "../../components/ui/buttons/ButtonPrimary.js";
import CloseSvg from "../../assets/Close.js";
import ButtonPrimaryOutline from "../../components/ui/buttons/ButtonPrimaryOutline.js";

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
            <h1 className="text-2xl md:text-5xl space-y-4">
              Mon séjour de cohésion
              <br />
              <strong className="flex items-center">{translateCohort(young.cohort)}</strong>
            </h1>
            {youngCanChangeSession(young) ? <ChangeStayLink className="my-8 md:mb-[18px]" /> : null}
          </div>

          <LieuAffectation center={center} />
        </header>

        <div className="flex flex-col md:flex-row gap-12 md:gap-32 order-2">
          <ResumeDuVoyage open={areStepsDone} meetingPoint={meetingPoint} cohortDetails={cohortDetails} />
          <DansMonSac open={areStepsDone} setModalConvocationOpen={setModalConvocationOpen} />
        </div>

        <StepsAffected young={young} center={center} nbvalid={nbvalid} />

        <FaqAffected className={`${areStepsDone ? "order-3" : "order-4"}`} />
      </div>

      <JeDonneMonAvis id="3504" />

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

function ResumeDuVoyage({ open, meetingPoint, cohortDetails }) {
  if (!meetingPoint || !cohortDetails) {
    return <></>;
  }

  return (
    <div className={`${open ? "h-auto" : "h-0"}`}>
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

function DansMonSac({ open, setModalConvocationOpen }) {
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
    <div className={`relative bg-white rounded-xl shadow-nina md:shadow-none p-4 space-y-4 ${open ? "h-auto" : "h-0"}`}>
      <SnuBackPack className="absolute right-0" />
      <h1 className="text-xl font-bold mb-4">Dans mon sac...</h1>

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
  );
}

function JeDonneMonAvis({ id }) {
  return (
    <div className="flex justify-end pt-4 pb-8 pr-8">
      <a href={`https://jedonnemonavis.numerique.gouv.fr/Demarches/${id}?&view-mode=formulaire-avis&nd_source=button&key=060c41afff346d1b228c2c02d891931f`}>
        <img src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu.svg" alt="Je donne mon avis" className="h-[60px]" />
      </a>
    </div>
  );
}

function ModalConvocation({ open, setOpen }) {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const handleDownload = async () => {
    if (young?.convocationFileDownload === "true") return;
    const { data } = await api.put(`/young/phase1/convocation`, { convocationFileDownload: "true" });
    plausibleEvent("affecté_step3");
    dispatch(setYoung(data));
  };

  const handleMail = async () => {
    try {
      let template = "cohesion";
      let type = "convocation";
      const { ok, code } = await api.post(`/young/${young._id}/documents/${type}/${template}/send-email`, {
        fileName: `${young.firstName} ${young.lastName} - ${template} ${type}.pdf`,
      });
      if (!ok) throw new Error(translate(code));
      toastr.success(`Document envoyé à ${young.email}`);
      setOpen(false);
      setModal({ isOpen: false, onConfirm: null });
    } catch (e) {
      capture(e);
      toastr.error("Erreur lors de l'envoie du document : ", e.message);
      setOpen(false);
      setModal({ isOpen: false, onConfirm: null });
    }
  };

  return (
    <ModalTailwind isOpen={open} onClose={() => setOpen(false)}>
      <div className="bg-white p-4 space-y-2 rounded-md w-full md:w-auto">
        <div className="flex gap-4 justify-between">
          <h1 className="text-gray-900 text-lg font-semibold m-0">Choisissez une option de téléchargement</h1>
          <CloseSvg className="close-icon hover:cursor-pointer" height={16} width={16} onClick={() => setOpen(false)} />
        </div>

        <br />
        <ButtonPrimary onClick={handleDownload} className="w-full">
          <HiOutlineDownload className="h-5 w-5 text-blue-300 mr-2" />
          Télécharger
        </ButtonPrimary>

        <ButtonPrimaryOutline
          onClick={() =>
            setModal({
              isOpen: true,
              onConfirm: handleMail,
              title: "Envoi de document par mail",
              message: `Vous allez recevoir votre convocation par mail à l'adresse ${young.email}.`,
            })
          }
          className="w-full">
          <HiOutlineMail className="h-5 w-5 mr-2" />
          Recevoir par mail
        </ButtonPrimaryOutline>
      </div>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => modal?.onConfirm()}
      />
    </ModalTailwind>
  );
}

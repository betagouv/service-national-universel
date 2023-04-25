import React, { useEffect, useState } from "react";
import { ImQuotesLeft } from "react-icons/im";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import ArrowCircleRight from "../../../assets/icons/ArrowCircleRight";
import Badge from "../../../components/Badge";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import Pencil from "../../../assets/icons/Pencil";
import downloadPDF from "../../../utils/download-pdf";

import api from "../../../services/api";
import { formatDateFR, ROLES, translate, canAssignManually, translatePhase1, YOUNG_STATUS_COLORS, YOUNG_STATUS_PHASE1, youngCheckinField } from "../../../utils";
import ModalPointageDepart from "../../centersV2/components/modals/ModalPointageDepart";
import ModalPointagePresenceArrivee from "../../centersV2/components/modals/ModalPointagePresenceArrivee";
import ModalPointagePresenceJDM from "../../centersV2/components/modals/ModalPointagePresenceJDM";
import ModalDispense from "../components/ModalDispense";
import DocumentPhase1 from "../components/DocumentPhase1";
import ModalAffectations from "../components/ModalAffectation";
import TailwindSelect from "../../../components/TailwindSelect";
import YoungHeader from "../../phase0/components/YoungHeader";
import SpeakerPhone from "../../../assets/icons/SpeakerPhone.js";
import BadgeCheck from "../../../assets/icons/BadgeCheck.js";
import Refresh from "../../../assets/icons/Refresh";
import { capture, captureMessage } from "../../../sentry";
import dayjs from "dayjs";
import ExternalLink from "../../../assets/icons/ExternalLink";
import { adminURL } from "../../../config";
import Warning from "../../../assets/icons/Warning";
import DocumentSelect from "../components/DocumentSelect";

export default function Phase1(props) {
  const user = useSelector((state) => state.Auth.user);
  const [meetingPoint, setMeetingPoint] = useState();
  const [young, setYoung] = useState(props.young);
  const [cohesionCenter, setCohesionCenter] = useState();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalPointagePresenceArrivee, setModalPointagePresenceArrivee] = useState({ isOpen: false });
  const [modalPointagePresenceJDM, setModalPointagePresenceJDM] = useState({ isOpen: false });
  const [modalPointageDepart, setModalPointageDepart] = useState({ isOpen: false });
  const [modalAffectations, setModalAffectation] = useState({ isOpen: false });
  const [modalDispense, setModalDispense] = useState({ isOpen: false });
  // new useState
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState(props.young);

  const [cohortOpenForAffectation, setCohortOpenForAffection] = useState(false);
  const [cohort, setCohort] = useState();
  const [isYoungCheckinOpen, setIsYoungCheckinOpen] = React.useState(false);

  const canUserDownloadConvocation = () => {
    if (
      young.hasMeetingInformation === "true" &&
      (young.statusPhase1 === "AFFECTED" || young.statusPhase1 === "DONE" || young.statusPhase1 === "NOT_DONE" || young.statusPhase1 === "EXEMPTED")
    ) {
      return true;
    }
    return false;
  };

  function getDisplayCenterButton() {
    if ((young.status !== "VALIDATED" && young.status !== "WAITING_LIST") || (young.statusPhase1 !== "WAITING_AFFECTATION" && young.statusPhase1 !== "AFFECTED")) {
      setCohortOpenForAffection(false);
    } else if (cohort) {
      setCohortOpenForAffection(canAssignManually(user, young, cohort));
    } else {
      setCohortOpenForAffection(false);
    }
  }

  const handleSendAttestationByEmail = async () => {
    try {
      setLoading(true);
      const { ok, code } = await api.post(`/young/${young._id}/documents/certificate/1/send-email`, {
        fileName: `${young.firstName} ${young.lastName} - certificate 1.pdf`,
      });
      setLoading(false);
      if (!ok) throw new Error(translate(code));
      toastr.success(`Document envoyé à ${young.email}`);
    } catch (e) {
      capture(e);
      setLoading(false);
      toastr.error("Erreur lors de l'envoie du document", e.message);
    }
  };

  const handleDownloadAttestationPdfFile = async () => {
    await downloadPDF({
      url: `/young/${young._id}/documents/certificate/1`,
      fileName: `${young.firstName} ${young.lastName} - attestation 1.pdf`,
    });
  };

  const handleSendConvocationByEmail = async () => {
    try {
      setLoading(true);
      const { ok, code } = await api.post(`/young/${young._id}/documents/convocation/cohesion/send-email`, {
        fileName: `${young.firstName} ${young.lastName} - convocation.pdf`,
      });
      setLoading(false);
      if (!ok) throw new Error(translate(code));
      toastr.success(`Document envoyé à ${young.email}`);
    } catch (e) {
      capture(e);
      setLoading(false);
      toastr.error("Erreur lors de l'envoie du document", e.message);
    }
  };

  const handleDownloadConvocationPdfFile = async () => {
    await downloadPDF({
      url: `/young/${young._id}/documents/convocation/cohesion`,
      fileName: `${young.firstName} ${young.lastName} - attestation 1.pdf`,
    });
  };

  useEffect(() => {
    // --- get cohort.
    (async () => {
      try {
        const { ok, data } = await api.get("/cohort/" + young.cohort);
        if (!ok) {
          toastr.error("Oups, une erreur est survenue lors de la récupération de la cohorte");
          captureMessage("Oups, une erreur est survenue lors de la récupération de la cohorte : " + JSON.stringify(data));
          return setCohortOpenForAffection(false);
        }
        setCohort(data);
      } catch (err) {
        capture(err);
        toastr.error("Oups, une erreur est survenue lors de la récupération de la cohorte");
        setCohort(null);
      }
    })();

    if (!young?.sessionPhase1Id) return;
    (async () => {
      try {
        const { data, code, ok } = await api.get(`/session-phase1/${young?.sessionPhase1Id}/cohesion-center`);
        if (!ok) return toastr.error("Impossible de récupérer les informations du centre de cohésion", translate(code));
        setCohesionCenter(data);
      } catch (err) {
        capture(err);
        toastr.error("Impossible de récupérer les informations du centre de cohésion");
      }
    })();

    if (!young.meetingPointId || !young.ligneId) return;
    (async () => {
      try {
        const { data, code, ok } = await api.get(`/point-de-rassemblement/fullInfo/${young?.meetingPointId}/${young?.ligneId}`);
        if (!ok) return toastr.error("Impossible de récupérer les informations du point de rassemblement", translate(code));
        setMeetingPoint(data);
      } catch (err) {
        capture(err);
        toastr.error("Impossible de récupérer les informations du point de rassemblement");
      }
    })();
  }, []);

  useEffect(() => {
    getDisplayCenterButton();

    if (cohort) {
      const field = youngCheckinField[user.role];
      if (field) {
        setIsYoungCheckinOpen(cohort[field] ? cohort[field] : false);
      } else {
        setIsYoungCheckinOpen(false);
      }
    } else {
      setIsYoungCheckinOpen(false);
    }
  }, [cohort]);

  const onConfirmationYoungAgreement = async (value) => {
    setLoading(true);
    try {
      const { data, ok, code } = await api.post(`/young/${young._id}/phase1/youngPhase1Agreement`, { value });
      if (!ok) {
        toastr.error("Oups, une erreur s'est produite", translate(code));
        setLoading(false);
        return;
      }
      toastr.success("Le statut du jeune a bien été mis à jour");
      setValues(data);
      setYoung(data);
    } catch (error) {
      toastr.error("Oups, une erreur s'est produite", translate(error.code));
    }
    setLoading(false);
  };

  const onSuccess = async (newValue) => {
    setYoung(newValue);
    setValues(newValue);

    // on ferme les modales
    setModalPointagePresenceArrivee({ isOpen: false, value: null });
    setModalPointagePresenceJDM({ isOpen: false, value: null });
    setModalPointageDepart({ isOpen: false, value: null });
  };

  const EditTop = () => {
    return (
      <>
        {!editing ? (
          <button
            className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setEditing(true)}
            disabled={loading}>
            <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
            Modifier
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs font-medium leading-5 text-gray-700 hover:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                setEditing(false);
                setValues(young);
              }}
              disabled={loading}>
              Fermer
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <YoungHeader young={props.young} tab="phase1" onChange={props.onChange} />
      <div className="p-[30px]">
        <div className="mt-[30px] rounded bg-white shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)]">
          <div className="mx-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center gap-2">
                <div className="text-lg font-medium leading-4">Séjour de cohésion</div>
                <Badge
                  minify
                  text={translatePhase1(young.statusPhase1)}
                  // icon={young.statusPhase1 === "AFFECTED" && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm mr-1" />}
                  color={YOUNG_STATUS_COLORS[young.statusPhase1]}
                />
                {canUserDownloadConvocation() && (
                  <DocumentSelect
                    title="Convocation"
                    onClickPdf={handleDownloadConvocationPdfFile}
                    onClickMail={() =>
                      setModal({
                        isOpen: true,
                        title: "Envoie de document par mail",
                        message: `Êtes-vous sûr de vouloir transmettre le document Convocation par mail à ${young.email} ?`,
                        onConfirm: handleSendConvocationByEmail,
                      })
                    }
                  />
                )}
                {young.statusPhase1 === "DONE" && (
                  <DocumentSelect
                    title="Attestation de réalisation phase 1"
                    onClickPdf={handleDownloadAttestationPdfFile}
                    onClickMail={() =>
                      setModal({
                        isOpen: true,
                        title: "Envoie de document par mail",
                        message: `Êtes-vous sûr de vouloir transmettre le document Attestation de réalisation de la phase 1 par mail à ${young.email} ?`,
                        onConfirm: handleSendAttestationByEmail,
                      })
                    }
                  />
                )}
                {young.statusPhase1 === "NOT_DONE" && user.role !== ROLES.HEAD_CENTER && (
                  <div
                    onClick={() => setModalDispense({ isOpen: true })}
                    className="ml-2 cursor-pointer rounded border-[1px] border-blue-700 px-2.5 py-1.5 font-medium text-blue-700">
                    Dispenser le volontaire du séjour
                  </div>
                )}
              </div>
              <EditTop />
            </div>
            <div className="mt-3">
              <div className="flex items-center text-xs font-medium text-gray-900">
                Présence
                {!isYoungCheckinOpen && (
                  <div className="group relative ml-2">
                    <Warning className="text-red-900" />
                    <div className="absolute top-[calc(100%+5px)] left-[50%] z-10 hidden min-w-[200px] translate-x-[-50%] rounded-lg bg-gray-200 px-2 py-1 text-center text-black shadow-sm group-hover:block">
                      <div className="absolute left-[50%] top-[-5px] h-[10px] w-[10px] translate-x-[-50%] rotate-45 bg-gray-200"></div>
                      Le pointage n&apos;est pas ouvert
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2 flex w-full flex-row flex-wrap items-stretch gap-4">
                <div className="min-w-[250px] flex-1">
                  <TailwindSelect
                    name="youngPhase1Agreement"
                    label="Confirmation de la participation"
                    className="min-w-[250px] flex-1"
                    readOnly={!editing}
                    type="select"
                    setSelected={({ value }) =>
                      setModal({
                        isOpen: true,
                        title: "Confirmation de la participation",
                        message: `Êtes-vous sûr de vouloir modifier la confirmation de participation de ${young.firstName} ${young.lastName} à  ${
                          value === "true" ? "oui" : "non"
                        }`,
                        onConfirm: () => onConfirmationYoungAgreement(value),
                      })
                    }
                    selected={values.youngPhase1Agreement}
                    options={[
                      { label: "Oui", value: "true" },
                      { label: "Non", value: "false" },
                    ]}
                  />
                </div>
                <div className="min-w-[250px] flex-1">
                  <TailwindSelect
                    name="cohesionStayPresence"
                    label="Présence à l'arrivée"
                    readOnly={!editing || !isYoungCheckinOpen}
                    type="select"
                    className="min-w-[250px] flex-1"
                    icon={<SpeakerPhone className="mx-2 mr-3 text-gray-500" width={20} height={20} />}
                    setSelected={({ value }) => setModalPointagePresenceArrivee({ isOpen: true, value })}
                    selected={values.cohesionStayPresence || ""}
                    options={[
                      { label: "Non renseigné", value: "", disabled: true, hidden: true },
                      { label: "Présent", value: "true" },
                      { label: "Absent", value: "false" },
                    ]}
                  />
                </div>
                <div className="min-w-[250px] flex-1">
                  <TailwindSelect
                    name="presenceJDM"
                    label="Présence JDM"
                    readOnly={!editing || !isYoungCheckinOpen}
                    type="select"
                    icon={<BadgeCheck className="mx-2 mr-3 text-gray-500" width={20} height={20} />}
                    setSelected={({ value }) => setModalPointagePresenceJDM({ isOpen: true, value })}
                    selected={values.presenceJDM || ""}
                    options={[
                      { label: "Non renseigné", value: "", disabled: true, hidden: true },
                      { label: "Présent", value: "true" },
                      { label: "Absent", value: "false" },
                    ]}
                  />
                </div>
                <div className="min-w-[250px] flex-1 items-stretch">
                  <div
                    onClick={() => {
                      if (!editing || !isYoungCheckinOpen) return;
                      setModalPointageDepart({ isOpen: true });
                    }}
                    className={` flex flex-row items-center justify-start rounded border border-gray-300 py-2 px-2.5 ${editing && "cursor-pointer"} h-full`}>
                    <ArrowCircleRight width={16} height={16} className="mx-2 mr-3 text-gray-400 group-hover:scale-105" />
                    {values?.departSejourAt ? <div>{formatDateFR(values.departSejourAt)}</div> : <div className="text-gray-500">Renseigner un départ</div>}
                  </div>
                </div>
              </div>
            </div>

            {young.departSejourAt ? (
              <div className="mt-4 flex flex-row items-center rounded bg-blue-100 px-3 py-2 text-blue-600">
                <div className="w-1/2 font-bold">{young.departSejourMotif}</div>
                {young.departSejourMotifComment ? (
                  <div className="flex w-1/2 flex-row items-center justify-start gap-2">
                    <ImQuotesLeft />
                    <div>{young.departSejourMotifComment}</div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {cohesionCenter ? (
              <div className="mt-4 flex flex-row items-center justify-center gap-10">
                <div className="mt-4 flex w-full flex-col items-start justify-start self-start">
                  <div className="mb-2 text-xs font-medium text-gray-900">Centre de cohésion</div>
                  <div className="mb-4 flex w-full flex-col gap-4">
                    <Field title="Code centre" value={cohesionCenter.code2022} externalLink={`${adminURL}/centre/${cohesionCenter?._id}`} />
                    <Field title="Nom" value={cohesionCenter.name} />
                    <Field title="Code postal" value={cohesionCenter.zip} />
                    <Field title="Ville" value={cohesionCenter.city} />
                  </div>
                  {cohortOpenForAffectation && editing && (
                    <div
                      onClick={() => setModalAffectation({ isOpen: true })}
                      className="flex w-fit cursor-pointer flex-row items-center justify-center gap-2 self-end rounded border-[1px] border-gray-300 p-2">
                      <Refresh />
                      <div>Changer l&apos;affectation</div>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex w-full flex-col items-start justify-start self-start">
                  <div className="mb-2 text-xs font-medium text-gray-900">Point de rassemblement</div>
                  <div className="mb-4 flex w-full flex-col gap-4 text-sm text-gray-800 ">
                    {meetingPoint ? (
                      <div className="flex flex-col gap-4">
                        <Field
                          title="Adresse"
                          value={meetingPoint?.pointDeRassemblement.address}
                          externalLink={`${adminURL}/point-de-rassemblement/${meetingPoint?.pointDeRassemblement._id}`}
                        />
                        <Field
                          title="Heure&nbsp;de&nbsp;départ"
                          value={dayjs(meetingPoint?.bus.departuredDate).locale("fr").format("dddd D MMMM YYYY") + ", " + meetingPoint?.ligneToPoint.departureHour}
                        />
                        <Field
                          title="Heure&nbsp;de&nbsp;retour"
                          value={dayjs(meetingPoint?.bus.returnDate).locale("fr").format("dddd D MMMM YYYY") + ", " + meetingPoint?.ligneToPoint.returnHour}
                        />
                        <Field title="N˚&nbsp;transport" value={meetingPoint?.bus.busId} externalLink={`${adminURL}/ligne-de-bus/${meetingPoint?.bus._id}`} />
                      </div>
                    ) : young?.transportInfoGivenByLocal === "true" ? (
                      <div>Les informations de transport seront transmises par les services locaux.</div>
                    ) : young?.deplacementPhase1Autonomous === "true" ? (
                      <div>{young.firstName} se rend au centre et en revient par ses propres moyens.</div>
                    ) : (
                      <div>{young.firstName} n’a pas encore confirmé son point de rassemblement.</div>
                    )}
                  </div>
                  {cohortOpenForAffectation && editing && (
                    <div
                      onClick={() => {
                        setModalAffectation({ isOpen: true, center: cohesionCenter, sessionId: young.sessionPhase1Id });
                      }}
                      className="flex w-fit cursor-pointer flex-row items-center justify-center gap-2 self-end rounded border-[1px] border-gray-300 p-2">
                      {meetingPoint || young.deplacementPhase1Autonomous === "true" || young.transportInfoGivenByLocal === "true" ? (
                        <>
                          <Refresh />
                          <div>Changer le point de rassemblement</div>
                        </>
                      ) : (
                        <div>Choisir un point de rassemblement</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="my-52 flex flex-col items-center justify-center gap-4">
                <div className="text-base font-bold text-gray-900">Ce volontaire n&apos;est affecté à aucun centre</div>
                {cohortOpenForAffectation && (
                  <div
                    className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white"
                    onClick={() => {
                      setModalAffectation({ isOpen: true });
                    }}>
                    Affecter dans un centre
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION ||
        young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED ||
        young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE ? (
          <div className="mt-4 rounded bg-white">
            <div className="mx-8 py-4">
              <div className="mr-2 text-lg font-medium">Documents</div>
              <DocumentPhase1 young={young} />
            </div>
          </div>
        ) : null}
      </div>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalPointagePresenceArrivee
        isOpen={modalPointagePresenceArrivee?.isOpen}
        onCancel={() => setModalPointagePresenceArrivee({ isOpen: false, value: null })}
        onSubmit={onSuccess}
        value={modalPointagePresenceArrivee?.value}
        young={young}
      />
      <ModalPointagePresenceJDM
        isOpen={modalPointagePresenceJDM?.isOpen}
        onCancel={() => setModalPointagePresenceJDM({ isOpen: false, value: null })}
        onSubmit={onSuccess}
        value={modalPointagePresenceJDM?.value}
        young={young}
      />
      <ModalPointageDepart
        isOpen={modalPointageDepart?.isOpen}
        onCancel={() => setModalPointageDepart({ isOpen: false, value: null })}
        onSubmit={onSuccess}
        value={modalPointageDepart?.value}
        young={young}
      />
      <ModalAffectations
        isOpen={modalAffectations?.isOpen}
        onCancel={() => setModalAffectation({ isOpen: false })}
        young={young}
        cohort={cohort}
        center={modalAffectations?.center}
        sessionId={modalAffectations?.sessionId}
      />
      <ModalDispense
        isOpen={modalDispense?.isOpen}
        youngId={young?._id}
        onSubmit={onSuccess}
        onCancel={() => setModalDispense({ isOpen: false })}
        onSuccess={(young) => {
          setModalDispense({ isOpen: false });
          setYoung(young);
        }}
      />
    </>
  );
}

const Field = ({ title, value, externalLink }) => {
  return (
    <div key={title} className="flex flex-col rounded border-[1px] border-gray-300 p-2">
      <div className="text-xs text-gray-500">{title}</div>

      {externalLink ? (
        <a target="_blank" rel="noreferrer" href={externalLink}>
          <div className="flex flex-row items-center justify-start gap-1">
            <div className="h-[20px] text-sm text-gray-800">{value}</div>
            <ExternalLink className="font-bold leading-5 text-[#9CA3AF]" />
          </div>
        </a>
      ) : (
        <div className="h-[20px] text-sm text-gray-800">{value}</div>
      )}
    </div>
  );
};

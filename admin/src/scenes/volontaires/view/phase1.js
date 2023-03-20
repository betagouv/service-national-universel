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
            className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setEditing(true)}
            disabled={loading}>
            <Pencil stroke="#2563EB" className="w-[12px] h-[12px]" />
            Modifier
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-gray-100 text-gray-700 bg-gray-100 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-white rounded mt-[30px] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)]">
          <div className="mx-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center justify-center gap-2">
                <div className="text-lg leading-4 font-medium">Séjour de cohésion</div>
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
                    className="cursor-pointer rounded text-blue-700 border-[1px] border-blue-700 px-2.5 py-1.5 ml-2 font-medium">
                    Dispenser le volontaire du séjour
                  </div>
                )}
              </div>
              <EditTop />
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-900 font-medium flex items-center">
                Présence
                {!isYoungCheckinOpen && (
                  <div className="group relative ml-2">
                    <Warning className="text-red-900" />
                    <div className="hidden group-hover:block absolute top-[calc(100%+5px)] left-[50%] bg-gray-200 rounded-lg translate-x-[-50%] px-2 py-1 text-black shadow-sm z-10 min-w-[200px] text-center">
                      <div className="absolute left-[50%] translate-x-[-50%] bg-gray-200 w-[10px] h-[10px] rotate-45 top-[-5px]"></div>
                      Le pointage n&apos;est pas ouvert
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-row gap-4 mt-2 flex-wrap w-full items-stretch">
                <div className="flex-1 min-w-[250px]">
                  <TailwindSelect
                    name="youngPhase1Agreement"
                    label="Confirmation de la participation"
                    className="flex-1 min-w-[250px]"
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
                <div className="flex-1 min-w-[250px]">
                  <TailwindSelect
                    name="cohesionStayPresence"
                    label="Présence à l'arrivée"
                    readOnly={!editing || !isYoungCheckinOpen}
                    type="select"
                    className="flex-1 min-w-[250px]"
                    icon={<SpeakerPhone className="text-gray-500 mx-2 mr-3" width={20} height={20} />}
                    setSelected={({ value }) => setModalPointagePresenceArrivee({ isOpen: true, value })}
                    selected={values.cohesionStayPresence || ""}
                    options={[
                      { label: "Non renseigné", value: "", disabled: true, hidden: true },
                      { label: "Présent", value: "true" },
                      { label: "Absent", value: "false" },
                    ]}
                  />
                </div>
                <div className="flex-1 min-w-[250px]">
                  <TailwindSelect
                    name="presenceJDM"
                    label="Présence JDM"
                    readOnly={!editing || !isYoungCheckinOpen}
                    type="select"
                    icon={<BadgeCheck className="text-gray-500 mx-2 mr-3" width={20} height={20} />}
                    setSelected={({ value }) => setModalPointagePresenceJDM({ isOpen: true, value })}
                    selected={values.presenceJDM || ""}
                    options={[
                      { label: "Non renseigné", value: "", disabled: true, hidden: true },
                      { label: "Présent", value: "true" },
                      { label: "Absent", value: "false" },
                    ]}
                  />
                </div>
                <div className="flex-1 min-w-[250px] items-stretch">
                  <div
                    onClick={() => {
                      if (!editing || !isYoungCheckinOpen) return;
                      setModalPointageDepart({ isOpen: true });
                    }}
                    className={` border-gray-300 border rounded py-2 px-2.5 flex flex-row items-center justify-start ${editing && "cursor-pointer"} h-full`}>
                    <ArrowCircleRight width={16} height={16} className="text-gray-400 group-hover:scale-105 mx-2 mr-3" />
                    {values?.departSejourAt ? <div>{formatDateFR(values.departSejourAt)}</div> : <div className="text-gray-500">Renseigner un départ</div>}
                  </div>
                </div>
              </div>
            </div>

            {young.departSejourAt ? (
              <div className="bg-blue-100 text-blue-600 px-3 py-2 rounded mt-4 flex flex-row items-center">
                <div className="font-bold w-1/2">{young.departSejourMotif}</div>
                {young.departSejourMotifComment ? (
                  <div className="w-1/2 flex flex-row justify-start items-center gap-2">
                    <ImQuotesLeft />
                    <div>{young.departSejourMotifComment}</div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {cohesionCenter ? (
              <div className="flex flex-row items-center justify-center gap-10 mt-4">
                <div className="mt-4 w-full flex flex-col items-start justify-start self-start">
                  <div className="text-xs text-gray-900 font-medium mb-2">Centre de cohésion</div>
                  <div className="flex flex-col gap-4 mb-4 w-full">
                    <Field title="Code centre" value={cohesionCenter.code2022} externalLink={`${adminURL}/centre/${cohesionCenter?._id}`} />
                    <Field title="Nom" value={cohesionCenter.name} />
                    <Field title="Code postal" value={cohesionCenter.zip} />
                    <Field title="Ville" value={cohesionCenter.city} />
                  </div>
                  {cohortOpenForAffectation && editing && (
                    <div
                      onClick={() => setModalAffectation({ isOpen: true })}
                      className="cursor-pointer flex flex-row border-[1px] border-gray-300 items-center justify-center p-2 w-fit rounded gap-2 self-end">
                      <Refresh />
                      <div>Changer l&apos;affectation</div>
                    </div>
                  )}
                </div>
                <div className="mt-4 w-full flex flex-col items-start justify-start self-start">
                  <div className="text-xs text-gray-900 font-medium mb-2">Point de rassemblement</div>
                  <div className="flex flex-col gap-4 mb-4 text-sm text-gray-800 w-full ">
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
                      className="cursor-pointer flex flex-row border-[1px] border-gray-300 items-center justify-center p-2 w-fit rounded gap-2 self-end">
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
              <div className="flex flex-col my-52 gap-4 items-center justify-center">
                <div className="font-bold text-gray-900 text-base">Ce volontaire n&apos;est affecté à aucun centre</div>
                {cohortOpenForAffectation && (
                  <div
                    className="bg-blue-600 px-4 rounded text-white py-2 cursor-pointer"
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
          <div className="bg-white rounded mt-4">
            <div className="mx-8 py-4">
              <div className="text-lg font-medium mr-2">Documents</div>
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
    <div key={title} className="border-[1px] flex flex-col border-gray-300 p-2 rounded">
      <div className="text-gray-500 text-xs">{title}</div>

      {externalLink ? (
        <a target="_blank" rel="noreferrer" href={externalLink}>
          <div className="flex flex-row items-center justify-start gap-1">
            <div className="text-gray-800 text-sm h-[20px]">{value}</div>
            <ExternalLink className="text-[#9CA3AF] font-bold leading-5" />
          </div>
        </a>
      ) : (
        <div className="text-gray-800 text-sm h-[20px]">{value}</div>
      )}
    </div>
  );
};

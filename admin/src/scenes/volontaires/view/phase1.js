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
import { formatDateFR, ROLES, translate, translatePhase1, YOUNG_STATUS_COLORS, YOUNG_STATUS_PHASE1 } from "../../../utils";
import ModalPointageDepart from "../../centers/components/modals/ModalPointageDepart";
import ModalPointagePresenceArrivee from "../../centers/components/modals/ModalPointagePresenceArrivee";
import ModalPointagePresenceJDM from "../../centers/components/modals/ModalPointagePresenceJDM";
import ModalDispense from "../components/ModalDispense";
import DocumentPhase1 from "../components/DocumentPhase1";
import ModalAffectations from "../components/ModalAffectation";
import TailwindSelect from "../../../components/TailwindSelect";
import YoungHeader from "../../phase0/components/YoungHeader";
import SpeakerPhone from "../../../assets/icons/SpeakerPhone.js";
import BadgeCheck from "../../../assets/icons/BadgeCheck.js";
import Refresh from "../../../assets/icons/Refresh";
import { BiChevronDown } from "react-icons/bi";
import { CiMail } from "react-icons/ci";
import { BsDownload } from "react-icons/bs";
import { capture } from "../../../sentry";
import dayjs from "dayjs";
import { environment } from "../../../config";

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
  const [displayCenterButton, setDisplayCenterButton] = useState(false);

  const [cohortOpenForAffectation, setCohortOpenForAffection] = useState(false);

  const getDisplayCenterButton = async () => {
    if (user.role === ROLES.ADMIN) {
      setCohortOpenForAffection(true);
      return setDisplayCenterButton(true);
    }
    try {
      const { ok, data } = await api.get("/cohort/" + young.cohort);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération de la cohorte");
        return setDisplayCenterButton(false);
      }
      setCohortOpenForAffection(data?.manualAffectionOpenForReferent);
      if ((young.status !== "VALIDATED" && young.status !== "WAITING_LIST") || young.statusPhase1 !== "WAITING_AFFECTATION") return setDisplayCenterButton(false);
      if (!data || !data?.manualAffectionOpenForReferent) return setDisplayCenterButton(false);
      if (user.role === ROLES.REFERENT_REGION && user.region === young.region) return setDisplayCenterButton(true);
    } catch (e) {
      toastr.error("Oups, une erreur est survenue lors de la récupération de la cohorte");
      console.log(e);
    }
  };
  const sendMail = async () => {
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
  const onClickPdf = async () => {
    await downloadPDF({
      url: `/young/${young._id}/documents/certificate/1`,
      fileName: `${young.firstName} ${young.lastName} - attestation 1.pdf`,
    });
  };

  useEffect(() => {
    getDisplayCenterButton();
    if (!young?.sessionPhase1Id) return;
    (async () => {
      const { data, code, ok } = await api.get(`/session-phase1/${young?.sessionPhase1Id}/cohesion-center`);
      if (!ok) return toastr.error("Impossible de récupérer les informations du centre de cohésion", translate(code));
      setCohesionCenter(data);
    })();

    if (!young.meetingPointId || !young.ligneId) return;
    (async () => {
      const { data, code, ok } = await api.get(`/point-de-rassemblement/fullInfo/${young?.meetingPointId}/${young?.ligneId}`);
      if (!ok) return toastr.error("Impossible de récupérer les informations du point de rassemblement", translate(code));
      setMeetingPoint(data);
      console.log(data);
    })();
  }, []);

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
              Annuler
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
        <div className="bg-white rounded">
          <div className="mx-8 py-4">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row items-center justify-center">
                <div className="text-lg leading-4 font-medium mr-2">Séjour de cohésion</div>
                <Badge
                  minify
                  text={translatePhase1(young.statusPhase1)}
                  // icon={young.statusPhase1 === "AFFECTED" && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm mr-1" />}
                  color={YOUNG_STATUS_COLORS[young.statusPhase1]}
                />
                {young.statusPhase1 === "DONE" && (
                  <AttestationSelect
                    onClickPdf={onClickPdf}
                    onClickMail={() =>
                      setModal({
                        isOpen: true,
                        title: "Envoie de document par mail",
                        message: `Êtes-vous sûr de vouloir transmettre le document Attestation de réalisation de la phase 1 par mail à ${young.email} ?`,
                        onConfirm: sendMail,
                      })
                    }
                  />
                )}
                {young.statusPhase1 === "NOT_DONE" && (
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
              <div className="text-xs text-gray-900 font-medium">Présence</div>
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
                    readOnly={!editing}
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
                    readOnly={!editing}
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
                      if (!editing) return;
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
                    <Field title="Code centre" value={cohesionCenter.code2022} />
                    <Field title="Nom" value={cohesionCenter.name} />
                    <Field title="Code postal" value={cohesionCenter.zip} />
                    <Field title="Ville" value={cohesionCenter.city} />
                  </div>
                  {(user.role === ROLES.ADMIN || (user.role === ROLES.REFERENT_REGION && user.region === young.region)) && cohortOpenForAffectation && editing && (
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
                        <Field title="Adresse" value={meetingPoint?.pointDeRassemblement.address} />
                        <Field
                          title="Heure&nbsp;de&nbsp;départ"
                          value={dayjs(meetingPoint?.bus.departuredDate).locale("fr").format("dddd D MMMM YYYY") + ", " + meetingPoint?.ligneToPoint.departureHour}
                        />
                        <Field
                          title="Heure&nbsp;de&nbsp;retour"
                          value={dayjs(meetingPoint?.bus.returnDate).locale("fr").format("dddd D MMMM YYYY") + ", " + meetingPoint?.ligneToPoint.returnHour}
                        />
                        <Field title="N˚&nbsp;transport" value={meetingPoint?.bus.busId} />
                      </div>
                    ) : young?.transportInfoGivenByLocal === "true" ? (
                      <div>Les informations de transport seront transmises par les services locaux.</div>
                    ) : young?.deplacementPhase1Autonomous === "true" ? (
                      <div>{young.firstName} se rend au centre et en revient par ses propres moyens.</div>
                    ) : (
                      <div>{young.firstName} n’a pas encore confirmé son point de rassemblement.</div>
                    )}
                  </div>
                  {(user.role === ROLES.ADMIN || (user.role === ROLES.REFERENT_REGION && user.region === young.region)) && cohortOpenForAffectation && editing && (
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
                {displayCenterButton && (
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

const Field = ({ title, value }) => {
  return (
    <div key={title} className="border-[1px] flex flex-col border-gray-300 p-2 rounded">
      <div className="text-gray-500 text-xs">{title}</div>
      <div className="text-gray-800 text-sm h-[20px]">{value}</div>
    </div>
  );
};

const AttestationSelect = ({ onClickMail, onClickPdf }) => {
  const ref = React.useRef();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);
  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setOpen((open) => !open)}
        className="cursor-pointer flex flex-row justify-center items-center gap-2 text-blue-700 border-[1px] rounded-full border-blue-700 px-3 py-2 ml-2">
        <div className="text-xs font-medium">Attestation de réalisation phase 1</div>
        <BiChevronDown />
      </div>
      <div
        className={`absolute ${
          open ? "flex" : "hidden"
        } flex-col items-center justify-center bg-white border-[1px] border-gray-300 rounded-md text-gray-700 z-10 mt-2 overflow-hidden`}>
        <div
          onClick={() => {
            onClickPdf();
            setOpen(false);
          }}
          className="flex flex-row justify-start items-center gap-2 w-64 py-2.5 px-2 border-b-[1px] hover:text-white hover:bg-blue-600 cursor-pointer">
          <BsDownload />
          <div>Télécharger</div>
        </div>
        <div
          className="flex flex-row justify-start items-center gap-2 w-64 py-2.5 px-2 hover:text-white hover:bg-blue-600 cursor-pointer"
          onClick={() => {
            onClickMail();
            setOpen(false);
          }}>
          <CiMail />
          <div>Envoyer par mail</div>
        </div>
      </div>
    </div>
  );
};

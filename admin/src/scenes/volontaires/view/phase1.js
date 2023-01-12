import React, { useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { ImQuotesLeft } from "react-icons/im";
import { MdOutlineOpenInNew, MdOutlineWarningAmber } from "react-icons/md";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Row } from "reactstrap";
import Download from "../../../assets/Download.js";
import Envelop from "../../../assets/Envelop.js";
import ArrowCircleRight from "../../../assets/icons/ArrowCircleRight";
import Badge from "../../../components/Badge";
import { Box, BoxTitle } from "../../../components/box";
import DownloadAttestationButton from "../../../components/buttons/DownloadAttestationButton";
import MailAttestationButton from "../../../components/buttons/MailAttestationButton";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import Pencil from "../../../assets/icons/Pencil";
import downloadPDF from "../../../utils/download-pdf";

import api from "../../../services/api";
import {
  canAssignCohesionCenter,
  formatDateFR,
  formatStringLongDate,
  ROLES,
  translate,
  translateCohort,
  translatePhase1,
  YOUNG_STATUS_COLORS,
  YOUNG_STATUS_PHASE1,
  YOUNG_STATUS_PHASE1_MOTIF,
  isTemporaryAffected,
} from "../../../utils";
import ModalPointageDepart from "../../centers/components/modals/ModalPointageDepart";
import ModalPointagePresenceArrivee from "../../centers/components/modals/ModalPointagePresenceArrivee";
import ModalPointagePresenceJDM from "../../centers/components/modals/ModalPointagePresenceJDM";
import ModalDispense from "../components/ModalDispense";
import AssignCenter from "../components/AssignCenter";
import DocumentPhase1 from "../components/DocumentPhase1";
import ModalAffectations from "../components/ModalAffectation";
import Select from "../../../components/Select2";
import TailwindSelect from "../../../components/TailwindSelect";
import YoungHeader from "../../phase0/components/YoungHeader";
import SpeakerPhone from "../../../assets/icons/SpeakerPhone.js";
import BadgeCheck from "../../../assets/icons/BadgeCheck.js";
import Refresh from "../../../assets/icons/Refresh";
import ChevronDown from "../../../assets/icons/ChevronDown.js";
import { BiChevronDown } from "react-icons/bi";
import { CiMail } from "react-icons/ci";
import { BsDownload } from "react-icons/bs";
import MailOpenIcon from "../../../components/MailOpenIcon";
import { capture } from "../../../sentry";

export default function Phase1(props) {
  const user = useSelector((state) => state.Auth.user);
  const [meetingPoint, setMeetingPoint] = useState();
  const [young, setYoung] = useState(props.young);
  const [cohesionCenter, setCohesionCenter] = useState();
  const disabled = young.statusPhase1 === "WITHDRAWN" || user.role !== ROLES.ADMIN;
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalPointagePresenceArrivee, setModalPointagePresenceArrivee] = useState({ isOpen: false });
  const [modalPointagePresenceJDM, setModalPointagePresenceJDM] = useState({ isOpen: false });
  const [modalPointageDepart, setModalPointageDepart] = useState({ isOpen: false });
  const [modalAffectations, setModalAffectation] = useState({ isOpen: false });
  const [modalDispense, setModalDispense] = useState({ isOpen: false });
  // new useState
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState(props.young);
  const [displayCenterButton, setDisplayCenterButton] = useState(false);

  const getDisplayCenterButton = async () => {
    console.log("ok ?", young.status);
    if (young.status !== "VALIDATED" && young.status !== "WAITING_LIST") return setDisplayCenterButton(false);
    if (user.role === ROLES.ADMIN) return setDisplayCenterButton(true);
    try {
      const { ok, data } = await api.get("/cohort/" + young.cohort);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération de la cohorte");
        return setDisplayCenterButton(false);
      }
      if (!data || !data[0]?.manualAffectionOpenForReferent) return setDisplayCenterButton(false);
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

    if (!young.meetingPointId) return;
    (async () => {
      const { data, code, ok } = await api.get(`/meeting-point/${young?.meetingPointId}`);
      if (!ok) return toastr.error("Impossible de récupérer les informations du point de rassemblement", translate(code));
      setMeetingPoint(data);
    })();
  }, []);

  const onSubmit = async (newValue) => {
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
                setErrors({});
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
                <div className="text-lg font-medium mr-2">Séjour de cohésion</div>
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
                    setSelected={(val) => setValues({ ...values, youngPhase1Agreement: val })}
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
                <div
                  onClick={() => {
                    if (!editing) return;
                    setModalPointageDepart({ isOpen: true });
                  }}
                  className={`flex-1 min-w-[250px] border-gray-300 border rounded py-2 px-2.5 flex flex-row items-center justify-start ${editing && "cursor-pointer"}`}>
                  <ArrowCircleRight width={16} height={16} className="text-gray-400 group-hover:scale-105 mx-2 mr-3" />
                  {values?.departSejourAt ? <div>{formatDateFR(values.departSejourAt)}</div> : <div className="text-gray-500">Renseigner un départ</div>}
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
              <div className="flex flex-row items-center justify-center gap-10">
                <div className="mt-4 w-full flex flex-col items-start justify-start self-start">
                  <div className="text-xs text-gray-900 font-medium mb-2">Centre de cohésion</div>
                  <div className="flex flex-col gap-3 mb-4 w-full">
                    <Field title="Code centre" value={cohesionCenter.code2022} />
                    <Field title="Nom" value={cohesionCenter.name} />
                    <Field title="Code postal" value={cohesionCenter.zip} />
                    <Field title="Ville" value={cohesionCenter.city} />
                  </div>
                  {editing && (
                    <div
                      onClick={() => setModalAffectation({ isOpen: true })}
                      className="cursor-pointer flex flex-row border-[1px] border-gray-300 items-center justify-center p-2 w-fit rounded gap-2">
                      <Refresh />
                      <div>Changer l&apos;affectation</div>
                    </div>
                  )}
                </div>
                <div className="mt-4 w-full flex flex-col items-start justify-start self-start">
                  <div className="text-xs text-gray-900 font-medium mb-2">Point de rassemblement</div>
                  <div className="flex flex-col gap-3 mb-4 text-sm text-gray-800 w-full ">
                    {meetingPoint ? (
                      <div className="flex flex-col gap-3">
                        <Field title="Adresse" value={meetingPoint?.departureAddress} />
                        <Field title="Heure&nbsp;de&nbsp;départ" value={meetingPoint?.departureAtString} />
                        <Field title="Heure&nbsp;de&nbsp;retour" value={meetingPoint?.returnAtString} />
                        <Field title="N˚&nbsp;transport" value={meetingPoint?.busExcelId} />
                      </div>
                    ) : young?.transportInfoGivenByLocal === "true" ? (
                      <div>Les informations de transport seront transmises par les services locaux.</div>
                    ) : young?.deplacementPhase1Autonomous === "true" ? (
                      <div>{young.firstName} se rend au centre et en revient par ses propres moyens.</div>
                    ) : (
                      <div>{young.firstName} n’a pas encore confirmé son point de rassemblement.</div>
                    )}
                  </div>
                  {editing && (
                    <div
                      onClick={() => {
                        setModalAffectation({ isOpen: true, center: cohesionCenter, sessionId: young.sessionPhase1Id });
                      }}
                      className="cursor-pointer flex flex-row border-[1px] border-gray-300 items-center justify-center p-2 w-fit rounded gap-2">
                      {meetingPoint ? (
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
        {/*
        <Box>
          <article className="flex">
            <Bloc
              title="Séjour de cohésion"
              titleRight={<Badge text={translatePhase1(young.statusPhase1)} color={YOUNG_STATUS_COLORS[young.statusPhase1]} />}
              borderRight
              borderBottom>
              <section className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-gray-500">Présence à l&apos;arrivée</div>
                  <Select
                    options={[
                      { label: "Non renseigné", value: "", disabled: true, hidden: true },
                      { label: "Présent", value: "true" },
                      { label: "Absent", value: "false" },
                    ]}
                    onChange={setModalPointagePresenceArrivee}
                    value={young.cohesionStayPresence || ""}
                    placeholder={young.cohesionStayPresence === "true" ? "Présent" : "Absent"}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-500">Présence JDM</div>
                  <Select
                    options={[
                      { label: "Non renseigné", value: "", disabled: true, hidden: true },
                      { label: "Présent", value: "true" },
                      { label: "Absent", value: "false" },
                    ]}
                    onChange={setModalPointagePresenceJDM}
                    value={young.presenceJDM || ""}
                    placeholder={young.presenceJDM === "true" ? "Présent" : "Absent"}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-500">Départ {young.departSejourMotif ? `(${young.departSejourMotif})` : ""}</div>
                  <div
                    className="flex gap-1 items-center group cursor-pointer min-h-[37px]"
                    onClick={(e) => {
                      setModalPointageDepart({
                        isOpen: true,
                        value: e.target.value,
                      });
                    }}>
                    <ArrowCircleRight className="text-gray-400 group-hover:scale-105" />
                    <div className="group-hover:underline">{!young.departSejourAt ? "Renseigner un départ" : formatDateFR(young.departSejourAt)}</div>
                  </div>
                </div>
                {young.departSejourMotifComment ? (
                  <div className="flex gap-2 bg-blue-50 rounded-lg p-2 text-blue-700">
                    <ImQuotesLeft />
                    <div className="flex-1">{young.departSejourMotifComment}</div>
                  </div>
                ) : null}
                <div className="mt-4">
                  {young.statusPhase1 === "DONE" ? (
                    <>
                      <p className="text-gray-500">Attestation de réalisation phase 1 :</p>
                      <section className="flex mt-3">
                        <DownloadAttestationButton young={young} uri="1" className="mr-2">
                          <Download color="#5145cd" className="mr-2" />
                          Télécharger
                        </DownloadAttestationButton>
                        <MailAttestationButton young={young} type="1" template="certificate" placeholder="Attestation de réalisation de la phase 1">
                          <Envelop color="#5145cd" className="mr-2" />
                          Envoyer par mail
                        </MailAttestationButton>
                      </section>
                    </>
                  ) : (
                    <>
                      {/* {young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && (young.meetingPointId || young.deplacementPhase1Autonomous === "true") ? (
                        <>
                          <p className="text-gray-500 mb-[22px]">Convocation au séjour :</p>
                          <DownloadConvocationButton young={young} uri="cohesion">
                            <Download color="#5145cd" className="mr-2" />
                            Télécharger
                          </DownloadConvocationButton>
                        </>
                      ) : null} */}
        {/*
                    </>
                  )}
                </div>
              </section>
            </Bloc>
            <Bloc title="Détails" borderBottom disabled={disabled}>
              {/* {canAssignCohesionCenter(user, young) &&
              (young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION || young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_LIST) ? (
                <div className="flex items-center hover:underline hover:text-blue-600 cursor-pointer mb-4" onClick={() => setModalAffectation({ isOpen: true })}>
                  <AiOutlinePlus className="text-blue-800 mr-2 border-[1px] border-blue-800 rounded-full h-4 w-4" />
                  Affecter dans un centre
                </div>
              ) : (
                isTemporaryAffected(young) && (
                  <div className="flex bg-yellow-100 gap-x-1 font-bold my-1 rounded-lg p-2">
                    <div className="flex items-center gap-x-2 ">
                      <MdOutlineWarningAmber className="text-xl ml-2 text-yellow-600" />
                      <div className="flex flex-1 text-yellow-600">
                        Le jeune est déjà préaffecté à un centre ! L&apos;affectation manuelle est désactivée temporairement pour ce jeune.
                      </div>
                    </div>
                  </div>
                )
              )} */}
        {/*
              {getCohesionStay(young)}
              <Details title="Dates" value={translateCohort(young.cohort)} className="flex" />
              <p className="text-base my-1">Point de rassemblement :</p>
              {getMeetingPoint(young)}
            </Bloc>
          </article>
          {young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION ||
          young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED ||
          young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE ? (
            <Row>
              <Bloc title="Documents" disabled={disabled}>
                <DocumentPhase1 young={young} />
              </Bloc>
            </Row>
          ) : null}
        </Box >
        */}
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
        onSubmit={onSubmit}
        value={modalPointagePresenceArrivee?.value}
        young={young}
      />
      <ModalPointagePresenceJDM
        isOpen={modalPointagePresenceJDM?.isOpen}
        onCancel={() => setModalPointagePresenceJDM({ isOpen: false, value: null })}
        onSubmit={onSubmit}
        value={modalPointagePresenceJDM?.value}
        young={young}
      />
      <ModalPointageDepart
        isOpen={modalPointageDepart?.isOpen}
        onCancel={() => setModalPointageDepart({ isOpen: false, value: null })}
        onSubmit={onSubmit}
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
      <ModalDispense isOpen={modalDispense?.isOpen} onSubmit={onSubmit} onCancel={() => setModalDispense({ isOpen: false })} />
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

const Details = ({ title, value, to }) => {
  if (!value) return <div />;
  if (typeof value === "function") value = value();
  return (
    <section className="detail grid grid-cols-2 mb-2">
      <p className="detail-title text-[#738297]">{title}&nbsp;:</p>
      {to ? (
        <p className="group detail-text">
          <a href={to} target="_blank" rel="noreferrer" className="flex items-center gap-1 group-hover:underline">
            {value}
            <MdOutlineOpenInNew />
          </a>
        </p>
      ) : (
        <p className="detail-text">{value}</p>
      )}
    </section>
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

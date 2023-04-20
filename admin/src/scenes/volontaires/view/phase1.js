import React, { useEffect, useState } from "react";
import { ImQuotesLeft } from "react-icons/im";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import ArrowCircleRight from "../../../assets/icons/ArrowCircleRight";
import ModalConfirm from "../../../components/modals/ModalConfirm";

import api from "../../../services/api";
import { formatDateFR, translate, canAssignManually, YOUNG_STATUS_PHASE1, youngCheckinField } from "../../../utils";
import ModalPointageDepart from "../../centersV2/components/modals/ModalPointageDepart";
import ModalPointagePresenceArrivee from "../../centersV2/components/modals/ModalPointagePresenceArrivee";
import ModalPointagePresenceJDM from "../../centersV2/components/modals/ModalPointagePresenceJDM";
import DocumentPhase1 from "../components/phase1/DocumentPhase1";
import ModalAffectations from "../components/ModalAffectation";
import TailwindSelect from "../../../components/TailwindSelect";
import YoungHeader from "../../phase0/components/YoungHeader";
import SpeakerPhone from "../../../assets/icons/SpeakerPhone.js";
import BadgeCheck from "../../../assets/icons/BadgeCheck.js";
import Refresh from "../../../assets/icons/Refresh";
import { capture } from "../../../sentry";
import dayjs from "dayjs";
import ExternalLink from "../../../assets/icons/ExternalLink";
import { adminURL } from "../../../config";
import Warning from "../../../assets/icons/Warning";
import Phase1ConfirmationFormBlock from "../components/phase1/Phase1ConfirmationFormBlock";
import { getCohortByName } from "../../../services/cohort.service";
import Phase1Header from "../components/phase1/Phase1Header";

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
  // new useState
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState(props.young);

  const [isCohortOpenForAffectation, setIsCohortOpenForAffection] = useState(false);
  const [cohort, setCohort] = useState();
  const [isYoungCheckinOpen, setIsYoungCheckinOpen] = React.useState(false);

  function getDisplayCenterButton() {
    if ((young.status !== "VALIDATED" && young.status !== "WAITING_LIST") || (young.statusPhase1 !== "WAITING_AFFECTATION" && young.statusPhase1 !== "AFFECTED")) {
      setIsCohortOpenForAffection(false);
    } else if (cohort) {
      setIsCohortOpenForAffection(canAssignManually(user, young, cohort));
    } else {
      setIsCohortOpenForAffection(false);
    }
  }

  useEffect(() => {
    // --- get cohort.
    (async () => {
      try {
        const { data } = await getCohortByName(young.cohort);
        setCohort(data);
      } catch (error) {
        capture(error);
        const { title, message } = error;
        toastr.error(title, message);
        setCohort(null);
        setIsCohortOpenForAffection(false);
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

  const onSuccess = async (newValue) => {
    setYoung(newValue);
    setValues(newValue);

    // on ferme les modales
    setModalPointagePresenceArrivee({ isOpen: false, value: null });
    setModalPointagePresenceJDM({ isOpen: false, value: null });
    setModalPointageDepart({ isOpen: false, value: null });
  };

  return (
    <>
      <YoungHeader young={props.young} tab="phase1" onChange={props.onChange} />
      <div className="p-[30px]">
        <div className="bg-white rounded mt-[30px] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)]">
          <div className="mx-8 py-4">
            <Phase1Header
              user={user}
              young={young}
              setYoung={setYoung}
              editing={editing}
              setEditing={setEditing}
              loading={loading}
              setLoading={setLoading}
              setValues={setValues}
              onSuccess={onSuccess}
            />
            <div className="grid grid-cols-2">
              <Phase1ConfirmationFormBlock
                className="col-start-1 pr-11 border-r-[1px] border-gray-200"
                young={young}
                setYoung={setYoung}
                editing={editing}
                values={values}
                setValues={setValues}
                setLoading={setLoading}
              />
              <div className="col-start-2 pl-11">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs text-gray-900 font-medium">Présence</p>
                  {!isYoungCheckinOpen && (
                    <div className="group relative">
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
                      name="cohesionStayPresence"
                      label="Présence à l'arrivée"
                      readOnly={!editing || !isYoungCheckinOpen}
                      className="flex-1 min-w-[250px]"
                      icon={<SpeakerPhone className="text-gray-500" width={20} height={20} />}
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
                      icon={<BadgeCheck className="text-gray-500" width={20} height={20} />}
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
                  {isCohortOpenForAffectation && editing && (
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
                      <div>{young.firstName} n&apos;a pas encore confirmé son point de rassemblement.</div>
                    )}
                  </div>
                  {isCohortOpenForAffectation && editing && (
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
                {isCohortOpenForAffectation && (
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

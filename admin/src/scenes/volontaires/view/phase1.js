import React, { useEffect, useState } from "react";
import { Row } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  translate,
  translatePhase1,
  YOUNG_STATUS_COLORS,
  YOUNG_STATUS_PHASE1,
  YOUNG_STATUS_PHASE1_MOTIF,
  formatStringLongDate,
  FORCE_DISABLED_ASSIGN_COHESION_CENTER,
  ROLES,
  translateCohort,
  formatDateFR,
} from "../../../utils";
import WrapperPhase1 from "./wrapper";
import api from "../../../services/api";
import DownloadAttestationButton from "../../../components/buttons/DownloadAttestationButton";
import MailAttestationButton from "../../../components/buttons/MailAttestationButton";
import DownloadConvocationButton from "../../../components/buttons/DownloadConvocationButton";
import AssignCenter from "../components/AssignCenter";
import { Box, BoxTitle } from "../../../components/box";
import { toastr } from "react-redux-toastr";
import Badge from "../../../components/Badge";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import DocumentPhase1 from "../components/DocumentPhase1";
import Download from "../../../assets/Download.js";
import Envelop from "../../../assets/Envelop.js";
import ModalPointagePresenceArrivee from "../../centers/components/modals/ModalPointagePresenceArrivee";
import ModalPointagePresenceJDM from "../../centers/components/modals/ModalPointagePresenceJDM";
import ModalPointageDepart from "../../centers/components/modals/ModalPointageDepart";
import ArrowCircleRight from "../../../assets/icons/ArrowCircleRight";
import { ImQuotesLeft } from "react-icons/im";

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

  useEffect(() => {
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

  const getMeetingPoint = (young) => {
    if (young.meetingPointId)
      return (
        <>
          <Details title="Adresse" value={meetingPoint?.departureAddress} />
          <Details title="Heure&nbsp;de&nbsp;départ" value={meetingPoint?.departureAtString} />
          <Details title="Heure&nbsp;de&nbsp;retour" value={meetingPoint?.returnAtString} />
          <Details title="N˚&nbsp;transport" value={meetingPoint?.busExcelId} />
        </>
      );
    if (young.deplacementPhase1Autonomous === "true")
      return (
        <>
          <i>{`${young.firstName} se rend au centre par ses propres moyens.`}</i>
        </>
      );
    return (
      <div>
        <i>{`Aucun point de rassemblement n'a été confirmé pour ${young.firstName}`}</i>
      </div>
    );
  };

  const getCohesionStay = (young) => {
    if (!cohesionCenter) return <i>Aucun centre renseigné</i>;
    if (young.statusPhase1 === "DONE")
      return (
        <>
          <p>{young.firstName} a réalisé son séjour de cohésion.</p>
          <Details title="Centre" to={`/centre/${cohesionCenter._id}`} value={cohesionCenter.name} />
          <Details title="Ville" value={cohesionCenter.city} />
          <Details title="Code&nbsp;Postal" value={cohesionCenter.zip} />
        </>
      );
    if (young.statusPhase1 === "NOT_DONE")
      return (
        <>
          <p>{young.firstName} n&apos;a pas réalisé son séjour de cohésion.</p>
          <Details title="Centre" to={`/centre/${cohesionCenter._id}`} value={cohesionCenter.name} />
          <Details title="Ville" value={cohesionCenter.city} />
          <Details title="Code&nbsp;Postal" value={cohesionCenter.zip} />
        </>
      );
    if (young.statusPhase1 === YOUNG_STATUS_PHASE1.EXEMPTED) {
      return (
        <p>
          Le volontaire a été dispensé de séjour de cohésion.
          <br />
          {young.statusPhase1Motif
            ? `Motif :
          ${young.statusPhase1Motif === YOUNG_STATUS_PHASE1_MOTIF.OTHER ? ` ${young.statusPhase1MotifDetail}` : ` ${translate(young.statusPhase1Motif)}`}`
            : null}
        </p>
      );
    }
    if ((young.statusPhase1 === "CANCEL" || young.statusPhase1 === "EXEMPTED") && young.cohesion2020Step !== "DONE") return <p>Le séjour de cohésion a été annulé.</p>;
    if (young.statusPhase1 === "AFFECTED")
      return (
        <>
          <p className="text-base mb-1">{young.firstName} a été affecté(e) au centre :</p>
          <Details title="Centre" to={`/centre/${cohesionCenter._id}`} value={cohesionCenter.name} />
          <Details title="Ville" value={cohesionCenter.city} />
          <Details title="Code&nbsp;Postal" value={cohesionCenter.zip} />
        </>
      );
    if (young.statusPhase1 === "WAITING_AFFECTATION")
      return (
        <>
          <p>{young.firstName} est en attente d&apos;affectation à un centre de cohésion</p>
          {!FORCE_DISABLED_ASSIGN_COHESION_CENTER && user.role === ROLES.ADMIN ? <AssignCenter young={young} onAffect={props.onChange} /> : null}
        </>
      );
    if (young.statusPhase1 === "WAITING_LIST")
      return (
        <>
          <p className="text-base mb-1">{young.firstName} est sur liste d&apos;attente au centre :</p>
          <Details title="Centre" to={`/centre/${cohesionCenter._id}`} value={cohesionCenter.name} />
          <Details title="Ville" value={cohesionCenter.city} />
          <Details title="Code&nbsp;Postal" value={cohesionCenter.zip} />
        </>
      );
    if (young.statusPhase1 === "WAITING_ACCEPTATION")
      return (
        <>
          <p>
            {young.firstName} doit confirmer sa participation au séjour de cohésion avant le <b>{formatStringLongDate(young.autoAffectationPhase1ExpiresAt)}</b>.
          </p>
          <Details title="Centre" to={`/centre/${cohesionCenter._id}`} value={cohesionCenter.name} />
          <Details title="Ville" value={cohesionCenter.city} />
          <Details title="Code&nbsp;Postal" value={cohesionCenter.zip} />
        </>
      );
    if (young.statusPhase1 === "WITHDRAWN")
      return (
        <>
          <p>{young.firstName} s&apos;est désisté(e) du séjour de cohésion.</p>
          <Details title="Centre" to={`/centre/${cohesionCenter._id}`} value={cohesionCenter.name} />
          <Details title="Ville" value={cohesionCenter.city} />
          <Details title="Code&nbsp;Postal" value={cohesionCenter.zip} />
        </>
      );
  };

  const onSubmit = async (newValue) => {
    setYoung(newValue);

    // on ferme les modales
    setModalPointagePresenceArrivee({ isOpen: false, value: null });
    setModalPointagePresenceJDM({ isOpen: false, value: null });
    setModalPointageDepart({ isOpen: false, value: null });
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperPhase1 young={young} tab="phase1" onChange={props.onChange}>
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
                  <select
                    className={`border-[1px] border-gray-200 rounded-lg text-black py-2 px-3 cursor-pointer min-w-1/4`}
                    value={young.cohesionStayPresence || ""}
                    onChange={(e) => {
                      setModalPointagePresenceArrivee({
                        isOpen: true,
                        value: e.target.value,
                      });
                    }}
                    style={{ fontFamily: "Marianne" }}>
                    <option disabled label="Présence à l'arrivée">
                      Présence à l&apos;arrivée
                    </option>
                    {[
                      { label: "Non renseigné", value: "", disabled: true, hidden: true },
                      { label: "Présent", value: "true" },
                      { label: "Absent", value: "false" },
                    ].map((option, i) => (
                      <option key={i} value={option.value} label={option.label} disabled={option.disabled} hidden={option.hidden}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-500">Présence JDM</div>
                  <select
                    className={`border-[1px] border-gray-200 rounded-lg text-black py-2 px-3 cursor-pointer min-w-1/4`}
                    value={young.presenceJDM || ""}
                    onChange={(e) => {
                      setModalPointagePresenceJDM({
                        isOpen: true,
                        value: e.target.value,
                      });
                    }}
                    style={{ fontFamily: "Marianne" }}>
                    <option disabled label="Présence JDM">
                      Présence JDM
                    </option>
                    {[
                      { label: "Non renseigné", value: "", disabled: true, hidden: true },
                      { label: "Présent", value: "true" },
                      { label: "Absent", value: "false" },
                    ].map((option, i) => (
                      <option key={i} value={option.value} label={option.label} disabled={option.disabled} hidden={option.hidden}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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
                  {young.statusPhase1 === "DONE" && cohesionCenter?.name ? (
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
                      {young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && (young.meetingPointId || young.deplacementPhase1Autonomous === "true") ? (
                        <>
                          <p className="text-gray-500 mb-[22px]">Convocation au séjour :</p>
                          <DownloadConvocationButton young={young} uri="cohesion">
                            <Download color="#5145cd" className="mr-2" />
                            Télécharger
                          </DownloadConvocationButton>
                        </>
                      ) : null}
                    </>
                  )}
                </div>
              </section>
            </Bloc>
            <Bloc title="Détails" borderBottom disabled={disabled}>
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
        </Box>
      </WrapperPhase1>
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
    </div>
  );
}

const Bloc = ({ children, title, titleRight, borderBottom, borderRight, borderTop, disabled, tw }) => {
  return (
    <section
      className={`w-full p-12 ${borderTop ? "border-t-2 border-[#f4f5f7]" : ""} ${borderBottom ? "border-b-2 border-[#f4f5f7]" : ""} ${
        borderRight ? "border-r-2 border-[#f4f5f7]" : ""
      } ${disabled ? "bg-[#f9f9f9]" : "bg-transparent"} ${tw}`}>
      <div className="flex w-full">
        <BoxTitle>
          <div>{title}</div>
          <div>{titleRight}</div>
        </BoxTitle>
      </div>
      {children}
    </section>
  );
};

const Details = ({ title, value, to }) => {
  if (!value) return <div />;
  if (typeof value === "function") value = value();
  return (
    <section className="detail grid grid-cols-2 mb-2">
      <p className="detail-title text-[#738297]">{title}&nbsp;:</p>
      <p className="detail-text">{to ? <Link to={to}>{value}</Link> : value}</p>
    </section>
  );
};

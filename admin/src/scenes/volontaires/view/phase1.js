import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { Formik } from "formik";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  translate,
  YOUNG_STATUS_COLORS,
  YOUNG_STATUS_PHASE1,
  YOUNG_STATUS_PHASE1_MOTIF,
  formatStringLongDate,
  FORCE_DISABLED_ASSIGN_COHESION_CENTER,
  confirmMessageChangePhase1Presence,
  ROLES,
  translateCohort,
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
import Select from "../components/Select";
import ModalConfirm from "../../../components/modals/ModalConfirm";

export default function Phase1(props) {
  const user = useSelector((state) => state.Auth.user);
  const [meetingPoint, setMeetingPoint] = useState();
  const [young, setYoung] = useState(props.young);
  const [cohesionCenter, setCohesionCenter] = useState();
  const disabled = young.statusPhase1 === "WITHDRAWN" || user.role !== ROLES.ADMIN;
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

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
          <p>{young.firstName} a été affecté(e) au centre :</p>
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
          <p>{young.firstName} est sur liste d&apos;attente au centre :</p>
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

  const updateYoung = async (v) => {
    const { data, ok, code } = await api.put(`/referent/young/${young._id}`, v);
    if (!ok) return toastr.error("Oups, une erreur s'est produite", translate(code));
    setYoung(data);
    toastr.success("Mis à jour !");
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperPhase1 young={young} tab="phase1" onChange={props.onChange}>
        <Box>
          <Row>
            <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
              <Bloc title="Séjour de cohésion" titleRight={<Badge text={translate(young.statusPhase1)} color={YOUNG_STATUS_COLORS[young.statusPhase1]} />}>
                {getCohesionStay(young)}
              </Bloc>
              {young.statusPhase1 === "AFFECTED" ? (
                <Bloc title="Point de rassemblement" borderTop>
                  {getMeetingPoint(young)}
                </Bloc>
              ) : null}
            </Col>
            <Col md={6}>
              <Formik
                initialValues={young}
                onSubmit={async (values) => {
                  try {
                    const { ok, code } = await api.put(`/referent/young/${values._id}`, values);
                    if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
                    toastr.success("Mis à jour!");
                  } catch (e) {
                    console.log(e);
                    toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
                  }
                }}>
                {({ values, handleChange }) => (
                  <>
                    <Bloc title="Date de séjour" borderBottom disabled={disabled}>
                      <Details title="Date" value={translateCohort(young.cohort)} />
                      <Select
                        placeholder="Non renseigné"
                        title="Présence"
                        options={[
                          { value: "true", label: "Présent" },
                          { value: "false", label: "Absent" },
                        ]}
                        values={values}
                        name="cohesionStayPresence"
                        handleChange={(e) => {
                          const value = e.target.value;
                          setModal({
                            isOpen: true,
                            onConfirm: () => {
                              handleChange({ target: { value, name: "cohesionStayPresence" } });
                              updateYoung({ cohesionStayPresence: value });
                            },
                            title: "Changement de présence",
                            message: confirmMessageChangePhase1Presence(value),
                          });
                        }}
                        disabled={disabled}
                      />
                    </Bloc>
                    <Bloc title="Fiche sanitaire" disabled={disabled}>
                      <Select
                        placeholder="Non renseigné"
                        title="Document"
                        options={[
                          { value: "true", label: "Réceptionné" },
                          { value: "false", label: "Non réceptionné" },
                        ]}
                        values={values}
                        name="cohesionStayMedicalFileReceived"
                        handleChange={(e) => {
                          const value = e.target.value;
                          handleChange({ target: { value, name: "cohesionStayMedicalFileReceived" } });
                          updateYoung({ cohesionStayMedicalFileReceived: value });
                        }}
                        disabled={disabled}
                      />
                    </Bloc>
                  </>
                )}
              </Formik>
            </Col>
          </Row>
        </Box>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          {young.statusPhase1 === "DONE" && cohesionCenter?.name ? (
            <div style={{ textAlign: "center" }}>
              <DownloadAttestationButton young={young} uri="1">
                Télécharger l&apos;attestation de réalisation de la phase 1
              </DownloadAttestationButton>
              <MailAttestationButton style={{ marginTop: ".5rem" }} young={young} type="1" template="certificate" placeholder="Attestation de réalisation de la phase 1">
                Envoyer l&apos;attestation par mail
              </MailAttestationButton>
            </div>
          ) : null}
          {young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && (young.meetingPointId || young.deplacementPhase1Autonomous === "true") ? (
            <DownloadConvocationButton young={young} uri="cohesion">
              Télécharger la convocation au séjour de cohésion
            </DownloadConvocationButton>
          ) : null}
        </div>
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
    </div>
  );
}

const Bloc = ({ children, title, titleRight, borderBottom, borderRight, borderTop, disabled }) => {
  return (
    <Row
      style={{
        width: "100%",
        borderTop: borderTop ? "2px solid #f4f5f7" : 0,
        borderBottom: borderBottom ? "2px solid #f4f5f7" : 0,
        borderRight: borderRight ? "2px solid #f4f5f7" : 0,
        backgroundColor: disabled ? "#f9f9f9" : "transparent",
      }}>
      <Wrapper
        style={{
          width: "100%",
        }}>
        <div style={{ display: "flex", width: "100%" }}>
          <BoxTitle>
            <div>{title}</div>
            <div>{titleRight}</div>
          </BoxTitle>
        </div>
        {children}
      </Wrapper>
    </Row>
  );
};

const Details = ({ title, value, to }) => {
  if (!value) return <div />;
  if (typeof value === "function") value = value();
  return (
    <div className="detail">
      <div className="detail-title">{title}&nbsp;:</div>
      <div className="detail-text">{to ? <Link to={to}>{value}</Link> : value}</div>
    </div>
  );
};

const Wrapper = styled.div`
  padding: 3rem;
  .detail {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
    text-align: left;
    margin-top: 1rem;
    &-title {
      min-width: 90px;
      width: 30%;
      margin-right: 1rem;
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
      a {
        color: #5245cc;
        :hover {
          text-decoration: underline;
        }
      }
    }
  }
  p {
    font-size: 13px;
    color: #798399;
  }
`;

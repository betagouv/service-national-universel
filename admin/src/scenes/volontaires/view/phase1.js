import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { Formik } from "formik";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { translate, YOUNG_STATUS_COLORS, formatStringLongDate } from "../../../utils";
import WrapperPhase1 from "./wrapper";
import api from "../../../services/api";
import ToggleSwitch from "../../../components/ToogleSwitch";
import DownloadAttestationButton from "../../../components/buttons/DownloadAttestationButton";
import AssignCenter from "../components/AssignCenter";
import { Box, BoxTitle } from "../../../components/box";
import { toastr } from "react-redux-toastr";
import Badge from "../../../components/Badge";
import { environment } from "../../../config";

export default ({ young, getYoung }) => {
  const disabled = false; //young.phase !== YOUNG_PHASE.COHESION_STAY;
  const user = useSelector((state) => state.Auth.user);
  const [meetingPoint, setMeetingPoint] = useState();

  useEffect(() => {
    if (!young.meetingPointId) return;
    (async () => {
      const { data, code, ok } = await api.get(`/meeting-point/${young?.meetingPointId}`);
      if (!ok) return toastr.error("error", translate(code));
      setMeetingPoint(data);
    })();
  }, []);

  const getMeetingPoint = (young) => {
    if (young.meetingPointId)
      return (
        <>
          <Details title="Adresse" value={meetingPoint?.departureAddress} />
          <Details title="Heure&nbsp;de&nbsp;départ" value={formatStringLongDate(meetingPoint?.departureAt)} />
          <Details title="Heure&nbsp;de&nbsp;retour" value={formatStringLongDate(meetingPoint?.returnAt)} />
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
        <i>{`Aucun point de rassemblement n'a été confirmé par ${young.firstName}`}</i>
      </div>
    );
  };

  const getCohesionStay = (young) => {
    if (young.statusPhase1 === "DONE")
      return (
        <>
          <p>Le volontaire a réalisé son séjour de cohésion.</p>
          <Details title="Centre" value={young.cohesionCenterName} />
          <Details title="Ville" value={young.cohesionCenterCity} />
          <Details title="Code&nbsp;Postal" value={young.cohesionCenterZip} />
        </>
      );
    if (young.statusPhase1 === "CANCEL" && young.cohesion2020Step !== "DONE") return <p>Le séjour de cohésion a été annulé.</p>;
    if (young.statusPhase1 === "AFFECTED")
      return (
        <>
          <p>Le volontaire a été affecté au centre :</p>
          <Details title="Centre" to={`/centre/${young.cohesionCenterId}`} value={young.cohesionCenterName} />
          <Details title="Ville" value={young.cohesionCenterCity} />
          <Details title="Code&nbsp;Postal" value={young.cohesionCenterZip} />
        </>
      );
    if (young.statusPhase1 === "WAITING_AFFECTATION")
      return (
        <>
          <p>Le volontaire est en attente d'affectation à un centre de cohésion</p>
          {user.role === "admin" ? <AssignCenter young={young} onAffect={getYoung} /> : null}
        </>
      );
    if (young.statusPhase1 === "WAITING_LIST")
      return (
        <>
          <p>Le volontaire est sur liste d'attente au centre :</p>
          <Details title="Centre" to={`/centre/${young.cohesionCenterId}`} value={young.cohesionCenterName} />
          <Details title="Ville" value={young.cohesionCenterCity} />
          <Details title="Code&nbsp;Postal" value={young.cohesionCenterZip} />
        </>
      );
    if (young.statusPhase1 === "WAITING_ACCEPTATION")
      return (
        <>
          <p>
            Le volontaire doit confirmer sa participation au séjour de cohésion avant le <b>{formatStringLongDate(young.autoAffectationPhase1ExpiresAt)}</b>.
          </p>
          <Details title="Centre" to={`/centre/${young.cohesionCenterId}`} value={young.cohesionCenterName} />
          <Details title="Ville" value={young.cohesionCenterCity} />
          <Details title="Code&nbsp;Postal" value={young.cohesionCenterZip} />
        </>
      );
    if (young.statusPhase1 === "WITHDRAWN")
      return (
        <>
          <p>Le volontaire s'est désisté du séjour de cohésion.</p>
          <Details title="Centre" to={`/centre/${young.cohesionCenterId}`} value={young.cohesionCenterName} />
          <Details title="Ville" value={young.cohesionCenterCity} />
          <Details title="Code&nbsp;Postal" value={young.cohesionCenterZip} />
        </>
      );
  };

  const updateYoung = async (v) => {
    const { ok, code } = await api.put(`/referent/young/${young._id}`, v);
    if (!ok) return toastr.error("Oups, une erreur s'est produite", translate(code));
    toastr.success("Mis à jour !");
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperPhase1 young={young} tab="phase1">
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
                    const { ok, code, data: young } = await api.put(`/referent/young/${values._id}`, values);
                    if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
                    toastr.success("Mis à jour!");
                  } catch (e) {
                    console.log(e);
                    toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
                  }
                }}
              >
                {({ values, handleChange, handleSubmit, isSubmitting, submitForm }) => (
                  <>
                    <Bloc title="Date de séjour" borderBottom disabled={disabled}>
                      <Details title="Début" value={young.cohesionStartAt} />
                      <Details title="Fin" value={young.cohesionEndAt} />
                      <DetailsToogle
                        title="Présence"
                        optionLabels={["Présent", "Absent"]}
                        values={values}
                        name={"cohesionStayPresence"}
                        updateYoung={updateYoung}
                        handleChange={handleChange}
                        disabled={disabled}
                      />
                    </Bloc>
                    <Bloc title="Fiche sanitaire" disabled={disabled}>
                      <DetailsToogle
                        title="Document"
                        optionLabels={["Réceptionné", "Non réceptionné"]}
                        values={values}
                        name={"cohesionStayMedicalFileReceived"}
                        updateYoung={updateYoung}
                        handleChange={handleChange}
                        disabled={disabled}
                      />
                    </Bloc>
                  </>
                )}
              </Formik>
            </Col>
          </Row>
        </Box>
        {young.statusPhase1 === "DONE" && young.cohesionCenterName ? (
          <DownloadAttestationButton young={young} uri="1">
            Télécharger l'attestation de réalisation de la phase 1
          </DownloadAttestationButton>
        ) : null}
      </WrapperPhase1>
    </div>
  );
};

const Bloc = ({ children, title, titleRight, borderBottom, borderRight, borderTop, disabled }) => {
  return (
    <Row
      style={{
        width: "100%",
        borderTop: borderTop ? "2px solid #f4f5f7" : 0,
        borderBottom: borderBottom ? "2px solid #f4f5f7" : 0,
        borderRight: borderRight ? "2px solid #f4f5f7" : 0,
        backgroundColor: disabled ? "#f9f9f9" : "transparent",
      }}
    >
      <Wrapper
        style={{
          width: "100%",
        }}
      >
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

const DetailsToogle = ({ title, name, values, handleChange, updateYoung, disabled, optionLabels }) => {
  return (
    <div className="detail">
      <div className="detail-title">{title}&nbsp;:</div>
      <ToggleSwitch
        optionLabels={optionLabels}
        id={name}
        checked={values[name] === "true"}
        onChange={(checked) => {
          handleChange({ target: { value: checked ? "true" : "false", name } });
          updateYoung({ [name]: checked });
        }}
        disabled={disabled}
      />
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

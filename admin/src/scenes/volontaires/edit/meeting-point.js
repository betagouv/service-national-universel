import React, { useState, useEffect } from "react";
import { Col, Row } from "reactstrap";
import { Field } from "formik";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Loader from "../../../components/Loader";
import api from "../../../services/api";
import AssignMeetingPoint from "../components/AssignMeetingPoint";
import { translate, ENABLE_ASSIGN_MEETING_POINT } from "../../../utils";

export default ({ values, handleChange, handleSubmit }) => {
  const [meetingPoint, setMeetingPoint] = useState();

  const getData = async () => {
    const { data, code, ok } = await api.get(`/meeting-point/young/${values._id}`);
    if (!ok) return toastr.error("error", translate(code));
    setMeetingPoint(data);
  };

  const handleCancel = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ce choix de point de rassemblement ?`)) return;
    const { data, code, ok } = await api.put(`/young/${values._id}/cancel-meeting-point`);
    if (!ok) return toastr.error("error", translate(code));
    handleChange({ target: { name: "deplacementPhase1Autonomous", value: undefined } });
    handleChange({ target: { name: "meetingPointId", value: undefined } });
    toastr.success("Annulation du choix du point de rassemblement pris en compte");
    getData();
  };

  useEffect(() => {
    getData();
  }, [values]);

  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Point de Rassemblement</BoxHeadTitle>
        <BoxContent direction="column">
          {meetingPoint === undefined ? (
            <Loader />
          ) : (
            <>
              {ENABLE_ASSIGN_MEETING_POINT ? <AssignMeetingPoint young={values} onAffect={getData} /> : null}
              {values.deplacementPhase1Autonomous === "true" ? <i>{`${values.firstName} se rend au centre par ses propres moyens.`}</i> : <MeetingPoint value={meetingPoint} />}
              {ENABLE_ASSIGN_MEETING_POINT && (meetingPoint || values.deplacementPhase1Autonomous === "true") ? (
                <CancelButton color="#be3b12" onClick={handleCancel}>
                  Annuler ce choix
                </CancelButton>
              ) : null}
              {ENABLE_ASSIGN_MEETING_POINT && !meetingPoint && values.deplacementPhase1Autonomous !== "true" ? (
                <CancelButton
                  color="#382F79"
                  onClick={() => {
                    handleChange({ target: { name: "meetingPointId", value: undefined } });
                    handleChange({ target: { name: "deplacementPhase1Autonomous", value: "true" } });
                    handleSubmit();
                  }}
                >
                  {values.firstName} se rendra au centre de cohésion par ses propres moyens.
                </CancelButton>
              ) : null}
            </>
          )}
        </BoxContent>
      </Box>
    </Col>
  );
};

const MeetingPoint = ({ value }) => {
  return (
    <>
      <StaticItem title="Adresse" value={value?.departureAddress} />
      <StaticItem title="Heure&nbsp;de&nbsp;départ" value={value?.departureAtString} />
      <StaticItem title="Heure&nbsp;de&nbsp;retour" value={value?.returnAtString} />
      <StaticItem title="N˚&nbsp;transport" value={value?.busExcelId} />
    </>
  );
};
const StaticItem = ({ title, value }) => {
  return (
    <Row className="detail">
      <Col md={4}>
        <label>{title}</label>
      </Col>
      <Col md={8}>
        <Field disabled className="form-control" value={value || ""} />
      </Col>
    </Row>
  );
};

const CancelButton = styled.div`
  margin: 1rem;
  font-style: italic;
  color: ${({ color }) => (color ? color : "#666")};
  :hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { MISSION_STATUS_COLORS, MISSION_STATUS, translate, colors, copyToClipboard } from "../../../utils";

import api from "../../../services/api";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue } from "../../../components/dashboard";

export default ({ referentManagerPhase2 }) => {
  const user = useSelector((state) => state.Auth.user);
  const [missions, setMissions] = useState([]);
  const [stats, setStats] = useState({});
  const history = useHistory();
  const structureId = user.structureId;

  // Get all missions from structure then get all applications int order to display the volontaires' list.
  useEffect(() => {
    async function initMissions() {
      const missionsResponse = await api.get(`/structure/${structureId}/mission`);
      if (!missionsResponse.ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération des missions", translate(missionsResponse.code));
        history.push("/");
      } else {
        setMissions(missionsResponse.data);
      }
    }
    initMissions();
  }, [structureId, user]);
  useEffect(() => {
    setStats(Object.values(MISSION_STATUS).reduce((acc, val) => ({ ...acc, [val]: missions.filter((e) => e.status === val).length }), {}));
  }, [missions]);

  return (
    <Row>
      <Col md={6}>
        <Title>Missions</Title>
      </Col>
      {referentManagerPhase2 ? (
        <Col md={6}>
          <ReferentInfo>
            {`Contacter mon référent départemental Phase 2 (${referentManagerPhase2.department}) - ${referentManagerPhase2.firstName} ${referentManagerPhase2.lastName} :`}
            <div className="email">{`${referentManagerPhase2.email}`}</div>
            <div
              className="icon"
              onClick={() => {
                copyToClipboard(referentManagerPhase2.email);
                toastr.success(`'${referentManagerPhase2.email}' a été copié dans le presse papier.`);
              }}
            />
          </ReferentInfo>
        </Col>
      ) : null}
      <Col md={12}>
        <h4 style={{ fontWeight: "normal", margin: "25px 0" }}>Statut des missions proposées par ma structure</h4>
      </Col>
      {Object.entries(stats).map(([key, val]) => {
        return (
          <Col md={6} xl={3} key={key}>
            <Link to={`/mission?STATUS=%5B"${key}"%5D`}>
              <Card borderBottomColor={MISSION_STATUS_COLORS[key]}>
                <CardTitle>{translate(MISSION_STATUS[key])}</CardTitle>
                <CardValueWrapper>
                  <CardValue>{val}</CardValue>
                  <CardArrow />
                </CardValueWrapper>
              </Card>
            </Link>
          </Col>
        );
      })}
    </Row>
  );
};
const Title = styled.h2`
  color: #242526;
  font-weight: bold;
  font-size: 28px;
  margin-bottom: 10px;
`;
const ReferentInfo = styled.div`
  display: flex;
  justify-content: flex-end;
  color: ${colors.grey};
  .email {
    color: ${colors.purple};
    margin-left: 0.5rem;
  }
  .icon {
    cursor: pointer;
    margin: 0 0.5rem;
    width: 15px;
    height: 15px;
    background: ${`url(${require("../../../assets/copy.svg")})`};
    background-repeat: no-repeat;
    background-position: center;
    background-size: 15px 15px;
  }
`;

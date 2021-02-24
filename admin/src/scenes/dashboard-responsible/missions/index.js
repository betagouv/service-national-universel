import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row, Input } from "reactstrap";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { MISSION_STATUS_COLORS, MISSION_STATUS, translate } from "../../../utils";

import api from "../../../services/api";

export default ({ filter }) => {
  const user = useSelector((state) => state.Auth.user);
  const [missions, setMissions] = useState([]);
  const [stats, setStats] = useState({});
  const history = useHistory();
  const structureId = user.structureId;

  // Get all missions from structure then get all applications int order to display the volontaires' list.
  useEffect(() => {
    async function initMissions() {
      const missionsResponse = await api.get(`/mission/structure/${structureId}`);
      if (!missionsResponse.ok) {
        toastr.error("Oups, une erreur est survenue lors de la récuperation des missions", translate(missionsResponse.code));
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
      <Col md={12}>
        <Title>Missions</Title>
      </Col>
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

const Card = styled.div`
  /* max-width: 325px; */
  min-height: 100px;
  padding: 22px 15px;
  border-bottom: 7px solid ${(props) => props.borderBottomColor};
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  margin-bottom: 33px;
`;
const CardTitle = styled.h3`
  color: #171725;
  font-size: 16px;
  font-weight: bold;
`;
const CardSubtitle = styled.h3`
  font-size: 14px;
  font-weight: 100;
  color: #696974;
`;
const CardValueWrapper = styled.div`
  position: relative;
`;
const CardValue = styled.span`
  font-size: 28px;
`;
const CardArrow = styled.span`
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  background-image: url(${require("../../../assets/arrow.png")});
`;
// Title line with filters
const Title = styled.h2`
  color: #242526;
  font-weight: bold;
  font-size: 28px;
  margin-bottom: 10px;
`;

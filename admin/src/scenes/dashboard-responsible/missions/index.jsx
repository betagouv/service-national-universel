import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { useHistory, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import { MISSION_STATUS_COLORS, MISSION_STATUS, translate } from "../../../utils";

import api from "../../../services/api";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue } from "../../../components/dashboard";

export default function Missions() {
  const user = useSelector((state) => state.Auth.user);
  const [missions, setMissions] = useState([]);
  const [stats, setStats] = useState({});
  const history = useHistory();
  const structureId = user.structureId;

  // Get all missions from structure then get all applications int order to display the volontaires' list.
  useEffect(() => {
    if (!structureId) return setMissions([]);
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
        <h2 className="m-0 text-2xl font-bold">Missions</h2>
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
}

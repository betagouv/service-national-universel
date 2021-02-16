import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row, Input } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { APPLICATION_STATUS_COLORS } from "../../../utils";

import api from "../../../services/api";

export default () => {
  const user = useSelector((state) => state.Auth.user);
  const [missions, setMissions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
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
    async function initApplications() {
      const applicationsPromises = missions.map((mission) => api.get(`/application/mission/${mission._id}`));
      const applications = await Promise.all(applicationsPromises);
      setApplications(
        applications
          .filter((a) => a.ok)
          .map((a) => a.data)
          // Get all application from all missions as a flat array
          .reduce((acc, current) => [...acc, ...current], [])
      );
    }
    initApplications();
  }, [missions]);
  useEffect(() => {
    setStats({
      WAITING_VALIDATION: applications.filter((e) => e.status === "WAITING_VALIDATION").length,
      VALIDATED: applications.filter((e) => e.status === "VALIDATED").length,
      REFUSED: applications.filter((e) => e.status === "REFUSED").length,
      CANCEL: applications.filter((e) => e.status === "CANCEL").length,
    });
  }, [applications]);

  return (
    <Row>
      <Col md={12}>
        <h4 style={{ fontWeight: "normal", margin: "25px 0" }}>Volontaires candidatant sur des missions de ma structure</h4>
      </Col>
      <Col md={6} xl={3}>
        <Link to='/inscription?STATUS=%5B"WAITING_VALIDATION"%5D'>
          <Card borderBottomColor={APPLICATION_STATUS_COLORS.WAITING_VALIDATION}>
            <CardTitle>En attente de validation</CardTitle>
            <CardValueWrapper>
              <CardValue>{stats.WAITING_VALIDATION || "-"}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
      <Col md={6} xl={3}>
        <Link to='/inscription/?STATUS=%5B"VALIDATED"%5D'>
          <Card borderBottomColor={APPLICATION_STATUS_COLORS.VALIDATED}>
            <CardTitle>Validées</CardTitle>
            <CardValueWrapper>
              <CardValue>{stats.VALIDATED || "-"}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
      <Col md={6} xl={3}>
        <Link to='/inscription/?STATUS=%5B"REFUSED"%5D'>
          <Card borderBottomColor={APPLICATION_STATUS_COLORS.REFUSED}>
            <CardTitle>Refusées</CardTitle>
            <CardValueWrapper>
              <CardValue>{stats.REFUSED || "-"}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
      <Col md={6} xl={3}>
        <Link to='/inscription/?STATUS=%5B"REFUSED"%5D'>
          <Card borderBottomColor={APPLICATION_STATUS_COLORS.CANCEL}>
            <CardTitle>Annulés</CardTitle>
            <CardValueWrapper>
              <CardValue>{stats.CANCEL || "-"}</CardValue>
              <CardArrow />
            </CardValueWrapper>
          </Card>
        </Link>
      </Col>
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

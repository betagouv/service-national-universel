import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";

import { APPLICATION_STATUS_COLORS } from "../../../utils";
import Badge from "../../../components/Badge";
import api from "../../../services/api";
import CardArrowDashboard from "../../../components/CardArrowDashboard";

export default () => {
  const user = useSelector((state) => state.Auth.user);
  const [missions, setMissions] = useState([]);
  const [applications, setApplications] = useState([]);
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
      IN_PROGRESS: applications.filter((e) => e.status === "IN_PROGRESS").length,
      DONE: applications.filter((e) => e.status === "DONE").length,
    });
  }, [applications]);

  return (
    <>
      <Row>
        <Col md={12}>
          <h4 style={{ fontWeight: "normal", margin: "25px 0" }}>
            Volontaires candidatant sur des missions de {user.role === "supervisor" ? "mes" : "ma"} structure{user.role === "supervisor" ? "s" : ""}
          </h4>
        </Col>
        <Col md={6} xl={3}>
          <Link to={`/volontaire?STATUS=%5B"WAITING_VALIDATION"%5D`}>
            <CardContainer>
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.WAITING_VALIDATION}>
                <CardTitle>En attente de validation</CardTitle>
                <CardValueWrapper>
                  <CardValue>{stats.WAITING_VALIDATION || "-"}</CardValue>
                  <CardArrowDashboard />
                </CardValueWrapper>
              </Card>
              {stats.WAITING_VALIDATION ? (
                <div style={{ textAlign: "center" }}>
                  <Badge color={APPLICATION_STATUS_COLORS.WAITING_VALIDATION} text="À&nbsp;Modérer" />
                </div>
              ) : null}
            </CardContainer>
          </Link>
        </Col>
        <Col md={6} xl={3}>
          <Link to={`/volontaire?STATUS=%5B"VALIDATED"%5D`}>
            <CardContainer>
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.VALIDATED}>
                <CardTitle>Validées</CardTitle>
                <CardValueWrapper>
                  <CardValue>{stats.VALIDATED || "-"}</CardValue>
                  <CardArrowDashboard />
                </CardValueWrapper>
              </Card>
              {stats.VALIDATED ? (
                <div style={{ textAlign: "center" }}>
                  <Badge color={APPLICATION_STATUS_COLORS.VALIDATED} text="Volontaires&nbsp;à&nbsp;suivre" />
                </div>
              ) : null}
            </CardContainer>
          </Link>
        </Col>
        <Col md={6} xl={3}>
          <Link to={`/volontaire?STATUS=%5B"REFUSED"%5D`}>
            <CardContainer>
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.REFUSED}>
                <CardTitle>Refusées</CardTitle>
                <CardValueWrapper>
                  <CardValue>{stats.REFUSED || "-"}</CardValue>
                  <CardArrowDashboard />
                </CardValueWrapper>
              </Card>
            </CardContainer>
          </Link>
        </Col>
        <Col md={6} xl={3}>
          <Link to={`/volontaire?STATUS=%5B"CANCEL"%5D`}>
            <CardContainer>
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.CANCEL}>
                <CardTitle>Annulés</CardTitle>
                <CardValueWrapper>
                  <CardValue>{stats.CANCEL || "-"}</CardValue>
                  <CardArrowDashboard />
                </CardValueWrapper>
              </Card>
            </CardContainer>
          </Link>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <h4 style={{ fontWeight: "normal", margin: "25px 0" }}>
            Volontaires participant à des missions de {user.role === "supervisor" ? "mes" : "ma"} structure{user.role === "supervisor" ? "s" : ""}
          </h4>
        </Col>
        <Col md={6} xl={3}>
          <Link to={`/volontaire?STATUS=%5B"IN_PROGRESS"%5D`}>
            <CardContainer>
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.IN_PROGRESS}>
                <CardTitle>En cours sur une MIG</CardTitle>
                <CardValueWrapper>
                  <CardValue>{stats.IN_PROGRESS || "-"}</CardValue>
                  <CardArrowDashboard />
                </CardValueWrapper>
              </Card>
            </CardContainer>
          </Link>
        </Col>
        <Col md={6} xl={3}>
          <Link to={`/volontaire?STATUS=%5B"DONE"%5D`}>
            <CardContainer>
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.VALIDATED}>
                <CardTitle>Ayant effectué leur MIG</CardTitle>
                <CardValueWrapper>
                  <CardValue>{stats.DONE || "-"}</CardValue>
                  <CardArrowDashboard />
                </CardValueWrapper>
              </Card>
            </CardContainer>
          </Link>
        </Col>
        <Col md={6} xl={3}>
          <Link to={`/volontaire?STATUS=%5B"NOT_COMPLETED"%5D`}>
            <CardContainer>
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.NOT_COMPLETED}>
                <CardTitle>Ayant abandonné leur MIG</CardTitle>
                <CardValueWrapper>
                  <CardValue>{stats.NOT_COMPLETED || "-"}</CardValue>
                  <CardArrowDashboard />
                </CardValueWrapper>
              </Card>
            </CardContainer>
          </Link>
        </Col>
      </Row>
    </>
  );
};

const CardContainer = styled.div`
  margin-bottom: 33px;
`;

const Card = styled.div`
  /* max-width: 325px; */
  min-height: 100px;
  padding: 22px 15px;
  border-bottom: 7px solid ${(props) => props.borderBottomColor};
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  background-color: #fff;
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

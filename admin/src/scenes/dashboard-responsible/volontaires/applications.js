import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";

import { APPLICATION_STATUS_COLORS, ROLES } from "../../../utils";
import Badge from "../../../components/Badge";
import api from "../../../services/api";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue, CardContainer, Title } from "../../../components/dashboard";

export default () => {
  const user = useSelector((state) => state.Auth.user);
  const [missions, setMissions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const history = useHistory();
  const structureId = user.structureId;

  async function appendMissions(structure) {
    const missionsResponse = await api.get(`/mission/structure/${structure}`);
    if (!missionsResponse.ok) {
      toastr.error("Oups, une erreur est survenue lors de la récupération des missions", translate(missionsResponse.code));
      return history.push("/");
    }
    return missionsResponse.data;
  }

  async function initMissions(structure) {
    const m = await appendMissions(structure);
    if (user.role === ROLES.SUPERVISOR) {
      const subStructures = await api.get(`/structure/network/${structure}`);
      if (!subStructures.ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération des missions des antennes", translate(subStructures.code));
        return history.push("/");
      }
      for (let i = 0; i < subStructures.data.length; i++) {
        const subStructure = subStructures.data[i];
        const tempMissions = await appendMissions(subStructure._id);
        m.push(...tempMissions);
      }
    }
    setMissions(m);
  }

  // Get all missions from structure then get all applications int order to display the volontaires' list.
  useEffect(() => {
    initMissions(structureId);
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
            Volontaires candidatant sur des missions de {user.role === ROLES.SUPERVISOR ? "mes" : "ma"} structure{user.role === ROLES.SUPERVISOR ? "s" : ""}
          </h4>
        </Col>
        <Col md={6} xl={3}>
          <Link to={`/volontaire?STATUS=%5B"WAITING_VALIDATION"%5D`}>
            <CardContainer>
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.WAITING_VALIDATION} style={{ marginBottom: 10 }}>
                <CardTitle>En attente de validation</CardTitle>
                <CardValueWrapper>
                  <CardValue>{stats.WAITING_VALIDATION || "-"}</CardValue>
                  <CardArrow />
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
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.VALIDATED} style={{ marginBottom: 10 }}>
                <CardTitle>Validées</CardTitle>
                <CardValueWrapper>
                  <CardValue>{stats.VALIDATED || "-"}</CardValue>
                  <CardArrow />
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
                  <CardArrow />
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
                  <CardArrow />
                </CardValueWrapper>
              </Card>
            </CardContainer>
          </Link>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <h4 style={{ fontWeight: "normal", margin: "25px 0" }}>
            Volontaires participant à des missions de {user.role === ROLES.SUPERVISOR ? "mes" : "ma"} structure{user.role === ROLES.SUPERVISOR ? "s" : ""}
          </h4>
        </Col>
        <Col md={6} xl={3}>
          <Link to={`/volontaire?STATUS=%5B"IN_PROGRESS"%5D`}>
            <CardContainer>
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.IN_PROGRESS}>
                <CardTitle>En cours sur une MIG</CardTitle>
                <CardValueWrapper>
                  <CardValue>{stats.IN_PROGRESS || "-"}</CardValue>
                  <CardArrow />
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
                  <CardArrow />
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
                  <CardArrow />
                </CardValueWrapper>
              </Card>
            </CardContainer>
          </Link>
        </Col>
      </Row>
    </>
  );
};

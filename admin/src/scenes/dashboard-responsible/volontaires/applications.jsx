import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { APPLICATION_STATUS_COLORS, ROLES, translate, ENABLE_PM } from "../../../utils";
import Badge from "../../../components/Badge";
import api from "../../../services/api";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue, CardContainer } from "../../../components/dashboard";
import { environment } from "../../../config";

export default function Applications() {
  const user = useSelector((state) => state.Auth.user);
  const [stats, setStats] = useState();

  useEffect(() => {
    (async () => {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: {
          status: { terms: { field: "status.keyword" } },
        },
        size: 0,
      };
      const { responses } = await api.esQuery("application", body);
      if (responses?.length) setStats(responses[0].aggregations.status.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      else toastr.error("Oups, une erreur est survenue lors de la récupération des candidatures", translate(responses?.code));
    })();
  }, []);

  const renderStat = (e) => {
    if (e > 0) return e;
    return "-";
  };

  const link = "/volontaire/list/all";

  return (
    <>
      <Row>
        <Col md={12}>
          <h4 style={{ fontWeight: "normal", margin: "25px 0" }}>
            Volontaires candidatant sur des missions de {user.role === ROLES.SUPERVISOR ? "mes" : "ma"} structure{user.role === ROLES.SUPERVISOR ? "s" : ""}
          </h4>
        </Col>
        {ENABLE_PM && stats?.WAITING_VERIFICATION ? (
          <Col md={6} xl={3}>
            <CardContainer>
              <Card borderBottomColor="#888888" style={{ marginBottom: 10, backgroundColor: "#cccccc" }}>
                <CardTitle>En attente de vérification d&apos;éligibilité</CardTitle>
                <CardValueWrapper>
                  <CardValue>{renderStat(stats?.WAITING_VERIFICATION)}</CardValue>
                  <CardArrow />
                </CardValueWrapper>
              </Card>
              {stats?.WAITING_VERIFICATION ? (
                <div style={{ textAlign: "center" }}>
                  <Badge color="#888888" text="En cours de traitement par les équipes SNU" />
                </div>
              ) : null}
            </CardContainer>
          </Col>
        ) : null}
        <Col md={6} xl={3}>
          <Link to={link + `?STATUS=%5B"WAITING_VALIDATION"%5D`}>
            <CardContainer>
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.WAITING_VALIDATION} style={{ marginBottom: 10 }}>
                <CardTitle>En attente de validation</CardTitle>
                <CardValueWrapper>
                  <CardValue>{renderStat(stats?.WAITING_VALIDATION)}</CardValue>
                  <CardArrow />
                </CardValueWrapper>
              </Card>
              {stats?.WAITING_VALIDATION ? (
                <div style={{ textAlign: "center" }}>
                  <Badge color={APPLICATION_STATUS_COLORS.WAITING_VALIDATION} text="À&nbsp;Modérer" />
                </div>
              ) : null}
            </CardContainer>
          </Link>
        </Col>
        <Col md={6} xl={3}>
          <Link to={link + `?STATUS=%5B"VALIDATED"%5D`}>
            <CardContainer>
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.VALIDATED} style={{ marginBottom: 10 }}>
                <CardTitle>Approuvées</CardTitle>
                <CardValueWrapper>
                  <CardValue>{renderStat(stats?.VALIDATED)}</CardValue>
                  <CardArrow />
                </CardValueWrapper>
              </Card>
              {stats?.VALIDATED ? (
                <div style={{ textAlign: "center" }}>
                  <Badge color={APPLICATION_STATUS_COLORS.VALIDATED} text="Volontaires&nbsp;à&nbsp;suivre" />
                </div>
              ) : null}
            </CardContainer>
          </Link>
        </Col>
        <Col md={6} xl={3}>
          <Link to={link + `?STATUS=%5B"REFUSED"%5D`}>
            <CardContainer>
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.REFUSED}>
                <CardTitle>Non retenues</CardTitle>
                <CardValueWrapper>
                  <CardValue>{renderStat(stats?.REFUSED)}</CardValue>
                  <CardArrow />
                </CardValueWrapper>
              </Card>
            </CardContainer>
          </Link>
        </Col>
        <Col md={6} xl={3}>
          <Link to={link + `?STATUS=%5B"CANCEL"%5D`}>
            <CardContainer>
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.CANCEL}>
                <CardTitle>Annulées</CardTitle>
                <CardValueWrapper>
                  <CardValue>{renderStat(stats?.CANCEL)}</CardValue>
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
          <Link to={link + `?STATUS=%5B"IN_PROGRESS"%5D`}>
            <CardContainer>
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.IN_PROGRESS}>
                <CardTitle>En cours sur une MIG</CardTitle>
                <CardValueWrapper>
                  <CardValue>{renderStat(stats?.IN_PROGRESS)}</CardValue>
                  <CardArrow />
                </CardValueWrapper>
              </Card>
            </CardContainer>
          </Link>
        </Col>
        <Col md={6} xl={3}>
          <Link to={link + `?STATUS=%5B"DONE"%5D`}>
            <CardContainer>
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.VALIDATED}>
                <CardTitle>Ayant effectué leur MIG</CardTitle>
                <CardValueWrapper>
                  <CardValue>{renderStat(stats?.DONE)}</CardValue>
                  <CardArrow />
                </CardValueWrapper>
              </Card>
            </CardContainer>
          </Link>
        </Col>
        <Col md={6} xl={3}>
          <Link to={link + `?STATUS=%5B"NOT_COMPLETED"%5D`}>
            <CardContainer>
              <Card borderBottomColor={APPLICATION_STATUS_COLORS.NOT_COMPLETED}>
                <CardTitle>Ayant abandonné leur MIG</CardTitle>
                <CardValueWrapper>
                  <CardValue>{renderStat(stats?.ABANDON)}</CardValue>
                  <CardArrow />
                </CardValueWrapper>
              </Card>
            </CardContainer>
          </Link>
        </Col>
      </Row>
    </>
  );
}

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import CircularProgress from "../components/CircularProgress";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue, CardPercentage, Subtitle } from "../../../components/dashboard";
import {
  translate,
  MISSION_STATUS,
  MISSION_STATUS_COLORS,
  MISSION_DOMAINS,
  PERIOD,
  TRANSPORT,
  FORMAT,
  PROFESSIONNAL_PROJECT,
  PROFESSIONNAL_PROJECT_PRECISION,
} from "../../../utils";

import api from "../../../services/api";

export default ({ filter }) => {
  const [youngsDomains, setYoungsDomains] = useState({});
  const [youngsPeriod, setYoungsPeriod] = useState({});
  const [youngsFormat, setYoungsFormat] = useState({});
  const [youngsProfessionnalProject, setYoungsProfessionnalProject] = useState({});
  const [youngsProfessionnalProjectPrecision, setYoungsProfessionnalProjectPrecision] = useState({});
  const [youngsEngaged, setYoungsEngaged] = useState({});

  const [missionsStatus, setMissionsStatus] = useState({});
  const [missionsDomains, setMissionsDomains] = useState({});
  const [missionsPeriod, setMissionsPeriod] = useState({});
  const [missionsFormat, setMissionsFormat] = useState({});
  const [missionPlaceTotal, setMissionPlaceTotal] = useState(0);
  const [missionPlaceLeft, setMissionPlaceLeft] = useState(0);

  const [mobilityNearSchool, setMobilityNearSchool] = useState({});
  const [mobilityNearRelative, setMobilityNearRelative] = useState({});
  const [mobilityNearHome, setMobilityNearHome] = useState({});
  const [mobilityTransport, setMobilityTransport] = useState({});

  useEffect(() => {
    async function initStatus() {
      const queries = [];
      queries.push({ index: "mission", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: {
          status: { terms: { field: "status.keyword" } },
          domains: { terms: { field: "domains.keyword" } },
          period: { terms: { field: "period.keyword" } },
          format: { terms: { field: "format.keyword" } },
          placesTotal: { sum: { field: "placesTotal" } },
          placesLeft: { sum: { field: "placesLeft" } },
        },
        size: 0,
      });

      queries.push({ index: "young", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: {
          domains: { terms: { field: "domains.keyword" } },
          period: { terms: { field: "period.keyword" } },
          format: { terms: { field: "missionFormat.keyword" } },
          professionnalProject: { terms: { field: "professionnalProject.keyword" } },
          professionnalProjectPrecision: { terms: { field: "professionnalProjectPrecision.keyword" } },
          mobilityNearSchool: { terms: { field: "mobilityNearSchool.keyword" } },
          mobilityNearHome: { terms: { field: "mobilityNearHome.keyword" } },
          mobilityNearRelative: { terms: { field: "mobilityNearRelative.keyword" } },
          mobilityTransport: { terms: { field: "mobilityTransport.keyword" } },
          engaged: { terms: { field: "engaged.keyword" } },
        },
        size: 0,
      });

      if (filter.region) queries[1].query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) queries[1].query.bool.filter.push({ term: { "department.keyword": filter.department } });
      if (filter.region) queries[3].query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) queries[3].query.bool.filter.push({ term: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery(queries);
      setMissionsStatus(responses[0].aggregations.status.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setMissionsDomains(responses[0].aggregations.domains.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setMissionsPeriod(responses[0].aggregations.period.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setMissionsFormat(responses[0].aggregations.format.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setMissionPlaceTotal(responses[0].aggregations.placesTotal.value);
      setMissionPlaceLeft(responses[0].aggregations.placesLeft.value);

      setMobilityNearSchool(responses[1].aggregations.mobilityNearSchool.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setMobilityNearHome(responses[1].aggregations.mobilityNearHome.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setMobilityNearRelative(responses[1].aggregations.mobilityNearRelative.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setYoungsDomains(responses[1].aggregations.domains.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setYoungsPeriod(responses[1].aggregations.period.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setYoungsProfessionnalProject(responses[1].aggregations.professionnalProject.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setYoungsEngaged(responses[1].aggregations.engaged.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setYoungsProfessionnalProjectPrecision(responses[1].aggregations.professionnalProjectPrecision.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setYoungsFormat(responses[1].aggregations.format.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
      setMobilityTransport(responses[1].aggregations.mobilityTransport.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
    }
    initStatus();
  }, [JSON.stringify(filter)]);

  const replaceSpaces = (v) => v.replace(/\s+/g, "+");

  const getLink = (link) => {
    if (filter.region) link += `&REGION=%5B"${replaceSpaces(filter.region)}"%5D`;
    if (filter.department) link += `&DEPARTMENT=%5B"${replaceSpaces(filter.department)}"%5D`;
    return link;
  };

  return (
    <React.Fragment>
      <ProposedPlaces getLink={getLink} missionPlaceLeft={missionPlaceLeft} missionPlaceTotal={missionPlaceTotal} />

      <Status getLink={getLink} data={missionsStatus} />
      <MissionDetail missionsDomains={missionsDomains} youngsDomains={youngsDomains} />
      <Period youngsPeriod={youngsPeriod} missionsPeriod={missionsPeriod} />
      <Format youngsFormat={youngsFormat} missionsFormat={missionsFormat} />
      <ProfessionalProject youngsProfessionnalProject={youngsProfessionnalProject} youngsProfessionnalProjectPrecision={youngsProfessionnalProjectPrecision} />
      <Mobility mobilityNearHome={mobilityNearHome} mobilityNearRelative={mobilityNearRelative} mobilityNearSchool={mobilityNearSchool} mobilityTransport={mobilityTransport} />
      <Volonteer youngsEngaged={youngsEngaged} />
    </React.Fragment>
  );
};

const ProposedPlaces = ({ missionPlaceLeft, missionPlaceTotal, getLink }) => {
  return (
    <React.Fragment>
      <Subtitle>Places proposées par les structures</Subtitle>
      <Row>
        <Col md={6} xl={4} key="total">
          <Link to={getLink(`/mission`)}>
            <Card borderBottomColor="#372F78">
              <CardTitle>Places totales</CardTitle>
              <CardValueWrapper>
                <CardValue>{missionPlaceTotal}</CardValue>
                {/* <CardPercentage>
                  100%
                  <CardArrow />
                </CardPercentage> */}
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={4} key="occupied">
          <Link to={getLink(`/mission`)}>
            <Card borderBottomColor="#FEB951">
              <CardTitle>Places occupées</CardTitle>
              <CardValueWrapper>
                <CardValue>{missionPlaceTotal - missionPlaceLeft}</CardValue>
                {/* <CardPercentage>
                  {`${missionPlaceTotal ? (((missionPlaceTotal - missionPlaceLeft) * 100) / missionPlaceTotal).toFixed(0) : `0`}%`}
                  <CardArrow />
                </CardPercentage> */}
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={4} key="available">
          <Link to={getLink(`/mission`)}>
            <Card borderBottomColor="#6BC763">
              <CardTitle>Places disponibles</CardTitle>
              <CardValueWrapper>
                <CardValue>{missionPlaceLeft}</CardValue>
                {/* <CardPercentage>
                  {`${missionPlaceTotal ? ((missionPlaceLeft * 100) / missionPlaceTotal).toFixed(0) : `0`}%`}
                  <CardArrow />
                </CardPercentage> */}
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
    </React.Fragment>
  );
};

const Status = ({ data, getLink }) => {
  const total = Object.keys(data).reduce((acc, a) => acc + data[a], 0);

  return (
    <React.Fragment>
      <Subtitle>Statut des missions proposées par les structures</Subtitle>
      <Row>
        {Object.values(MISSION_STATUS).map((l, k) => {
          return (
            <Col md={6} xl={3} key={k}>
              <Link to={getLink(`/mission?STATUS=%5B"${l}"%5D`)}>
                <Card borderBottomColor={MISSION_STATUS_COLORS[l]}>
                  <CardTitle>{translate(l)}</CardTitle>
                  <CardValueWrapper>
                    <CardValue>{data[l] || 0}</CardValue>
                    <CardPercentage>
                      {total ? `${(((data[l] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                      <CardArrow />
                    </CardPercentage>
                  </CardValueWrapper>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    </React.Fragment>
  );
};

const MissionDetail = ({ youngsDomains, missionsDomains, getLink }) => {
  const totalMissions = Object.keys(missionsDomains).reduce((acc, a) => acc + missionsDomains[a], 0);
  const totalYoungs = Object.keys(youngsDomains).reduce((acc, a) => acc + youngsDomains[a], 0);

  return (
    <React.Fragment>
      <Subtitle>Dans le détail des missions</Subtitle>
      <Box>
        <Row>
          <Col md={6} xl={6} key="1">
            <BoxTitle>Domaine d'action des missions validées</BoxTitle>
          </Col>
          <Col md={6} xl={6} key="2">
            <BoxTitle>Selon les préférences des volontaires</BoxTitle>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={6} xl={6} key="1">
            {Object.values(MISSION_DOMAINS).map((l, k) => {
              return (
                <CircularLine key={k}>
                  <CircularLineIndex>{`${k + 1}.`}</CircularLineIndex>
                  <CircularProgress
                    circleProgressColor="#1B7BBF"
                    percentage={((missionsDomains[l] * 100) / totalMissions).toFixed(1)}
                    title={translate(l)}
                    subtitle={`${missionsDomains[l] || 0} missions`}
                  />
                </CircularLine>
              );
            })}
          </Col>
          <Col md={6} xl={6} key="2">
            {Object.values(MISSION_DOMAINS).map((l, k) => {
              return (
                <CircularLine key={k}>
                  <CircularLineIndex>{`${k + 1}.`}</CircularLineIndex>
                  <CircularProgress
                    circleProgressColor="#1B7BBF"
                    percentage={((youngsDomains[l] * 100) / totalYoungs).toFixed(1)}
                    title={translate(l)}
                    subtitle={`D'après ${youngsDomains[l] || 0} volontaires`}
                  />
                </CircularLine>
              );
            })}
          </Col>
        </Row>
      </Box>
    </React.Fragment>
  );
};

const Period = ({ youngsPeriod, missionsPeriod }) => {
  const totalMissions = Object.keys(missionsPeriod).reduce((acc, a) => acc + missionsPeriod[a], 0);
  const totalYoungs = Object.keys(youngsPeriod).reduce((acc, a) => acc + youngsPeriod[a], 0);

  return (
    <React.Fragment>
      <Box>
        <Row>
          <Col md={6} xl={6} key="1">
            <BoxTitle>Période pour réaliser la mission</BoxTitle>
          </Col>
          <Col md={6} xl={6} key="2">
            <BoxTitle>Selon les préférences des volontaires</BoxTitle>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={6} xl={6} key="1">
            {Object.values(PERIOD).map((l, k) => {
              return (
                <CircularLine key={k}>
                  <CircularLineIndex>{`${k + 1}.`}</CircularLineIndex>
                  <CircularProgress
                    circleProgressColor="#1B7BBF"
                    percentage={((missionsPeriod[l] * 100) / totalMissions).toFixed(1)}
                    title={translate(l)}
                    subtitle={`${missionsPeriod[l] || 0} missions`}
                  />
                </CircularLine>
              );
            })}
          </Col>
          <Col md={6} xl={6} key="2">
            {Object.values(PERIOD).map((l, k) => {
              return (
                <CircularLine key={k}>
                  <CircularLineIndex>{`${k + 1}.`}</CircularLineIndex>
                  <CircularProgress
                    circleProgressColor="#1B7BBF"
                    percentage={((youngsPeriod[l] * 100) / totalYoungs).toFixed(1)}
                    title={translate(l)}
                    subtitle={`D'après ${youngsPeriod[l] || 0} volontaires`}
                  />
                </CircularLine>
              );
            })}
          </Col>
        </Row>
      </Box>
    </React.Fragment>
  );
};

const ProfessionalProject = ({ youngsProfessionnalProjectPrecision, youngsProfessionnalProject }) => {
  const total1 = Object.keys(youngsProfessionnalProject).reduce((acc, a) => acc + youngsProfessionnalProject[a], 0);
  const total2 = Object.keys(youngsProfessionnalProjectPrecision).reduce((acc, a) => acc + youngsProfessionnalProjectPrecision[a], 0);

  return (
    <React.Fragment>
      <Box>
        <Row>
          <Col md={12} xl={12} key="1">
            <BoxTitle>Projet professionel selon les préférences des volontaires</BoxTitle>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={12} xl={12} key="1">
            {Object.values(PROFESSIONNAL_PROJECT).map((l, k) => {
              if (l !== "OTHER")
                return (
                  <CircularLine key={k}>
                    <CircularLineIndex>{`${k + 1}.`}</CircularLineIndex>
                    <CircularProgress
                      circleProgressColor="#1B7BBF"
                      percentage={((youngsProfessionnalProject[l] * 100) / total1).toFixed(1)}
                      title={translate(l)}
                      subtitle={`D'après ${youngsProfessionnalProject[l] || 0} volontaires`}
                    />
                  </CircularLine>
                );
              return (
                <Row key={k}>
                  <Col md={4}>
                    <CircularLine>
                      <CircularLineIndex>{`${k + 1}.`}</CircularLineIndex>
                      <CircularProgress
                        circleProgressColor="#1B7BBF"
                        percentage={((youngsProfessionnalProject[l] * 100) / total1).toFixed(1)}
                        title={translate(l)}
                        subtitle={`D'après ${youngsProfessionnalProject[l] || 0} volontaires`}
                      />
                    </CircularLine>
                  </Col>
                  <div style={{ border: "1px solid #F2F1F1" }} />
                  {Object.values(PROFESSIONNAL_PROJECT_PRECISION).map((m, i) => {
                    return (
                      <Col md={2} key={i}>
                        <CircularLine>
                          <CircularProgress
                            circleProgressColor="#1B7BBF"
                            percentage={((youngsProfessionnalProjectPrecision[m] * 100) / total2).toFixed(1)}
                            title={translate(m)}
                            subtitle={`D'après ${youngsProfessionnalProjectPrecision[m] || 0} volontaires`}
                          />
                        </CircularLine>
                      </Col>
                    );
                  })}
                </Row>
              );
            })}
          </Col>
        </Row>
      </Box>
    </React.Fragment>
  );
};

const Format = ({ youngsFormat, missionsFormat }) => {
  const totalMissions = Object.keys(missionsFormat).reduce((acc, a) => acc + missionsFormat[a], 0);
  const totalYoungs = Object.keys(youngsFormat).reduce((acc, a) => acc + youngsFormat[a], 0);

  return (
    <React.Fragment>
      <Box>
        <Row>
          <Col md={6} xl={6} key="1">
            <BoxTitle>Format de la mission</BoxTitle>
          </Col>
          <Col md={6} xl={6} key="2">
            <BoxTitle>Selon les préférences des volontaires</BoxTitle>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={6} xl={6} key="1">
            {Object.values(FORMAT).map((l, k) => {
              return (
                <CircularLine key={k}>
                  <CircularLineIndex>{`${k + 1}.`}</CircularLineIndex>
                  <CircularProgress
                    circleProgressColor="#1B7BBF"
                    percentage={((missionsFormat[l] * 100) / totalMissions).toFixed(1)}
                    title={translate(l)}
                    subtitle={`${missionsFormat[l] || 0} missions`}
                  />
                </CircularLine>
              );
            })}
          </Col>
          <Col md={6} xl={6} key="2">
            {Object.values(FORMAT).map((l, k) => {
              return (
                <CircularLine key={k}>
                  <CircularLineIndex>{`${k}.`}</CircularLineIndex>
                  <CircularProgress
                    circleProgressColor="#1B7BBF"
                    percentage={((youngsFormat[l] * 100) / totalYoungs).toFixed(1)}
                    title={translate(l)}
                    subtitle={`D'après ${youngsFormat[l] || 0} volontaires`}
                  />
                </CircularLine>
              );
            })}
          </Col>
        </Row>
      </Box>
    </React.Fragment>
  );
};

const Mobility = ({ mobilityNearHome, mobilityNearRelative, mobilityNearSchool, mobilityTransport }) => {
  const totalNearHome = Object.keys(mobilityNearHome).reduce((acc, a) => acc + mobilityNearHome[a], 0);
  const totalNearRelative = Object.keys(mobilityNearRelative).reduce((acc, a) => acc + mobilityNearRelative[a], 0);
  const totalNearSchool = Object.keys(mobilityNearSchool).reduce((acc, a) => acc + mobilityNearSchool[a], 0);
  const totalMobilityTransport = Object.keys(mobilityTransport).reduce((acc, a) => acc + mobilityTransport[a], 0);

  return (
    <React.Fragment>
      <Box>
        <Row>
          <Col md={6} xl={6} key="1">
            <BoxTitle>Mobilités géographiques selon les préférences des volontaires</BoxTitle>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={6} xl={6} key="1">
            <div>Mission à proximité de </div>
            <CircularLine>
              <CircularLineIndex>{`1.`}</CircularLineIndex>
              <CircularProgress
                circleProgressColor="#1B7BBF"
                percentage={((mobilityNearHome["true"] * 100) / totalNearHome).toFixed(1)}
                title="Leurs domiciles"
                subtitle={`D'après ${totalNearHome || 0} volontaires`}
              />
            </CircularLine>
            <CircularLine>
              <CircularLineIndex>{`2.`}</CircularLineIndex>
              <CircularProgress
                circleProgressColor="#1B7BBF"
                percentage={((mobilityNearSchool["true"] * 100) / totalNearSchool).toFixed(1)}
                title="Leurs établissements"
                subtitle={`D'après ${totalNearSchool || 0} volontaires`}
              />
            </CircularLine>
            <CircularLine>
              <CircularLineIndex>{`3.`}</CircularLineIndex>
              <CircularProgress
                circleProgressColor="#1B7BBF"
                percentage={((mobilityNearRelative["true"] * 100) / totalNearRelative).toFixed(1)}
                title="Hébergement chez un proche"
                subtitle={`D'après ${totalNearRelative || 0} volontaires`}
              />
            </CircularLine>
          </Col>
          <Col md={6} xl={6} key="2">
            <div>Moyen(s) de transport privilégié</div>
            {Object.values(TRANSPORT).map((l, k) => {
              return (
                <CircularLine key={k}>
                  <CircularLineIndex>{`${k + 1}.`}</CircularLineIndex>
                  <CircularProgress
                    circleProgressColor="#1B7BBF"
                    percentage={((mobilityTransport[l] * 100) / totalMobilityTransport).toFixed(1)}
                    title={translate(l)}
                    subtitle={`D'après ${mobilityTransport[l] || 0} volontaires`}
                  />
                </CircularLine>
              );
            })}
          </Col>
        </Row>
      </Box>
    </React.Fragment>
  );
};

const Volonteer = ({ youngsEngaged }) => {
  const total = Object.keys(youngsEngaged).reduce((acc, a) => acc + youngsEngaged[a], 0);

  return (
    <React.Fragment>
      <Box>
        <Row>
          <Col md={12} xl={12} key="1">
            <BoxTitle>Engagement parallèle comme bénévole selon les préférences des volontaires</BoxTitle>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={6} xl={6} key="1">
            <CircularLine>
              <CircularLineIndex>{`1.`}</CircularLineIndex>
              <CircularProgress
                circleProgressColor="#1B7BBF"
                percentage={(((youngsEngaged["false"] || 0) * 100) / total).toFixed(1)}
                title="Non"
                subtitle={`D'après ${total} volontaires`}
              />
            </CircularLine>
          </Col>
          <Col md={6} xl={6} key="2">
            <CircularLine>
              <CircularLineIndex>{`2.`}</CircularLineIndex>
              <CircularProgress
                circleProgressColor="#1B7BBF"
                percentage={(((youngsEngaged["true"] || 0) * 100) / total).toFixed(1)}
                title="Oui"
                subtitle={`D'après ${total} volontaires`}
              />
            </CircularLine>
          </Col>
        </Row>
      </Box>
    </React.Fragment>
  );
};

const CircularLine = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
`;
const CircularLineIndex = styled.div`
  margin-right: 30px;
  color: #9a9a9a;
  font-size: 16px;
`;
const Box = styled.div`
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  margin-bottom: 33px;
  border-radius: 8px;
  padding: 30px;
`;

const BoxTitle = styled.h2`
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 18px;
  letter-spacing: 0.1px;

  color: #171725;
`;

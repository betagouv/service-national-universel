import React from "react";
import { Col, Row } from "reactstrap";
import CircularProgress, { CircularLine, CircularLineIndex } from "../components/CircularProgress";
import { Subtitle } from "../../../components/dashboard";
import { translate, MISSION_DOMAINS } from "../../../utils";
import { Box, BoxTitleCircular as BoxTitle } from "../../../components/box";

export default function MissionDetail({ youngsDomains, missionsDomains }) {
  const totalMissions = Object.keys(missionsDomains).reduce((acc, a) => acc + missionsDomains[a], 0);
  const totalYoungs = Object.keys(youngsDomains).reduce((acc, a) => acc + youngsDomains[a], 0);

  return (
    <React.Fragment>
      <Subtitle>Dans le détail des missions</Subtitle>
      <Box>
        <Row>
          <Col md={6} xl={6} key="1">
            <BoxTitle>Domaine d&apos;action des missions validées</BoxTitle>
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
}

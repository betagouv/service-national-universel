import React from "react";
import { Col, Row } from "reactstrap";
import CircularProgress, { CircularLine, CircularLineIndex } from "../components/CircularProgress";
import { translate, PERIOD } from "../../../utils";
import { Box, BoxTitleCircular as BoxTitle } from "../../../components/box";

export default function Period({ youngsPeriod, missionsPeriod }) {
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
}

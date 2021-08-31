import React from "react";
import { Col, Row } from "reactstrap";
import CircularProgress, { CircularLine, CircularLineIndex } from "../components/CircularProgress";
import { translate, FORMAT } from "../../../utils";
import { Box, BoxTitleCircular as BoxTitle } from "../../../components/box";

export default ({ youngsFormat, missionsFormat }) => {
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

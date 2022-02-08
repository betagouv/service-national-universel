import React from "react";
import { Col, Row } from "reactstrap";
import CircularProgress, { CircularLine, CircularLineIndex } from "../components/CircularProgress";
import { Box, BoxTitleCircular as BoxTitle } from "../../../components/box";

export default function Volunteer({ youngsEngaged }) {
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
}

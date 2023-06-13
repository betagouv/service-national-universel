import React from "react";
import { Col, Row } from "reactstrap";
import CircularProgress, { CircularLine, CircularLineIndex } from "../components/CircularProgress";
import { translate, TRANSPORT } from "../../../utils";
import { Box, BoxTitleCircular as BoxTitle } from "../../../components/box";

export default function Mobility({ mobilityNearHome, mobilityNearRelative, mobilityNearSchool, mobilityTransport }) {
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
}

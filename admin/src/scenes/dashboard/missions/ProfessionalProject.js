import React from "react";
import { Col, Row } from "reactstrap";
import CircularProgress, { CircularLine, CircularLineIndex } from "../components/CircularProgress";
import { translate, PROFESSIONNAL_PROJECT, PROFESSIONNAL_PROJECT_PRECISION } from "../../../utils";
import { Box, BoxTitleCircular as BoxTitle } from "../../../components/box";

export default ({ youngsProfessionnalProjectPrecision, youngsProfessionnalProject }) => {
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

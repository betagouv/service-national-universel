import React from "react";
import { Link } from "react-router-dom";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { translate, formatStringDate } from "../../../utils";
import MissionView from "./wrapper";
import { Box } from "../../../components/box";

export default ({ mission, structure, tutor }) => {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <MissionView mission={mission} tab="details">
        <Box>
          <Row>
            <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
              <Wrapper>
                <Legend>
                  La mission<Subtitle>{translate(mission.format)}</Subtitle>
                </Legend>

                <div className="detail">
                  <div className="detail-title">Domaines</div>
                  <div className="detail-text">{mission.domains.map((d) => translate(d)).join(", ")}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Début</div>
                  <div className="detail-text">{formatStringDate(mission.startAt)}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Fin</div>
                  <div className="detail-text">{formatStringDate(mission.endAt)}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Adresse</div>
                  <div className="detail-text">{mission.address}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Dép.</div>
                  <div className="detail-text">{mission.department}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Format</div>
                  <div className="detail-text">{translate(mission.format)}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Fréquence</div>
                  <div className="detail-text">{mission.frequence}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Périodes</div>
                  <div className="detail-text">{mission.period.map((p) => translate(p)).join(", ")}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Objectifs</div>
                  <div className="detail-text">{mission.description}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Actions</div>
                  <div className="detail-text">{mission.actions}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Contraintes</div>
                  <div className="detail-text">{mission.contraintes}</div>
                </div>
              </Wrapper>
            </Col>
            <Col md={6}>
              <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
                {tutor ? (
                  <Wrapper>
                    <Legend>
                      Le tuteur
                      <Link to={`/user/${tutor._id}`}>
                        <SubtitleLink>{`${tutor.firstName} ${tutor.lastName} >`}</SubtitleLink>
                      </Link>
                    </Legend>
                    <div className="detail">
                      <div className="detail-title">E-mail</div>
                      <div className="detail-text">{tutor.email}</div>
                    </div>
                    <div className="detail">
                      <div className="detail-title">Tel. fixe</div>
                      <div className="detail-text">{tutor.phone}</div>
                    </div>
                    <div className="detail">
                      <div className="detail-title">Tel. mobile</div>
                      <div className="detail-text">{mission.mobile}</div>
                    </div>
                  </Wrapper>
                ) : null}
              </Row>
              <Row>
                {structure ? (
                  <Wrapper>
                    <Legend>
                      Le structure
                      <Link to={`/structure/${structure._id}`}>
                        <SubtitleLink>{`${structure.name} >`}</SubtitleLink>
                      </Link>
                    </Legend>
                    <div className="detail">
                      <div className="detail-title">Statut</div>
                      <div className="detail-text">{translate(structure.legalStatus)}</div>
                    </div>
                    <div className="detail">
                      <div className="detail-title">Région</div>
                      <div className="detail-text">{structure.region}</div>
                    </div>
                    <div className="detail">
                      <div className="detail-title">Dép.</div>
                      <div className="detail-text">{structure.department}</div>
                    </div>
                    <div className="detail">
                      <div className="detail-title">Ville</div>
                      <div className="detail-text">{structure.city}</div>
                    </div>
                    <div className="detail">
                      <div className="detail-title">Adresse</div>
                      <div className="detail-text">{structure.address}</div>
                    </div>
                    <div className="detail">
                      <div className="detail-title">Présentation</div>
                      <div className="detail-text">{structure.description}</div>
                    </div>
                  </Wrapper>
                ) : null}
              </Row>
            </Col>
          </Row>
        </Box>
      </MissionView>
    </div>
  );
};

const Wrapper = styled.div`
  padding: 3rem;
  .detail {
    display: flex;
    align-items: flex-start;
    font-size: 1rem;
    text-align: left;
    margin-top: 1rem;
    &-title {
      min-width: 90px;
      width: 90px;
      margin-right: 1rem;
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
    }
  }
`;

const Subtitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 300;
  font-size: 1rem;
`;

const SubtitleLink = styled(Subtitle)`
  color: #5245cc;
`;

const Legend = styled.div`
  color: rgb(38, 42, 62);
  margin-bottom: 20px;
  font-size: 1.3rem;
  font-weight: 500;
`;

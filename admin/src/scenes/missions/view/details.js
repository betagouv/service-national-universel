import React from "react";
import { Link } from "react-router-dom";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";

import { translate, formatStringDateTimezoneUTC, ROLES } from "../../../utils";
import MissionView from "./wrapper";
import { Box, BoxTitle } from "../../../components/box";

export default ({ mission, structure, tutor }) => {
  const user = useSelector((state) => state.Auth.user);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <MissionView mission={mission} tab="details">
        <Box>
          <Row>
            <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
              <Wrapper>
                <BoxTitle>
                  La mission<Subtitle>{translate(mission.format)}</Subtitle>
                </BoxTitle>

                <div className="detail">
                  <div className="detail-title">Domaines</div>
                  <div className="detail-text">{mission.domains.map((d) => translate(d)).join(", ")}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Début</div>
                  <div className="detail-text">{formatStringDateTimezoneUTC(mission.startAt)}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Fin</div>
                  <div className="detail-text">{formatStringDateTimezoneUTC(mission.endAt)}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Adresse</div>
                  <div className="detail-text">{mission.address}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Ville</div>
                  <div className="detail-text">{mission.city}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Code postal</div>
                  <div className="detail-text">{mission.zip}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Dép.</div>
                  <div className="detail-text">{mission.department}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Région</div>
                  <div className="detail-text">{mission.region}</div>
                </div>
                {user.role === ROLES.ADMIN ? (
                  <div className="detail">
                    <div className="detail-title">GPS</div>
                    <div className="detail-text">
                      {mission.location.lat} , {mission.location.lon}
                    </div>
                  </div>
                ) : null}
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
                    <BoxTitle>
                      Le tuteur
                      <Link to={`/user/${tutor._id}`}>
                        <SubtitleLink>{`${tutor.firstName} ${tutor.lastName} >`}</SubtitleLink>
                      </Link>
                    </BoxTitle>
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
                    <BoxTitle>
                      Le structure
                      <Link to={`/structure/${structure._id}`}>
                        <SubtitleLink>{`${structure.name} >`}</SubtitleLink>
                      </Link>
                    </BoxTitle>
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
  flex: 1;
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
      white-space: pre-line;
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
  :hover {
    text-decoration: underline;
  }
`;

import React from "react";
import { Link } from "react-router-dom";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";

import { translate, formatStringDateTimezoneUTC, ROLES, copyToClipboard, MISSION_STATUS, colors } from "../../../utils";
import MissionView from "./wrapper";
import { Box, BoxTitle } from "../../../components/box";
import TickDone from "../../../assets/TickDone";
import Copy from "../../../assets/Copy";

const rowStyle = { marginRight: 0, marginLeft: 0 };

export default function DetailsView({ mission, structure, tutor }) {
  const user = useSelector((state) => state.Auth.user);
  const domains = mission?.domains?.filter((d) => {
    return d !== mission.mainDomain;
  });

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <MissionView mission={mission} tab="details">
        <Box>
          <Row style={rowStyle}>
            <Col md={6} style={{ borderRight: "2px solid #f4f5f7", padding: 0 }}>
              <Bloc title="La mission">
                <Details title="Format" value={translate(mission.format)} />
                {mission.mainDomain ? <Details title="Domaine principal" value={translate(mission.mainDomain)} /> : null}
                {mission.domains ? <Details title="Domaine(s)" value={domains.map((d) => translate(d)).join(", ")} /> : null}
                <Details title="Début" value={formatStringDateTimezoneUTC(mission.startAt)} />
                <Details title="Fin" value={formatStringDateTimezoneUTC(mission.endAt)} />
                {mission.duration ? <Details title="Durée" value={`${mission.duration} heure(s)`} /> : null}
                <Details title="Adresse" value={mission.address} />
                <Details title="Ville" value={mission.city} />
                <Details title="Code postal" value={mission.zip} />
                <Details title="Dép." value={mission.department} />
                <Details title="Région" value={mission.region} />
                {user.role === ROLES.ADMIN && mission.location?.lat && mission.location?.lon ? (
                  <Details title="GPS" value={`${mission.location?.lat} , ${mission.location?.lon}`} copy />
                ) : null}
                <Details title="Format" value={translate(mission.format)} />
                <Details title="Fréquence" value={mission.frequence} />
                <Details title="Périodes" value={mission.period.map((p) => translate(p)).join(", ")} />
                <Details title="Objectifs" value={mission.description} />
                <Details title="Actions" value={mission.actions} />
                <Details title="Contraintes" value={mission.contraintes} />
              </Bloc>
            </Col>
            <Col md={6} style={{ padding: 0 }}>
              <Row style={{ borderBottom: "2px solid #f4f5f7", ...rowStyle }}>
                {tutor ? (
                  <Bloc
                    title="Le tuteur"
                    titleRight={
                      <Link to={`/user/${tutor._id}`}>
                        <SubtitleLink>{`${tutor.firstName} ${tutor.lastName} >`}</SubtitleLink>
                      </Link>
                    }>
                    <Details title="E-mail" value={tutor.email} copy />
                    <Details title="Tel. fixe" value={tutor.phone} copy />
                    <Details title="Tel. mobile" value={mission.mobile} copy />
                  </Bloc>
                ) : null}
              </Row>
              <Row style={{ borderBottom: "2px solid #f4f5f7", ...rowStyle }}>
                {structure ? (
                  <Bloc
                    title="La structure"
                    titleRight={
                      <Link to={`/structure/${structure._id}`}>
                        <SubtitleLink>{`${structure.name} >`}</SubtitleLink>
                      </Link>
                    }>
                    <Details title="Statut Légal" value={translate(structure.legalStatus)} />
                    <Details title="Région" value={structure.region} />
                    <Details title="Dép." value={structure.department} />
                    <Details title="Ville" value={structure.city} />
                    <Details title="Adresse" value={structure.address} />
                    <Details title="Présentation" value={structure.description} />
                  </Bloc>
                ) : null}
              </Row>
              {[MISSION_STATUS.ARCHIVED, MISSION_STATUS.CANCEL]?.includes(mission.status) && mission.statusComment ? (
                <Row style={rowStyle}>
                  <Bloc title={mission.status === MISSION_STATUS.ARCHIVED ? "Archivage" : mission.status === MISSION_STATUS.CANCEL ? "Annulation" : ""}>
                    <Details title="Motif" value={mission.statusComment} />
                  </Bloc>
                </Row>
              ) : null}
            </Col>
          </Row>
        </Box>
      </MissionView>
    </div>
  );
}

const Bloc = ({ children, title, titleRight, borderBottom, borderRight, borderTop, disabled }) => {
  return (
    <Row
      style={{
        width: "100%",
        borderTop: borderTop ? "2px solid #f4f5f7" : 0,
        borderBottom: borderBottom ? "2px solid #f4f5f7" : 0,
        borderRight: borderRight ? "2px solid #f4f5f7" : 0,
        backgroundColor: disabled ? "#f9f9f9" : "transparent",
        padding: 0,
        ...rowStyle,
      }}>
      <Wrapper
        style={{
          width: "100%",
        }}>
        <div style={{ display: "flex", width: "100%" }}>
          <BoxTitle>
            <div>{title}</div>
            <div>{titleRight}</div>
          </BoxTitle>
        </div>
        {children}
      </Wrapper>
    </Row>
  );
};

const Details = ({ title, value, copy }) => {
  if (!value) return <div />;
  const [copied, setCopied] = React.useState(false);
  if (typeof value === "function") value = value();
  React.useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 3000);
    }
  }, [copied]);
  return (
    <div className="detail">
      <div className="detail-title">{`${title} :`}</div>
      <div className="detail-text">
        {value}
        {copy ? (
          <div
            className="icon"
            onClick={() => {
              copyToClipboard(value);
              setCopied(true);
            }}>
            {copied ? <TickDone color={colors.green} width={17} height={17} /> : <Copy color={colors.darkPurple} width={17} height={17} />}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Wrapper = styled.div`
  padding: 2rem;
  flex: 1;
  .detail {
    border-bottom: 0.5px solid rgba(244, 245, 247, 0.5);
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    margin-top: 1rem;
    padding-bottom: 0.5rem;
    &-title {
      min-width: 120px;
      width: 90px;
      margin-right: 1rem;
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
      display: flex;
      white-space: pre-line;
    }
  }
  .icon {
    cursor: pointer;
    margin: 0 0.5rem;
  }
`;

const Subtitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 300;
  font-size: 1rem;
`;

const SubtitleLink = styled(Subtitle)`
  color: #5245cc;
  max-width: 200px;
  :hover {
    text-decoration: underline;
  }
`;

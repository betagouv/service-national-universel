import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import styled from "styled-components";
import { Col, Row, Input } from "reactstrap";

import MissionCard from "./components/missionCard";
import api from "../../services/api";
import { translate, formatStringDate } from "../../utils";
import SocialIcons from "../../components/SocialIcons";
import ApplyModal from "./components/ApplyModal";
import ApplyDoneModal from "./components/ApplyDoneModal";

export default (props) => {
  const [mission, setMission] = useState();
  const [modal, setModal] = useState(null);
  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return setMission(null);
      const { data } = await api.get(`/mission/${id}`);
      return setMission(data);
    })();
  }, []);

  const getTags = () => {
    const tags = [];
    mission.city && tags.push(mission.city + (mission.zip ? ` - ${mission.zip}` : ""));
    // tags.push(mission.remote ? "À distance" : "En présentiel");
    mission.domains.forEach((d) => tags.push(d));
    return tags;
  };

  if (mission === undefined) return <div>Chargement...</div>;

  return (
    <Container>
      {modal === "APPLY" && (
        <ApplyModal
          value={mission}
          onChange={() => setModal(null)}
          onSend={() => {
            console.log("send");
            setModal("DONE");
          }}
        />
      )}
      {modal === "DONE" && (
        <ApplyDoneModal
          value={mission}
          onChange={() => setModal(null)}
          onSend={() => {
            console.log("send");
            setModal(null);
          }}
        />
      )}
      <Heading>
        <div>
          <p className="title">mission</p>
          <h1>{mission.name}</h1>
          <Tags>
            {getTags().map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </Tags>
        </div>
        <div>
          <Button onClick={() => setModal("APPLY")}>Candidater</Button>
          <p className="button-subtitle">{`${mission.placesTotal} bénévole${mission.placesTotal > 1 ? "s" : ""} recherché${mission.placesTotal > 1 ? "s" : ""}`}</p>
        </div>
      </Heading>
      <Box>
        <Row>
          <Col md={12} style={{ borderBottom: "2px solid #f4f5f7" }}>
            <HeadCard>
              <div className="thumb">
                <img src={require("../../assets/observe.svg")} />
              </div>
              <p>
                Au sein de l'association <span>{mission.structureName}</span>
              </p>
              <SocialIcons structure={mission.structureId} />
            </HeadCard>
          </Col>
        </Row>
        <Row>
          <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
            <Wrapper>
              <Legend>La mission en quelques mots</Legend>
              <Detail title="Objectifs" content={mission.description} />
              <Detail title="Actions" content={mission.actions} />
              <Detail title="Contraintes" content={mission.contraintes} />
              <InfoStructure title="à propos de la structure" structure={mission.structureId} />
            </Wrapper>
          </Col>
          <Col md={6}>
            <Wrapper>
              <Legend>{mission.startAt && mission.endAt ? `Du ${formatStringDate(mission.startAt)} au ${formatStringDate(mission.endAt)}` : "Aucune date renseignée"}</Legend>
              <Detail title="Fréquence" content={mission.frequence} />
              <Detail title="Période pour réaliser la mission" content={mission.period} />
              <Detail title="Lieu" content={[mission.address, mission.zip, mission.city, mission.department]} />
            </Wrapper>
          </Col>
        </Row>
      </Box>
      <Footer>
        <Button onClick={() => setModal("APPLY")}>Proposer votre candidature</Button>
      </Footer>
      {/* <Wrapper>
        <LeftBox style={{ padding: "50px 40px" }}>
          <div className="heading">
            <p>MISSION</p>
            <h2>Connaissance du fonctionnement d'une Association de bénévoles</h2>
          </div>
          <div className="title">
            <span>DOMAINE D'ACTION</span>
          </div>
          <div style={{ marginBottom: 60 }}>
            <div className="domain">Citoyenneté</div>
          </div>
          <div className="title">
            <span>DESCRIPTIF DE LA MISSION</span>
          </div>
          <div className="text" style={{ marginBottom: 60 }}>
            Connaître le fonctionnement d'une association de bénévoles Accompagner les bénévoles et en partager avec eux la réalisation de leurs actions en faveur des jeunes :
            rencontres avec enseignants ou responsables d'entreprises, interventions devant des jeunes, participation aux visites, debriefing des actions, …
          </div>
          <div className="title">
            <span>CONTRAINTES</span>
          </div>
          <div className="text">Être disponible pour participer aux actions en journée (pour les actions vers les jeunes) ou en soirée (pour les réunions de bénévoles)</div>
        </LeftBox>
        <RightBox>
          <div className="title">Candidatez à cette mission</div>
          <div className="subtitle">LA STRUCTURE RECHERCHE</div>
          <div className="tag">7 volontaires</div>
          <div className="date">
            Du <strong>7 octobre 2019</strong>
          </div>
          <div className="date">
            au <strong>26 juin 2020</strong>
          </div>
          <Link to="" className="button">
            Proposer votre aide
          </Link>
          <div className="text">Vous serez mis en relation avec la structure</div>
        </RightBox>
      </Wrapper>
      <Others>
        <div className="title">AUTRES MISSIONS DISPONIBLES DANS LE DÉPARTEMENT</div>
        <MissionCard
          title={"Défense et sécurité"}
          image={require("../../assets/observe.svg")}
          subtitle={"J'assiste les policiers dans leurs missions de médiations et gestions des conflits"}
          location={"Noisy-le-Grand (93) - Commissariat de Police"}
          places={7}
        />
        <MissionCard
          title={"Défense et sécurité"}
          image={require("../../assets/observe.svg")}
          subtitle={"J'assiste les policiers dans leurs missions de médiations et gestions des conflits"}
          location={"Noisy-le-Grand (93) - Commissariat de Police"}
          places={7}
        />
        <MissionCard
          title={"Défense et sécurité"}
          image={require("../../assets/observe.svg")}
          subtitle={"J'assiste les policiers dans leurs missions de médiations et gestions des conflits"}
          location={"Noisy-le-Grand (93) - Commissariat de Police"}
          places={7}
        />
      </Others>*/}
    </Container>
  );
};

const Detail = ({ title, content }) => {
  const [value] = useState((Array.isArray(content) && content) || [content]);
  return content && content.length ? (
    <div className="detail">
      <div className="detail-title">{title}</div>
      {value.map((e, i) => (
        <div key={i} className="detail-text">
          {translate(e)}
        </div>
      ))}
    </div>
  ) : (
    <div />
  );
};

const InfoStructure = ({ title, structure }) => {
  const [value, setValue] = useState();
  const [expandNote, setExpandNote] = useState(false);
  useEffect(() => {
    (async () => {
      const { ok, data, code } = await api.get(`/structure/${structure}`);
      if (!ok) toastr.error("Oups, une erreur est survenue lors de la récuperation de la structure", translate(code));
      else setValue(data.description);
      return;
    })();
  }, []);
  if (!value) return <div />;

  const preview = value.substring(0, 200);
  const rest = value.substring(200);

  const toggleNote = () => {
    setExpandNote(!expandNote);
  };

  return value ? (
    <div className="detail">
      <div className="detail-title">{title}</div>
      <div className="detail-text">
        {rest ? (
          <>
            {preview + (expandNote ? rest : " ...")}{" "}
            <div className="see-more" onClick={toggleNote}>
              {expandNote ? "  VOIR MOINS" : "  VOIR PLUS"}
            </div>
          </>
        ) : (
          preview
        )}
      </div>
    </div>
  ) : (
    <div />
  );
};

const Footer = styled.div`
  display: flex;
  justify-content: center;
`;

const Legend = styled.div`
  color: rgb(38, 42, 62);
  margin-bottom: 20px;
  font-size: 1.3rem;
  font-weight: 500;
`;
const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  height: 100%;
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  margin-bottom: 33px;
  border-radius: 8px;
`;

const Button = styled.div`
  cursor: pointer;
  background-color: #31c48d;
  border-radius: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  color: #fff;
  font-size: 1rem;
  padding: 0.8rem 3rem;
  :hover {
    color: #fff;
    background-color: #0e9f6e;
  }
`;

const Heading = styled(Container)`
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  h1 {
    color: #161e2e;
    font-size: 3rem;
    font-weight: 700;
  }
  p {
    &.title {
      color: #42389d;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    &.button-subtitle {
      margin-top: 1rem;
      text-align: center;
      color: #6b7280;
      font-size: 0.75rem;
    }
  }
`;

const Tags = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.8rem;
  div {
    text-transform: uppercase;
    background-color: white;
    color: #6b7280;
    border: 1px solid #e5e7eb;
    border-radius: 30px;
    padding: 5px 15px;
    margin-right: 15px;
    font-size: 12px;
    font-weight: 500;
  }
`;

const Wrapper = styled.div`
  padding: 3rem;
  .detail {
    font-size: 1rem;
    text-align: left;
    margin-top: 2rem;
    &-title {
      font-size: 0.8rem;
      margin-right: 1rem;
      color: #798399;
      text-transform: uppercase;
    }
    &-text {
      color: #242526;
    }
    .see-more {
      font-style: normal;
      color: #696974;
      margin-bottom: 0.8rem;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      text-decoration: underline;
      :hover {
        color: #5145cd;
      }
    }
  }
`;

const HeadCard = styled.div`
  display: flex;
  padding: 0 1.5rem;
  align-items: center;
  height: 4rem;
  .thumb {
    transform: translateY(-20%);
    margin: 0 1rem;
    background-color: #42389d;
    height: 4.5rem;
    width: 4.5rem;
    border-radius: 0.5rem;
    padding: 10px;
    text-align: center;
    img {
      border-radius: 6px;
      max-width: 100%;
      height: 100%;
      object-fit: cover;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
  }
  p {
    margin: 0;
    color: #929292;
    span {
      color: #242526;
      font-weight: 600;
    }
  }
  .social-link {
    color: #aaa;
    border: solid 1px #aaa;
    padding: 5px 7px 7px 7px;
    margin: 5px;
    border-radius: 5px;
    :hover {
      color: #5145cd;
    }
  }
  .social-icons-container {
    margin-left: auto;
  }
`;

const LeftBox = styled.div`
  flex: 2;
  .heading {
    margin-bottom: 30px;
    h2 {
      color: #161e2e;
      font-size: 36px;
      font-weight: 700;
    }
    p {
      text-transform: uppercase;
      color: #42389d;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 5px;
    }
  }
  .title {
    position: relative;
    margin-bottom: 25px;
    ::after {
      content: "";
      display: block;
      border-top: 2px solid #e5e7eb;
      width: 100%;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 0;
      z-index: 1;
    }
    span {
      background-color: #fff;
      color: #374151;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.04em;
      padding: 5px 15px 5px 0;
      position: relative;
      z-index: 2;
    }
  }
  .text {
    color: rgb(107, 114, 128);
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 0.02em;
    padding-right: 20px;
  }

  .domain {
    color: rgb(55, 65, 81);
    background: url(${require("../../assets/tick.svg")}) left center no-repeat;
    background-size: 22px;
    font-weight: 400;
    letter-spacing: 0.02em;
    padding-left: 40px;
    margin-bottom: 10px;
  }
`;

const RightBox = styled.div`
  flex: 1;
  min-width: 310px;
  border-radius: 0 12px 12px 0;
  background-color: #f9fafb;
  padding: 80px 10px;
  border-left: 1px solid #e5e7eb;
  text-align: center;
  .title {
    font-size: 30px;
    color: #161e2e;
    font-weight: 700;
    margin-bottom: 25px;
    line-height: 1.2;
    padding: 0 35px;
  }
  .subtitle {
    font-size: 14px;
    text-transform: uppercase;
    color: rgb(107, 114, 128);
    font-weight: 400;
    letter-spacing: 0.04em;
  }
  .tag {
    display: inline-block;
    padding: 6px 25px;
    background-color: #fff;
    color: #161e2e;
    border: 1px solid #e5e7eb;
    text-align: center;
    font-weight: 700;
    margin: 10px auto 30px;
    border-radius: 30px;
  }
  .date {
    font-weight: 400;
    margin-bottom: 5px;
  }
  .button {
    display: inline-block;
    padding: 10px 40px;
    background-color: #31c48d;
    color: #fff;
    font-size: 20px;
    text-align: center;
    font-weight: 700;
    margin: 25px auto 10px;
    border-radius: 30px;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
  }
  .text {
    color: rgb(107, 114, 128);
    font-size: 12px;
    font-weight: 400;
  }
`;

const Others = styled(Container)`
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
  border-radius: 12px;
  font-family: "Ubuntu";
  padding: 50px;
  margin-bottom: 50px;

  .title {
    color: #161e2e;
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 25px;
    text-transform: uppercase;
  }
`;

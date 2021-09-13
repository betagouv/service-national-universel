import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { toastr } from "react-redux-toastr";

import api from "../../services/api";
import { translate, formatStringDateTimezoneUTC } from "../../utils";
import SocialIcons from "../../components/SocialIcons";
import ApplyModal from "./components/ApplyModal";
import ApplyDoneModal from "./components/ApplyDoneModal";
import Loader from "../../components/Loader";
import Badge from "../../components/Badge";
import DomainThumb from "../../components/DomainThumb";

export default (props) => {
  const [mission, setMission] = useState();
  const [modal, setModal] = useState(null);

  const getMission = async () => {
    const id = props.match && props.match.params && props.match.params.id;
    if (!id) return setMission(null);
    const { data } = await api.get(`/mission/${id}`);
    return setMission(data);
  };
  useEffect(() => {
    getMission();
  }, []);

  const getTags = () => {
    const tags = [];
    mission.city && tags.push(mission.city + (mission.zip ? ` - ${mission.zip}` : ""));
    // tags.push(mission.remote ? "À distance" : "En présentiel");
    mission.domains.forEach((d) => tags.push(translate(d)));
    return tags;
  };

  if (mission === undefined) return <Loader />;

  return (
    <Container>
      {modal === "APPLY" && (
        <ApplyModal
          value={mission}
          onChange={() => setModal(null)}
          onSend={async () => {
            await getMission();
            setModal("DONE");
          }}
        />
      )}
      {modal === "DONE" && <ApplyDoneModal value={mission} onChange={() => setModal(null)} />}
      <Heading>
        <div>
          <p className="title">mission</p>
          <h1>{mission.name}</h1>
          <Tags>
            {getTags().map((e, i) => (
              <Badge key={i} text={e} textColor="#6b7280" backgroundColor="#ffffff" />
            ))}
            {mission?.isMilitaryPreparation === "true" ? <Badge text="Préparation Militaire" color="#03224C" /> : null}
          </Tags>
        </div>
        <div>
          <ApplyButton applied={mission.application} placesLeft={mission.placesLeft} setModal={setModal} />
        </div>
      </Heading>
      <Box>
        <Row>
          <Col md={12}>
            <HeadCard>
              <div style={{ display: "flex", alignItems: "center" }}>
                <DomainThumb domain={mission.domains[0]} style={{ transform: "translateY(-20%)" }} size="4rem" />
                <p>
                  Au sein de la structure <span>{mission.structureName}</span>
                </p>
              </div>
              <SocialIcons structure={mission.structureId} />
            </HeadCard>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
            <Wrapper>
              <Legend>La mission en quelques mots</Legend>
              <Detail title="Format" content={translate(mission.format)} />
              <Detail title="Objectifs" content={mission.description} />
              <Detail title="Actions" content={mission.actions} />
              <Detail title="Contraintes" content={mission.contraintes} />
              <InfoStructure title="à propos de la structure" structure={mission.structureId} />
            </Wrapper>
          </Col>
          <Col md={6}>
            <Wrapper>
              <Legend>
                {mission.startAt && mission.endAt
                  ? `Du ${formatStringDateTimezoneUTC(mission.startAt)} au ${formatStringDateTimezoneUTC(mission.endAt)}`
                  : "Aucune date renseignée"}
              </Legend>
              {mission.duration ? <Detail title="Durée estimée" content={`${mission.duration} heure(s)`} /> : null}
              <Detail title="Fréquence" content={mission.frequence} />
              <Detail title="Période pour réaliser la mission" content={mission.period} />
              <Detail title="Lieu" content={[mission.address, mission.zip, mission.city, mission.department]} />
            </Wrapper>
          </Col>
        </Row>
      </Box>
      <Footer>
        <ApplyButton applied={mission.application} placesLeft={mission.placesLeft} setModal={setModal} />
      </Footer>
    </Container>
  );
};

const ApplyButton = ({ applied, placesLeft, setModal }) => {
  return applied ? (
    <>
      <Link to="/candidature">
        <Button>Voir&nbsp;la&nbsp;candidature</Button>
      </Link>
      <p className="button-subtitle">Vous avez déjà candidaté à cette mission</p>
    </>
  ) : (
    <>
      <Button onClick={() => setModal("APPLY")}>Candidater</Button>
      <p className="button-subtitle">{`${placesLeft} volontaire${placesLeft > 1 ? "s" : ""} recherché${placesLeft > 1 ? "s" : ""}`}</p>
    </>
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
      if (!ok) toastr.error("Oups, une erreur est survenue lors de la récupération de la structure", translate(code));
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
  align-items: center;
  flex-direction: column;
  margin-bottom: 2rem;
  p {
    margin-top: 1rem;
    text-align: center;
    color: #6b7280;
    font-size: 0.75rem;
  }
`;

const Legend = styled.div`
  color: rgb(38, 42, 62);
  margin-bottom: 20px;
  font-size: 1.3rem;
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
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
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
  }
  width: fit-content;
  :hover {
    color: #fff;
    background-color: #0e9f6e;
  }
`;

const Heading = styled(Container)`
  margin-bottom: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
  h1 {
    color: #161e2e;
    font-size: 3rem;
    font-weight: 700;
    padding-right: 3rem;
    @media (max-width: 768px) {
      padding-right: 1rem;
      font-size: 1.1rem;
    }
  }
  p {
    &.title {
      color: #42389d;
      font-size: 1rem;
      @media (max-width: 768px) {
        font-size: 0.7rem;
      }
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
`;

const Wrapper = styled.div`
  padding: 3rem;
  @media (max-width: 768px) {
    padding: 1rem;
  }
  .detail {
    font-size: 1rem;
    text-align: left;
    margin-top: 2rem;
    @media (max-width: 768px) {
      margin-top: 1rem;
    }
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
  min-height: 4rem;
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0 0.5rem;
  }
  p {
    margin: 0;
    color: #929292;
    span {
      color: #242526;
      font-weight: 600;
    }
    @media (max-width: 768px) {
      font-size: 0.8rem;
      padding: 0.3rem 0;
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
    @media (max-width: 768px) {
      margin: 0.5rem 0;
    }
  }
`;

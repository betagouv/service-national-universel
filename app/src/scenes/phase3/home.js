import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";

import ProgramCard from "./components/programCard";
import MissionCard from "./components/missionCard";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};

  return (
    <>
      <Hero>
        <div className="content">
          <h1>
            <strong>{young.firstName},</strong> poursuivez votre engagement !
          </h1>
          <p>
            A l’issue de la mission d’intérêt général, chaque volontaire peut poursuivre son engagement et sa participation à la création d’une société fraternelle, notamment en
            réalisant la phase 3 du SNU. Cet engagement volontaire s’adresse aux jeunes de 16 ans à 25 ans, et dure de 3 mois à 1 an.
          </p>
        </div>
        <div className="thumb" />
      </Hero>
      <TransparentHero>
        <Heading>
          <h2>Parmi les possibilités d'engagement</h2>
          <p>Rejoignez plus de 100 000 jeunes français déjà engagés dans de grandes causes</p>
        </Heading>
        <Row>
          <Col>
            <ProgramCard
              title="Le Service Civique"
              image={require("../../assets/programmes-engagement/service-civique.jpg")}
              details="Un engagement volontaire au service de l’intérêt général, en France ou à l’étranger, auprès d’organisations à but non lucratif ou publiques."
            />
          </Col>
          <Col>
            <ProgramCard
              title="Les Sapeurs-Pompiers de France"
              image={require("../../assets/programmes-engagement/sapeur-pompier-2.jpg")}
              details="Si vous souhaitez vous engager pour aider votre prochain tout en ayant une autre activité professionnelle, le statut de sapeur-pompier volontaire peut vous permettre d’y parvenir."
            />
          </Col>
          <Col>
            <ProgramCard
              title="Plan Mercredi"
              image={require("../../assets/programmes-engagement/plan-mercredi.png")}
              details="Devenez bénévole et trouvez des missions en quelques clics près de chez vous ou à distance. Plus de 330 000 bénévoles soutiennent des milliers d'associations et d'organisations publiques."
            />
          </Col>
        </Row>
        <SeeMore to="/phase3/les-programmes">Tous les programmes d'engagement →</SeeMore>
        <hr style={{ margin: "40px 0", opacity: 0.8 }} />
      </TransparentHero>
      <TransparentHero>
        <Heading>
          <h2>Trouvez une mission de bénévolat à distance ou près de chez vous</h2>
          <p>Plus de 30 000 missions disponibles pour poursuivre votre engagement</p>
        </Heading>
        <Missions>
          <MissionCard
            title="Hophopfood"
            image={require("../../assets/observe.svg")}
            subtitle="I assist the police in their mediation and conflict management missions"
            tags={["Face-to-face mission - Paris (75)", "Nature protection"]}
          />
          <MissionCard
            title="Pépins production"
            image={require("../../assets/police-station.svg")}
            subtitle="J'assiste les policiers dans leurs missions de médiations et gestions des conflits"
            tags={["Mission à distance", "Protection de la nature"]}
          />
          <MissionCard
            title="Hophopfood"
            image={require("../../assets/observe.svg")}
            subtitle="I assist the police in their mediation and conflict management missions"
            tags={["Face-to-face mission - Paris (75)", "Nature protection"]}
          />
          <SeeMore to="/phase3/une-mission">Toutes les missions →</SeeMore>
        </Missions>
      </TransparentHero>
    </>
  );
};

const Hero = styled.div`
  border-radius: 0.5rem;
  margin: 0 auto;
  max-width: 80rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  .content {
    width: 65%;
    @media (max-width: 768px) {
      width: 100%;
    }
    padding: 60px 30px 60px 50px;
    position: relative;
    background-color: #fff;
    > * {
      position: relative;
      z-index: 2;
    }
  }
  h1 {
    font-size: 3rem;
    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 500;
    line-height: 1;
  }
  p {
    color: #6b7280;
    font-size: 1.25rem;
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    font-weight: 400;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .thumb {
    min-height: 400px;
    background: url(${require("../../assets/phase3.jpg")}) no-repeat center;
    background-size: cover;
    flex: 1;
  }
`;
const Heading = styled.div`
  margin-top: 40px;
  margin-bottom: 30px;
  h2 {
    color: #161e2e;
    font-size: 34px;
    font-weight: 700;
  }
  p {
    color: #6b7280;
    font-size: 18px;
  }
`;

const SeeMore = styled(Link)`
  :hover {
    color: #372f78;
  }
  cursor: pointer;
  color: #5145cd;
  font-size: 16px;
`;

const Missions = styled.div`
  padding: 40px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;

const TransparentHero = styled.div`
  padding: 0 2rem;
  max-width: 80rem;
  margin: 1rem auto;
`;

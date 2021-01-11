import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import styled from "styled-components";

import ProgramCard from "./components/programCard";
import MissionCard from "./components/missionCard";

export default () => {
  return (
    <Container style={{ padding: 0, marginBottom: 40 }}>
      <Nav />
      <Hero>
        <div className="content">
          <h1>
            <strong>Pierre,</strong> poursuivez votre engagement !
          </h1>
          <p>
            A l’issue de la mission d’intérêt général, chaque volontaire peut poursuivre son engagement et sa participation à la création d’une société fraternelle, notamment en
            réalisant la phase 3 du SNU. Cet engagement volontaire s’adresse aux jeunes de 16 ans à 25 ans, et dure de 3 mois à 1 an.
          </p>
        </div>
        <div className="thumb" />
      </Hero>
      <div style={{ padding: "0 40px" }}>
        <Heading>
          <h2>Parmi les grands programmes d'engagement</h2>
          <p>Rejoignez plus 100 000 jeunes français déjà engagés dans de grandes causes</p>
        </Heading>
        <Row>
          <Col>
            <ProgramCard title="Le Service Civique" image={require("../../assets/engagement-1.jpg")} details="Une mission pour chacun au service de tous" />
          </Col>
          <Col>
            <ProgramCard title="Les Sapeurs-Pompiers de France" image={require("../../assets/engagement-2.jpg")} details="Une formation pour devenir Jeune Sapeur-Pompier" />
          </Col>
          <Col>
            <ProgramCard title="Plan Mercredi" image={require("../../assets/engagement-3.png")} details="Une ambition éducative pour tous les enfants" />
          </Col>
        </Row>
        <SeeMore to="/phase3/les-programmes">Tous les programmes d'engagement →</SeeMore>
        <hr style={{ margin: "40px 0", opacity: 0.8 }} />
        <Heading>
          <h2>Trouvez une mission de bénévolat à distance ou près de chez vous</h2>
          <p>Plus de 30 000 missions disponibles pour poursuivre votre engagement</p>
        </Heading>
      </div>
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
    </Container>
  );
};

const Nav = () => {
  return (
    <Topbar>
      <li>
        <NavLink to="#" className="done">
          Mon séjour de cohésion
        </NavLink>
      </li>
      <li>
        <NavLink to="#" className="done">
          Ma mission d'intérêt général
        </NavLink>
      </li>
      <li>
        <NavLink to="#">Poursuivre mon SNU</NavLink>
      </li>
    </Topbar>
  );
};

const Topbar = styled.ul`
  background-color: #fff;
  list-style: none;
  display: flex;
  justify-content: space-between;
  width: 100%;
  border-radius: 6px 6px 0 0;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
  margin-bottom: 40px;
  border-radius: 4px;

  li {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    :not(:last-child)::after {
      content: "";
      display: block;
      height: 100%;
      width: 20px;
      background: url(${require("../../assets/big-angle.svg")}) center top no-repeat;
      background-size: cover;
      position: absolute;
      top: 0;
      right: 0;
    }
    :last-child a::before {
      content: "03";
      font-size: 14px;
      font-weight: 700;
      color: #5145cd;
      text-align: center;
      line-height: 38px;
    }
    :last-child a::after {
      display: none;
    }
  }
  a {
    text-decoration: none;
    font-size: 18px;
    line-height: 1.2;
    color: #6b7280;
    position: relative;
    display: block;
    padding: 25px 15px;
    padding-left: 80px;
    z-index: 2;

    ::before {
      content: "";
      display: block;
      border: 2px solid #d2d6dc;
      height: 40px;
      width: 40px;
      border-radius: 50%;
      position: absolute;
      left: 25px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
    }
    ::after {
      content: "";
      display: block;
      height: 10px;
      width: 17px;
      border-left: 2px solid #d2d6dc;
      border-bottom: 2px solid #d2d6dc;
      transform: translateY(-50%) rotate(-45deg);
      position: absolute;
      left: 36px;
      top: 48%;
      z-index: 2;
    }
    &.active {
      color: #5145cd;
      ::before {
        border: 2px solid #5145cd;
      }
      ::after {
        border-left: 2px solid #5145cd;
        border-bottom: 2px solid #5145cd;
      }
    }
    &.done {
      color: #6b7280;
      ::before {
        background-color: #5145cd;
        border: 2px solid #5145cd;
      }
      ::after {
        border-left: 2px solid #fff;
        border-bottom: 2px solid #fff;
      }
    }
  }
`;

const Hero = styled.div`
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  .content {
    width: 50%;
    padding: 60px 30px 60px 50px;
    position: relative;
    background-color: #fff;
    > * {
      position: relative;
      z-index: 2;
    }
    ::after {
      content: "";
      display: block;
      height: calc(100% + 200px);
      width: 150px;
      transform: rotate(12deg);
      background-color: #fff;
      position: absolute;
      right: -8%;
      top: -70px;
      z-index: 1;
    }
  }
  h1 {
    font-size: 60px;
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 400;
    line-height: 1;
  }
  p {
    color: #6b7280;
    font-size: 20px;
    font-weight: 400;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .thumb {
    min-height: 400px;
    background: url(${require("../../assets/phase3.jpg")}) no-repeat center right;
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
  color: #42389d;
  font-size: 16px;
`;

const Missions = styled.div`
  padding: 40px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;

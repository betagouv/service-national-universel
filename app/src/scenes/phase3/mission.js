import React from "react";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import styled from "styled-components";

import MissionCard from "./components/missionCard";

export default function Mission() {
  return (
    <Container>
      <Wrapper>
        <LeftBox style={{ padding: "50px 40px" }}>
          <div className="heading">
            <p>MISSION</p>
            <h2>Connaissance du fonctionnement d&apos;une Association de bénévoles</h2>
          </div>
          <div className="title">
            <span>DOMAINE D&apos;ACTION</span>
          </div>
          <div style={{ marginBottom: 60 }}>
            <div className="domain">Citoyenneté</div>
          </div>
          <div className="title">
            <span>DESCRIPTIF DE LA MISSION</span>
          </div>
          <div className="text" style={{ marginBottom: 60 }}>
            Connaître le fonctionnement d&apos;une association de bénévoles Accompagner les bénévoles et en partager avec eux la réalisation de leurs actions en faveur des jeunes :
            rencontres avec enseignants ou responsables d&apos;entreprises, interventions devant des jeunes, participation aux visites, debriefing des actions, …
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
          <Link to-="#" className="button">
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
      </Others>
    </Container>
  );
}
const Wrapper = styled.div`
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
  border-radius: 12px;
  font-family: "Ubuntu";
  display: flex;
  padding: 0;
  margin-bottom: 50px;
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

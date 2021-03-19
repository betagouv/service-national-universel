import React, { useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import ProgramCard from "../phase3/components/programCard";
import { Row, Col } from "reactstrap";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div>
      <Hero>
        {showAlert && (
          <Alert>
            <div className="text">
              <strong>CANDIDATURE REFUSÉE</strong>
            </div>
            <img src={require("../../assets/close.svg")} height={15} onClick={() => setShowAlert(false)} />
          </Alert>
        )}
        <Content showAlert={showAlert}>
          <h1>
            <strong>{young.firstName},</strong> votre candidature a été refusée.
          </h1>
          <p>Votre candidature n'a pas pu être retenue pour l'édition 2021 du Service National Universel.</p>
          <p>Nous vous souhaitons une bonne continuation !</p>
        </Content>
        <div className="thumb" />
      </Hero>
      <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
        <Heading>
          <h2>Parmi les grands programmes d'engagement</h2>
          <p>Rejoignez plus 100 000 jeunes français déjà engagés dans de grandes causes</p>
        </Heading>
        <Row>
          <Col>
            <ProgramCard
              title="Le Service Civique"
              image={require("../../assets/programmes-engagement/service-civique.jpg")}
              details="Un engagement volontaire au service de l’intérêt général, en France ou à l’étranger, auprès d’organisations à but non lucratif ou publiques."
              href="https://www.service-civique.gouv.fr/"
            />
          </Col>
          <Col>
            <ProgramCard
              title="Les Sapeurs-Pompiers de France"
              image={require("../../assets/programmes-engagement/sapeur-pompier-2.jpg")}
              details="Si vous souhaitez vous engager pour aider votre prochain tout en ayant une autre activité professionnelle, le statut de sapeur-pompier volontaire peut vous permettre d’y parvenir."
              href="https://www.pompiers.fr/grand-public/devenir-sapeur-pompier"
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <ProgramCard
              title="Plan Mercredi"
              image={require("../../assets/programmes-engagement/plan-mercredi.png")}
              details="Le Plan mercredi met en place un cadre de confiance pour les communes et les parents afin d’offrir au plus grand nombre d’enfants un accueil de loisirs éducatifs de grande qualité le mercredi."
              href="http://planmercredi.education.gouv.fr/"
            />
          </Col>
          <Col>
            <ProgramCard
              title="JeVeuxAider"
              image={require("../../assets/jva.png")}
              details="Devenez bénévole et trouvez des missions en quelques clics près de chez vous ou à distance. Plus de 330 000 bénévoles soutiennent des milliers d'associations et d'organisations publiques."
              href="https://jeveuxaider.gouv.fr/"
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

const Content = styled.div`
  margin-top: ${({ showAlert }) => (showAlert ? "2rem" : "")};
  width: 50%;
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
`;

const Hero = styled.div`
  border-radius: 0.5rem;
  max-width: 80rem;
  margin: 0 auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  background-color: #fff;
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
    @media (max-width: 768px) {
      display: none;
    }
    -webkit-clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
    clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
  }
`;

const Alert = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f05252;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  padding: 10px 20px;
  position: absolute;
  z-index: 10;
  width: 100%;
  .text {
    margin: 0 20px;
    color: #fff;
    strong {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 3px;
    }
  }
  img {
    position: absolute;
    right: 0;
    margin: 1rem;
    cursor: pointer;
  }
`;

const Heading = styled.div`
  width: 100%;
  margin: 40px auto 30px auto;
  text-align: center;
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

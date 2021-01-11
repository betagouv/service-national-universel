import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { Col, Container, CustomInput, Input, Row } from "reactstrap";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <>
      <Hero>
        {showAlert && (
          <Alert>
            <div className="text">
              <strong>INSCRIPTION VALIDÉE</strong>
            </div>
            <img src={require("../../assets/close.svg")} height={15} onClick={() => setShowAlert(false)} />
          </Alert>
        )}
        <Content showAlert={showAlert}>
          <h1>
            <strong>{young.firstName},</strong> votre candidature a été retenue !
          </h1>
          <p>Félicitations, vous allez pouvoir débuter prochainement votre parcours SNU.</p>
          <p>Ceci est votre espace volontaire, il vous permettra de vous guider à chaque étape de votre SNU.</p>
          <p style={{ color: "#161e2e", fontSize: "1.5rem", fontWeight: 700 }}>Au programme</p>
          <ProgramItem title="1. Un séjour de cohésion" subtitle="Du 21 juin au 2 juillet 2021" link="Renseignez votre fiche sanitaire" />
          <ProgramItem title="2. Une première mission d'intérêt général" subtitle="À réaliser dans l’année, jusqu’au 31 juin 2022." link="Indiquez vos préférences de mission" />
          <ProgramItem title="3. Un engagement vers une société plus solidaire" subtitle="À réaliser avant vos 25 ans" />
        </Content>
        <div className="thumb" />
      </Hero>

      <Hero style={{ flexDirection: "column" }}>
        <Content style={{ width: "100%" }}>
          <h1>Prochaine étape</h1>
          <p>
            Vous êtes actuellement <Tag>en attente d'affectation à un centre de cohésion.</Tag>
          </p>
          <p>Au mois de Mai, vous serez informé par e-mail du lieu et des modalités de votre séjour.</p>
          <p style={{ color: "#161e2e", fontSize: "1.5rem", fontWeight: 700 }}>Fiche sanitaire</p>
          <p>
            Vous pouvez dores-et-déjà télécharger la <b>fiche sanitaire</b> ci-dessous.
          </p>
          <p>
            Vous devrez l'imprimer et la renvoyer <b>complétée</b> et <b>signée</b> par votre représentant légal au plus tard le <b>4 juin 2021</b>. L'adresse de destination vous
            sera communiquée sur cette page, une fois votre lieu d'affectation connu.
          </p>
          <BackButton>Télécharger la fiche sanitaire</BackButton>
        </Content>
        <ContentHorizontal style={{ width: "100%" }}>
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              ></path>
            </svg>
          </div>
          <div>
            <h1>Transmission de la fiche sanitaire</h1>
            <p>
              Téléchargez la fiche sanitaire. Vous devrez l'imprimer et la renvoyer complétée et signée par votre représentant légal au plus tard le 4 juin 2021. L'adresse de
              destination vous sera communiquée sur cette page, une fois votre lieu d'affectation connue.
            </p>
            <a className="link">Note relative aux informations d'ordre sanitaire{" >"}</a>
          </div>
          <div style={{ minWidth: "30%", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
            <BackButton>Télécharger la fiche sanitaire</BackButton>
          </div>
        </ContentHorizontal>
        <ContentHorizontal style={{ width: "100%" }}>
          <div className="icon">
            <svg class="h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              ></path>
            </svg>
          </div>
          <div>
            <h1>Consentement de droit à l'image</h1>
            <p>Votre représentant légal peut dès-à-présent renseigner le formulaire relatif au droit à l'image. Cette étape est un pré-requis au séjour de cohésion.</p>
          </div>
          <Cards></Cards>
        </ContentHorizontal>
      </Hero>
    </>
  );
};

const ProgramItem = ({ title, subtitle, link }) => {
  return (
    <WrapperItem>
      <div className="title">{title}</div>
      <div className="info">
        <div className="subtitle">{subtitle}</div>
        {link && <a className="link">{`${link} >`}</a>}
      </div>
    </WrapperItem>
  );
};

const Cards = styled.div``;

const Tag = styled.span`
  color: #42389d;
  padding: 0.25rem 0.75rem;
  margin: 0 0.25rem;
  border-radius: 99999px;
  background-color: #e5edff;
  font-size: 1rem;
`;

const WrapperItem = styled.div`
  margin-bottom: 1rem;
  .info {
    margin-left: 1.5rem;
    .subtitle {
      color: #6b7280;
      font-size: 0.875rem !important;
    }
    .link {
      color: #5145cd;
      font-size: 0.875rem;
      font-weight: 400;
      cursor: pointer;
    }
  }
  .title {
    color: #161e2e;
    font-size: 1.25rem !important;
    font-weight: 500;
  }
`;

const Content = styled.div`
  margin-top: ${({ showAlert }) => (showAlert ? "2rem" : "")};
  width: 65%;
  @media (max-width: 768px) {
    width: 100%;
  }
  padding: 60px 30px 60px 50px;
  position: relative;
  background-color: #fff;
  border-bottom-width: 1px;
  border-color: #d2d6dc;
  border-bottom-style: dashed;
  > * {
    position: relative;
    z-index: 2;
  }
  .icon {
    margin-right: 1rem;
    svg {
      width: 1.5rem;
      stroke: #5145cd;
    }
  }
`;

const ContentHorizontal = styled(Content)`
  display: flex;
  width: 100%;
  h1 {
    color: #161e2e;
    font-size: 1.5rem !important;
    font-weight: 700 !important;
  }
  p {
    color: #6b7280;
    margin-top: 0.5rem;
    font-size: 1.125rem !important;
    font-weight: 400 !important;
  }
  .link {
    color: #5145cd;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    font-weight: 400;
    cursor: pointer;
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
  margin: 1rem 0;
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

const BackButton = styled.button`
  color: #374151;
  margin-top: 1rem;
  background-color: #fff;
  padding: 0.5rem 1rem;
  border: 1px solid #d2d6dc;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
  :hover {
    opacity: 0.9;
  }
`;

const Alert = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #31c48d;
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
    margin-right: 1rem;
    cursor: pointer;
  }
`;

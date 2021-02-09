import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { Col, Container, CustomInput, Input, Row } from "reactstrap";
import { STEPS } from "../inscription/utils";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <Hero>
      {showAlert && (
        <Alert>
          <div className="text">
            <strong>INSCRIPTION EN COURS DE VALIDATION</strong>
          </div>
          <img src={require("../../assets/close.svg")} height={15} onClick={() => setShowAlert(false)} />
        </Alert>
      )}
      <Content showAlert={showAlert}>
        <h1>
          <strong>{young.firstName},</strong> bienvenue dans votre espace personnel.
        </h1>
        <p>
          Votre inscription a bien été enregistrée et est <b style={{ color: "#5145cd" }}>en cours de validation</b> par l'administration. Vous serez prochainement informé(e) par
          e-mail de l'avancement de votre candidature.
        </p>
        <p>Vous pouvez cependant continuer à éditer les informations renseignées lors de votre inscription.</p>
        <Link to="/inscription/coordonnees">
          <BackButton>Editer mes informations d'inscription</BackButton>
        </Link>
        <Separator />
        <p style={{ fontSize: "1.125rem" }}>
          Si vous avez la moindre question, trouvez toutes les réponses à vos questions en consultant la{" "}
          <a href="https://www.snu.gouv.fr/foire-aux-questions-11" target="blank" style={{ color: "#5145cd" }}>
            FAQ
          </a>{" "}
          du SNU.
        </p>
      </Content>
      <div className="thumb" />
    </Hero>
  );
};

const Separator = styled.hr`
  margin: 2.5rem 0;
  height: 1px;
  border-style: none;
  background-color: #e5e7eb;
`;

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
  background-color: #5949d0;
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

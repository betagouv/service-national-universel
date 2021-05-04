import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";

import Hero from "../../components/Hero";
import { isEndOfInscriptionManagement2021 } from "../../utils";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <Hero>
      {showAlert && (
        <Alert>
          <div className="text">
            <strong>INSCRIPTION EN ATTENTE DE CORRECTION</strong>
          </div>
          <img src={require("../../assets/close.svg")} height={15} onClick={() => setShowAlert(false)} />
        </Alert>
      )}
      <Content showAlert={showAlert}>
        <h1>
          <strong>{young.firstName},</strong> bienvenue dans votre espace personnel.
        </h1>
        {!isEndOfInscriptionManagement2021() && (
          <>
            <p>Une action de votre part est nécessaire afin de valider votre inscription au SNU.</p>
            <p>
              Vous avez reçu des instructions sur votre adresse mail <span style={{ color: "#5145cd" }}>{young.email}</span>.
            </p>

            <p>Vous pouvez effectuer les corrections indiquées en cliquant sur ce bouton jusqu'au 5 mai au soir.</p>
            <Link to="/inscription/coordonnees">
              <BackButton>Editer mes informations d'inscription</BackButton>
            </Link>
          </>
        )}
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

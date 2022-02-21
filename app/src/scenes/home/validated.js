import React, { useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { HeroContainer, Hero, Content, Alert } from "../../components/Content";
import { Link } from "react-router-dom";

export default function Validated() {
  const young = useSelector((state) => state.Auth.young);
  const is2020 = young.cohort === "2020";
  const [showAlert, setShowAlert] = useState(!is2020);

  return (
    <HeroContainer>
      <Hero >
        {showAlert && (
          <Alert color="#31c48d">
            <div className="text">
              <strong>INSCRIPTION VALIDÉE</strong>
            </div>
            <img src={require("../../assets/close.svg")} height={15} width={15} onClick={() => setShowAlert(false)} />
          </Alert>
        )}
        <Content showAlert={showAlert}>
          <h1>
            <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
          </h1>
          <IconContainer>
            <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 24C0 10.745 10.745 0 24 0s24 10.745 24 24-10.745 24-24 24S0 37.255 0 24z" fill="#D1FAE5" />
              <path d="M17 25l4 4 10-10" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ color: "#000" }}>
              <strong>Félicitations, vous allez pouvoir débuter prochainement votre parcours SNU.</strong>
              <br />
              <p>Vous êtes actuellement en attente d’affectation à un lieu pour votre séjour de cohésion.</p>
            </p>
          </IconContainer>
          <Link class="flex justify-between bg-indigo-100 p-4  text-indigo-900 rounded-md text-sm hover:bg-indigo-200 hover:cursor-pointer" to="/phase1">
            <div class="flex">
              <svg class="mr-1" width="24" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M16 8A8 8 0 110 8a8 8 0 0116 0zM9 4a1 1 0 11-2 0 1 1 0 012 0zM7 7a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2V8a1 1 0 00-1-1H7z"
                  fill="#32257F"
                />
              </svg>
              Préparez votre séjour de cohésion
            </div>
            Documents à fournir →
          </Link>
        </Content>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
}

const IconContainer = styled.div`
  display: flex;
  margin-top: 2.5rem;
  svg {
    min-width: 4rem;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    svg {
      margin-bottom: 1rem;
    }
  }
`;


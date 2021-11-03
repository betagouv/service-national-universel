import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { HeroContainer, Hero, Content, Alert, WhiteButton } from "../../components/Content";
import styled from "styled-components";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [showAlert, setShowAlert] = useState(false);

  return (
    <HeroContainer>
      <Hero>
        {showAlert && (
          <Alert color="#f05252">
            <div className="text">
              <strong>RÉINSCRIPTION COHORTE 2022</strong>
            </div>
            <img src={require("../../assets/close.svg")} height={15} onClick={() => setShowAlert(false)} />
          </Alert>
        )}
        <Content showAlert={showAlert}>
          <h1>
            <strong>Mon séjour de cohésion</strong>
          </h1>
          <p>Le SNU vous donne l'opportunité de découvrir la vie collective au sein d'un centre accueillant environ 200 jeunes de votre région pour créer ainsi des liens nouveaux et développer votre culture de l’engagement et ainsi affirmer votre place dans la société.</p>
          <IconContainer>
            <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="24" fill="#FFFBEB" /><path fill-rule="evenodd" clip-rule="evenodd" d="M22.503 15.172a2.194 2.194 0 013.883 0L32.6 26.574c.835 1.533-.238 3.426-1.942 3.426H18.23c-1.703 0-2.776-1.893-1.94-3.426l6.213-11.402zm3.055 11.38c0 .635-.499 1.15-1.114 1.15-.615 0-1.113-.515-1.113-1.15 0-.635.498-1.15 1.113-1.15s1.114.515 1.114 1.15zm-1.114-9.195c-.615 0-1.113.515-1.113 1.15v3.447c0 .635.498 1.15 1.113 1.15s1.114-.515 1.114-1.15v-3.448c0-.634-.499-1.15-1.114-1.15z" fill="#FBBF24" /></svg>
            <div>
              <p style={{ color: "#000" }}>
                <strong>Les inscriptions pour les séjours de cohésion 2022 sont ouvertes</strong>
                <br />
                Vous pouvez dès à présent déposer une demande d'inscription pour participer au séjour de cohésion 2022.
              </p>
              <Link to="/inscription">
                <WhiteButton>M'inscrire au Service National Universel 2022</WhiteButton>
              </Link>
            </div>
          </IconContainer>
        </Content>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
};

const IconContainer = styled.div`
  display: flex;
  margin-top: 2.5rem;
  svg {
    min-width: 4rem
  }
`;

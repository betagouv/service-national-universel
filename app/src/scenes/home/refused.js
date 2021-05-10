import React, { useState } from "react";
import { useSelector } from "react-redux";
import { HeroContainer, Hero, Content, Alert } from "../../components/Content";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <HeroContainer>
      <Hero>
        {showAlert && (
          <Alert color="#f05252">
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
    </HeroContainer>
  );
};

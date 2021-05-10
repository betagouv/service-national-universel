import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { HeroContainer, Hero, Content, Alert, Separator, WhiteButton } from "../../components/Content";
import { isEndOfInscriptionManagement2021 } from "../../utils";


export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <HeroContainer>
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
            <span>
              <p>Une action de votre part est nécessaire afin de valider votre inscription au SNU.</p>
              <p>
                Vous avez reçu des instructions sur votre adresse mail <span style={{ color: "#5145cd" }}>{young.email}</span>.
              </p>

              <p>Vous pouvez effectuer les corrections indiquées en cliquant sur ce bouton jusqu'au 5 mai au soir.</p>
              <Link to="/inscription/coordonnees">
                <WhiteButton>Editer mes informations d'inscription</WhiteButton>
              </Link>
            </span>
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
    </HeroContainer>
  );
};

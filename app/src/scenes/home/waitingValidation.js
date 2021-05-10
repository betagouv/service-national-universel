import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { HeroContainer, Hero, Content, Alert, Separator, WhiteButton } from "../../components/Content";
import { YOUNG_STATUS } from "../../utils";
import { isEndOfInscriptionManagement2021 } from "snu-lib";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <HeroContainer>
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
          {young.status === YOUNG_STATUS.WAITING_VALIDATION && !isEndOfInscriptionManagement2021() ? (
            <>
              <p>Vous pouvez cependant continuer à éditer les informations renseignées lors de votre inscription.</p>
              <Link to="/inscription/coordonnees">
                <WhiteButton>Editer mes informations d'inscription</WhiteButton>
              </Link>
            </>
          ) : null}
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

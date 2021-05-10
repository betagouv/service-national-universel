import React, { useState } from "react";
import { useSelector } from "react-redux";
import { HeroContainer, Hero, Content, Alert, Separator } from "../../components/Content";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <HeroContainer>
      <Hero>
        {showAlert && (
          <Alert>
            <div className="text">
              <strong>INSCRIPTION SUR LISTE COMPLÉMENTAIRE</strong>
            </div>
            <img src={require("../../assets/close.svg")} height={15} onClick={() => setShowAlert(false)} />
          </Alert>
        )}
        <Content showAlert={showAlert}>
          <h1>
            <strong>{young.firstName},</strong> bienvenue dans votre espace personnel.
          </h1>
          <p>
            Votre candidature a été placée <b style={{ color: "#5145cd" }}>en liste complémentaire</b> par l'administration. Vous serez informé(e) par e-mail si une place venait à
            se libérer vous permettant ainsi de participer au SNU.
          </p>
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

import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { HeroContainer, Content, Hero, VioletButton } from "../../../components/Content";

export default () => {
  const young = useSelector((state) => state.Auth.young);

  return (
    <HeroContainer>
      <Hero>
        <Content>
          <p>Vous n'avez pas pu participer au séjour de cohésion en 2021.</p>
          <p>Si vous souhaitez participer à la session 2022 :</p>
          <a href="https://support.snu.gouv.fr/help/fr-fr/24-questions-frequemment-posees/181-suis-je-eligible-au-sejour-de-cohesion" target="_blank">
            <VioletButton>Vérifiez votre éligibilité</VioletButton>
          </a>
          <a href="https://support.snu.gouv.fr/help/fr-fr/24-questions-frequemment-posees/175-j-etais-inscrit-en-2021-comment-me-reinscrire-en-2022" target="_blank">
            <VioletButton>Consultez la procédure d'inscription 2022</VioletButton>
          </a>
        </Content>
      </Hero>
    </HeroContainer>
  );
};

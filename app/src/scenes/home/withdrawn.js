import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { HeroContainer, Hero, Content, Separator, VioletButton } from "../../components/Content";

export default () => {
  const young = useSelector((state) => state.Auth.young);

  return (
    <HeroContainer>
      <Hero>
        <Content>
          <h1>
            <strong>{young.firstName},</strong> dommage que vous nous quittiez !
          </h1>
          <p>Votre désistement du SNU a bien été pris en compte.</p>
          <p>Si l'engagement vous donne envie, vous trouverez ci-dessous des dispositifs qui pourront vous intéresser.</p>
          <p>
            Bonne continuation, <br />
            Les équipes du Service National Universel
          </p>
          <Separator />
          <Link to="/phase3/les-programmes">
            <VioletButton>Consulter les autres possibilités d'engagement</VioletButton>
          </Link>
        </Content>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
};

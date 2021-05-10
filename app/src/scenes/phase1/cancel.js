import React from "react";
import { useSelector } from "react-redux";
import { HeroContainer, Hero, Content } from "../../components/Content";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  return (
    <HeroContainer>
      <Hero>
        <Content>
          <h1>
            <strong>{young.firstName},</strong> votre séjour a été annulé suite à la crise sanitaire !
          </h1>
          <div style={{ marginTop: "1rem", fontStyle: "italic" }}>
            Si vous n'avez pas réalisé votre JDC, nous vous invitons à vous inscrire sur{" "}
            <a href="http://majdc.fr" target="_blank">
              majdc.fr
            </a>{" "}
            et à demander à être convoqué pour une session en ligne.
          </div>
        </Content>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
};

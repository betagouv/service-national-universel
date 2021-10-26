import React from "react";
import { useSelector } from "react-redux";
import { HeroContainer, Hero, Content } from "../../components/Content";
import { YOUNG_STATUS_PHASE1_MOTIF, translate } from "../../utils";
export default () => {
  const young = useSelector((state) => state.Auth.young);
  return (
    <HeroContainer>
      <Hero>
        <Content>
          <h1>
            <strong>{young.firstName},</strong> vous avez été dispensé(e) de séjour de cohésion
          </h1>
          {young.statusPhase1Motif ? (
            <p>Motif : {young.statusPhase1Motif === YOUNG_STATUS_PHASE1_MOTIF.OTHER ? `${young.statusPhase1MotifDetail}` : `${translate(young.statusPhase1Motif)}`}</p>
          ) : null}
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

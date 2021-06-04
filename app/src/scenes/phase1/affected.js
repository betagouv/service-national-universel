import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import { HeroContainer, Hero, Content, Separator } from "../../components/Content";
import NextStep from "./nextStep";
import api from "../../services/api";
import { translate } from "../../utils";
import DownloadConvocationButton from "../../components/buttons/DownloadConvocationButton";
import { environment } from "../../config";

import SelectMeetingPoint from "./SelectMeetingPoint";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [center, setCenter] = useState();
  const showConvocation = () => {
    return environment !== "production" && (young.meetingPointId || young.deplacementPhase1Autonomous === "true");
  };

  const goToConvocation = () => {
    if (document.getElementById) {
      const yOffset = -70; // header's height
      const element = document.getElementById("convocationPhase1");
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    (async () => {
      const { data, code, ok } = await api.get(`/cohesion-center/young/${young._id}`);
      if (!ok) return toastr.error("error", translate(code));
      setCenter(data);
    })();
  }, []);

  if (!center) return <div />;
  return (
    <>
      <HeroContainer>
        <Hero>
          <div className="content">
            <h1>
              <strong>Mon séjour de cohésion</strong>
            </h1>
            <p>
              Le SNU vous donne l'opportunité de découvrir la vie collective au sein d'un centre accueillant environ 200 jeunes de votre région pour créer ainsi des liens nouveaux
              et développer votre culture de l’engagement et ainsi affirmer votre place dans la société.
            </p>
            <p>Cette année, il se déroule du 21 juin au 2 juillet 2021. </p>
            <Separator />
            <p>
              <strong>Votre lieu d'affectation</strong>
              <br />
              Vous êtes actuellement affecté(e) à un centre de cohésion.
              <br />
              <span style={{ color: "#5145cd" }}>{`${center?.name}, ${center?.address} ${center?.zip} ${center?.city}, ${center?.department}, ${center?.region}`}</span>
            </p>
            {showConvocation() ? (
              <p>
                <a>
                  <strong style={{ textDecoration: "underline", cursor: "pointer" }} onClick={goToConvocation}>
                    Voir votre convocation
                  </strong>
                </a>
              </p>
            ) : null}
          </div>
          <div className="thumb" />
        </Hero>
      </HeroContainer>
      {environment !== "production" ? <SelectMeetingPoint /> : null}
      <NextStep />
      <HeroContainer>
        <Hero>
          <ContentHorizontal>
            <div>
              <h2>Comment bien préparer votre séjour de cohésion</h2>
              <p>Consultez le trousseau indicatif pour être sûr(e) de ne rien oublier</p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginLeft: "auto" }}>
              <a target="blank" href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/trousseauIndicatif.pdf">
                <ContinueButton>Consulter</ContinueButton>
              </a>
            </div>
          </ContentHorizontal>
        </Hero>
      </HeroContainer>
      {showConvocation() ? (
        <HeroContainer id="convocationPhase1">
          <Hero>
            <ContentHorizontal>
              <div>
                <h2>Votre convocation</h2>
                <p>Votre convocation sera à présenter à votre arrivée muni d'une pièce d'identité valide et de votre test PCR ou antigénique négatif de moins de 72 heures.</p>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginLeft: "auto", padding: "1rem" }}>
                <ContinueButton>
                  <DownloadConvocationButton young={young} uri="cohesion">
                    Télécharger&nbsp;ma&nbsp;convocation
                  </DownloadConvocationButton>
                </ContinueButton>
              </div>
            </ContentHorizontal>
          </Hero>
        </HeroContainer>
      ) : null}
    </>
  );
};

const ContentHorizontal = styled(Content)`
  display: flex;
  width: 100%;
  @media (max-width: 768px) {
    flex-direction: column;
  }

  .link {
    color: #5145cd;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    font-weight: 400;
    cursor: pointer;
  }
`;

const ContinueButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import { HeroContainer, Hero, Content, Separator, AlertBoxInformation } from "../../components/Content";
import NextStep from "./nextStep";
import api from "../../services/api";
import { translate } from "../../utils";
import DownloadConvocationButton from "../../components/buttons/DownloadConvocationButton";
import roundRight from "../../assets/roundRight.svg";
import roundLeft from "../../assets/roundLeft.svg";

import SelectMeetingPoint from "./SelectMeetingPoint";
//import Convocation from "./components/Convocation";

export default function Affected() {
  const young = useSelector((state) => state.Auth.young);
  const [center, setCenter] = useState();
  const [meetingPoint, setMeetingPoint] = useState();
  const [showInfoMessage, setShowInfoMessage] = useState(true);

  const isFromDOMTOM = () => {
    return ["Guadeloupe", "Martinique", "Guyane", "La Réunion", "Saint-Pierre-et-Miquelon", "Mayotte", "Saint-Martin", "Polynésie française", "Nouvelle-Calédonie"].includes(
      young.department,
    );
  };
  const showConvocation = () => {
    return isFromDOMTOM() || young.meetingPointId || young.deplacementPhase1Autonomous === "true";
  };

  const goToConvocation = () => {
    if (document.getElementById) {
      const yOffset = -70; // header's height
      const element = document.getElementById("convocationPhase1");
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo(0, y);
    }
  };

  const getMeetingPoint = async () => {
    const { data, code, ok } = await api.get(`/meeting-point/60be2c07470697204b84e679`);
    if (!ok) return toastr.error("error", translate(code));
    setMeetingPoint(data);
    console.log("POINT", data);
  };

  useEffect(() => {
    (async () => {
      const { data, code, ok } = await api.get(`/cohesion-center/young/${young._id}`);
      if (!ok) return toastr.error("error", translate(code));
      setCenter(data);
      getMeetingPoint();
    })();
  }, [young]);

  if (!center) return <div />;
  return (
    <>
      <HeroContainer>
        {showInfoMessage ? (
          <AlertBoxInformation
            title="Information"
            message="Suite au séjour de cohésion, les espaces volontaires vont s'actualiser dans les prochaines semaines, les attestations seront disponibles directement en ligne."
            onClose={() => setShowInfoMessage(false)}
          />
        ) : null}
        <Hero>
          <Section className="content">
            <h1>
              <strong>Mon séjour de cohésion </strong>
              <br /> <span>{translate(young.cohort)}</span>
            </h1>
            <p>
              Le SNU vous donne l&apos;opportunité de découvrir la vie collective au sein d&apos;un centre accueillant environ 200 jeunes de votre région pour créer ainsi des liens
              nouveaux et développer votre culture de l’engagement et ainsi affirmer votre place dans la société.
            </p>
            <Separator style={{ width: "150px" }} />
            <p>
              <strong style={{ color: "black" }}>Votre lieu d&apos;affectation</strong>
              <br />
              <strong>
                <span>Vous êtes actuellement affecté(e) au centre de cohésion de :</span>
              </strong>
              <br />
              <span style={{ color: "#5145cd" }}>{`${center?.name}, ${center?.address} ${center?.zip} ${center?.city}, ${center?.department}, ${center?.region}`}</span>
            </p>
            {showConvocation() ? (
              <>
                <p>
                  <a>
                    <strong style={{ textDecoration: "underline", cursor: "pointer" }} onClick={goToConvocation}>
                      Voir votre convocation
                    </strong>
                  </a>
                </p>
                <p>
                  <a href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/SNU_-_Réglement_intérieur.pdf" target="blank">
                    <strong style={{ textDecoration: "underline", cursor: "pointer", color: "#6b7280" }}>Voir règlement intérieur</strong>
                  </a>
                </p>
                <p>
                  <a href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/Protocole_sanitaire_ACM_avec_hebergement_post_CIC_070621.pdf" target="blank">
                    <strong style={{ textDecoration: "underline", cursor: "pointer", color: "#6b7280" }}>Voir protocole sanitaire des centres de séjour</strong>
                  </a>
                </p>
              </>
            ) : null}
          </Section>
          <div className="thumb" />
        </Hero>
      </HeroContainer>
      <HeroContainer id="convocationPhase1">
        <Hero>
          <Content style={{ width: "100%" }}>
            <Container>
              <section className="download">
                <div>
                  <h2>Votre convocation</h2>
                  <p>
                    Votre convocation sera à présenter à votre arrivée muni d&apos;une <strong>pièce d&apos;identité valide</strong> et de votre{" "}
                    <strong>test PCR ou antigénique négatif de moins de 72 heures </strong>
                    (recommandé)
                  </p>
                </div>
                <div className="button-container">
                  <ContinueButton>
                    <DownloadConvocationButton young={young} uri="cohesion">
                      Télécharger&nbsp;ma&nbsp;convocation
                    </DownloadConvocationButton>
                  </ContinueButton>
                </div>
              </section>
            </Container>
            <Separator />
            <Container>
              <h3>Mon point de rassemblement</h3>
              <p>{meetingPoint?.departureAddress}</p>
              <section className="meeting">
                <div className="meeting-dates">
                  <img src={roundRight} />
                  <article>
                    <p>ALLER</p>
                    <span>Le {meetingPoint?.departureAtString}</span>
                  </article>
                </div>
                <div className="meeting-dates">
                  <img src={roundLeft} />
                  <article>
                    <p>RETOUR</p>
                    <span>Le {meetingPoint?.returnAtString}</span>
                  </article>
                </div>
              </section>
            </Container>
          </Content>
        </Hero>
        {/* <Convocation /> */}
      </HeroContainer>
      {/* {isFromDOMTOM() ? (
        <HeroContainer>
          <Hero>
            <ContentHorizontal>
              <div>
                <h2>Point de rassemblement</h2>
                <p>Votre point de rassemblement vous sera communiqué par votre service régional</p>
              </div>
            </ContentHorizontal>
          </Hero>
        </HeroContainer>
      ) : (
        <SelectMeetingPoint />
      )} */}
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
    </>
  );
}

const Section = styled.section`
  h1 span {
    color: #2e2e2e;
    font-weight: 400;
  }
  p span {
    color: #888888;
  }
`;

const Container = styled.div`
  h2 {
    font-size: 2rem;
  }
  h3 {
    font-size: 1.2rem;
    font-weight: bold;
  }
  .meeting {
    img {
      width: 1.5rem;
      height: 1.5rem;
      margin: 1rem 0;
    }
    &-dates p {
      font-size: 1rem;
      font-weight: bold;
      color: black;
      margin-bottom: 0.5rem;
    }
  }
  .button-container {
    display: flex;
    justify-content: center;
  }
  @media (min-width: 768px) {
    .download {
      display: flex;
    }
    .button-container {
      justify-content: flex-end;
      align-items: center;
      margin-left: auto;
      padding: 1rem;
    }
    .meeting {
      display: grid;
      grid-template-columns: 1fr 1fr;
      &-dates {
        display: flex;
        align-items: center;
        text-align: left;
      }
      img {
        margin-right: 1rem;
        margin-bottom: 0;
      }
    }
  }
`;

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

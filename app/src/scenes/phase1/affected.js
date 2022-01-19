import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import { HeroContainer, Hero, Content, Separator, AlertBoxInformation } from "../../components/Content";
import NextStep from "./nextStep";
import api from "../../services/api";
import { translate } from "../../utils";
import { ConvocationDetails } from "./components/ConvocationDetails";
import { supportURL } from "../../config";
import Case from "../../assets/case";
import Question from "../../assets/question";

//import SelectMeetingPoint from "./SelectMeetingPoint";
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
            {/* À supprimer ? */}
            {/* {showConvocation() ? (
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
            ) : null} */}
          </Section>
          <div className="thumb" />
        </Hero>
      </HeroContainer>
      <GoodToKnow>
        <section className="good-article">
          <Case />
          <div className="good-article-text">
            <p>Dans ma valise, il y a...</p>
            <a href={`${supportURL}/base-de-connaissance/dans-ma-valise-materiel-trousseau-1`}>
              Comment bien <span>préparer son séjour ›</span>
            </a>
          </div>
        </section>
        <section className="good-article">
          <Question />
          <div className="good-article-text">
            <p>Vous avez des questions sur le séjour ?</p>
            <a href={`${supportURL}/base-de-connaissance`}>
              Consulter notre <span>base de connaissance ›</span>
            </a>
          </div>
        </section>
      </GoodToKnow>
      <HeroContainer id="convocationPhase1">
        <Hero>
          <Content style={{ width: "100%", padding: "3.2rem" }}>
            <ConvocationDetails young={young} center={center} meetingPoint={meetingPoint} />
          </Content>
        </Hero>
        {/* <Convocation /> */}
      </HeroContainer>
      <Documents>Documents à renseigner</Documents>
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

const GoodToKnow = styled.article`
  max-width: 1280px;
  margin: 2rem auto;
  padding: 0 2rem;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  .good-article {
    margin: 2rem;
    display: flex;
    align-items: center;
    &-text {
      margin-left: 1rem;
    }
  }
  a {
    color: #6c6c6c;
  }
  span {
    color: #5245cc;
    text-decoration: underline;
  }
  img {
    width: 1.5rem;
    margin-bottom: 1rem;
  }
  p {
    margin: 0;
    color: black;
    font-weight: bold;
  }
  @media (min-width: 1335px) {
    justify-content: center;
  }
`;

const Documents = styled.h2`
  max-width: 1280px;
  margin: 2rem auto;
  padding: 0 2rem;
  color: #6b7280;
  font-weight: bold;
  font-size: 2.25rem;
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

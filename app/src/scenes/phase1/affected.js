import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import { HeroContainer, Hero, Content, Separator, AlertBoxInformation } from "../../components/Content";
import NextStep from "./nextStep";
import api from "../../services/api";
import { translate, translateCohort } from "../../utils";
import ConvocationDetails from "./components/ConvocationDetails";
import Convocation from "./components/Convocation";
import { supportURL } from "../../config";
import Case from "../../assets/case";
import Question from "../../assets/question";
import Bouclier from "../../assets/bouclier";
import right from "../../assets/right.svg";

export default function Affected() {
  const young = useSelector((state) => state.Auth.young);
  const [center, setCenter] = useState();
  const [meetingPoint, setMeetingPoint] = useState();
  const [showInfoMessage, setShowInfoMessage] = useState(true);
  const [showConvocation, setShowConvocation] = useState(false);

  const getMeetingPoint = async () => {
    const { data, ok } = await api.get(`/young/${young._id}/meeting-point`);
    if (!ok) setMeetingPoint(null);
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
        <Hero style={{ flexDirection: "column" }}>
          <Section className="hero-container">
            <section className="content">
              <h1>
                <strong>Mon séjour de cohésion </strong>
                <br /> <span>{translateCohort(young.cohort)}</span>
              </h1>
              <p>
                Le SNU vous donne l&apos;opportunité de découvrir la vie collective au sein d&apos;un centre accueillant environ 200 jeunes de votre région pour créer ainsi des
                liens nouveaux et développer votre culture de l’engagement et ainsi affirmer votre place dans la société.
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
            </section>
            <div className="thumb" />
          </Section>
          <Separator style={{ margin: 0 }} />
          <Protocole href="https://www.jeunes.gouv.fr/Les-Protocoles-sanitaires-dans-les" target="_blank" rel="noreferrer">
            <span>
              <Bouclier />
              Protocole sanitaire en vigueur pour les Accueils Collectifs de Mineur
            </span>
            <img src={right} />
          </Protocole>
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
            <ConvocationDetails young={young} center={center} meetingPoint={meetingPoint} setShowConvocation={setShowConvocation} />
          </Content>
        </Hero>
      </HeroContainer>
      {showConvocation ? (
        <HeroContainer id="convocationPhase1">
          <Hero>
            <ContentHorizontal>
              <div>
                <h2>Votre convocation</h2>
                <p>
                  Votre convocation sera à présenter à votre arrivée muni d&apos;une pièce d&apos;identité valide et de votre test PCR ou antigénique négatif de moins de 72 heures
                  (recommandé)
                </p>
              </div>
            </ContentHorizontal>
          </Hero>
          <Convocation />
        </HeroContainer>
      ) : null}
      <Documents>Documents à renseigner</Documents>
      <NextStep />
    </>
  );
}

const Section = styled.section`
  display: flex;
  h1 span {
    color: #2e2e2e;
    font-weight: 400;
  }
  p span {
    color: #888888;
  }
`;

const Protocole = styled.a`
  padding: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    color: black;
  }
  svg {
    margin-right: 0.5rem;
    margin-bottom: 0.2rem;
  }
  img {
    display: none;
  }
  @media (min-width: 768px) {
    svg {
      margin-right: 3rem;
    }
    span {
      font-size: 1.2rem;
      display: block;
    }
    img {
      display: block;
      width: 0.8rem;
    }
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
    svg {
      min-width: 48px;
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
  @media (max-width: 360px) {
    .good-article {
      flex-direction: column;
    }
    svg {
      margin-bottom: 0.5rem;
    }
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

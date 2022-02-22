import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { HeroContainer, Hero, Content } from "../../components/Content";
import api from "../../services/api";
import { ENABLE_PM } from "../../utils";
import Question from "../../assets/Question"


export default () => {
  const young = useSelector((state) => state.Auth.young);

  const [referentManagerPhase2, setReferentManagerPhase2] = useState();
  useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/referent/manager_phase2/${young.department}`);
      if (ok) return setReferentManagerPhase2(data);
    })();
  }, []);
  const renderStep = () => {
    return (
      <>
        <HeroContainer>
          <Hero>
            <div className="content">
              <h1>
                Réalisez vos <strong>84 heures de mission d&apos;intérêt général</strong>
              </h1>
              <p>
                Partez à la découverte de l&apos;engagement en réalisant 84 heures de mission d&apos;intérêt général, au sein d&apos;une ou plusieurs structures, en contribuant à
                leurs activités concrètes !
              </p>
              <p>A vous de jouez : candidatez directement sur des missions parmi celles proposées dans cet espace !</p>
              <Separator />
              <p>
                <strong>Préférences de missions</strong>
                <br />
                Ces choix permettront à l&apos;administration de vous proposer des missions en cohérence avec vos motivations.
                <br />
                <Link to="/preferences">Renseigner mes préférences de missions {">"}</Link>
              </p>
              <p>
                <strong>Vos missions d&apos;intérêt général</strong>
                <br />
                Consulter des milliers de missions disponibles pour la réalisation de votre phase 2, candidatez-y, classez vos choix et suivez vos candidatures
                <br />
                <Link to="/mission">Trouver une mission {">"}</Link>
                {ENABLE_PM && (
                  <>
                    <br />
                    <Link to="/ma-preparation-militaire">Ma préparation militaire {">"}</Link>
                  </>
                )}
                <br />
                <Link to="/candidature">Suivre mes candidatures {">"}</Link>
              </p>
            </div>
            <div className="thumb" />
          </Hero>
        </HeroContainer>
        <GoodToKnow className="flex items-center justify-center mb-3">
          <Question class="h-12 w-12 border p-2 rounded-xl" />
          <div class="ml-3">
            <p class="!font-bold !text-black">Vous avez des questions sur la mission d'intérêt général ?</p>
            <a href={`https://support.snu.gouv.fr/base-de-connaissance/phase-2-la-mission-dinteret-general-1`} target="_blank" rel="noreferrer" >
              Consulter notre <span class="!text-snu-purple-200">base&nbsp;de&nbsp;connaissance&nbsp;›</span>
            </a>
          </div>
        </GoodToKnow>
        {referentManagerPhase2 ? (
          <HeroContainer>
            <Hero>
              <Content style={{ width: "100%" }}>
                <h2>Contactez votre référent pour plus d’informations</h2>
                {referentManagerPhase2?.firstName} {referentManagerPhase2?.lastName} -{" "}
                <StyledA href={`mailto:${referentManagerPhase2?.email}`}>{referentManagerPhase2?.email}</StyledA>
              </Content>
            </Hero>
          </HeroContainer>
        ) : null}
      </>
    );
  };

  return renderStep();
};
const Separator = styled.hr`
  margin: 2.5rem 0;
  height: 1px;
  border-style: none;
  background-color: #e5e7eb;
`;
const StyledA = styled.a`
  font-size: 1rem;
  color: #5145cd;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;

const GoodToKnow = styled.div`
    svg {
      min-width: 48px;
    }
`;
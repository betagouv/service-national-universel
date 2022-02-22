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
              <Separator />
              <p>
                <strong>Vos missions d&apos;intérêt général</strong>
                <br />
                {young.phase2NumberHoursDone ? (
                  <>
                    Vous avez réalisé {young.phase2NumberHoursDone} heures de mission d&apos;intérêt général.
                    <br />
                  </>
                ) : null}
                <Link to="/preferences">Renseigner mes préférences {">"}</Link>
                <br />
                <Link to="/mission">Trouver une mission {">"}</Link>
                {ENABLE_PM && (
                  <>
                    <br />
                    <Link to="/ma-preparation-militaire">Ma préparation militaire {">"}</Link>
                  </>
                )}
                <br />
                <Link to="/candidature">Suivez vos candidatures {">"}</Link>
              </p>
            </div>
            <div className="thumb" />
          </Hero>
        </HeroContainer>
            <div class="flex items-center justify-center">
              <Question class="h-12 w-12 border p-2 rounded-xl" />
              <div class="ml-3">
                <p class="!font-bold !text-black">Vous avez des questions sur la mission d'intérêt général ?</p>
                <a  href={`https://support.snu.gouv.fr/base-de-connaissance/phase-2-la-mission-dinteret-general-1`} target="_blank" rel="noreferrer" >
                Consulter notre <span class="!text-snu-purple-200">base&nbsp;de&nbsp;connaissance&nbsp;›</span>
                </a>
              </div>
            </div>
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


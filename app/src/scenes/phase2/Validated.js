import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import DownloadAttestationButton from "../../components/buttons/DownloadAttestationButton";
import MailAttestationButton from "../../components/buttons/MailAttestationButton";
import { HeroContainer, Hero, Content } from "../../components/Content";
import api from "../../services/api";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};

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
                <strong>{young.firstName}</strong>, vous avez validé votre Phase 2 !
              </h1>
              <p>Bravo pour votre engagement !</p>
              <Separator />
              <p>
                <strong>Mes missions réalisées</strong>
                <br />
                Retrouver l'historique de vos missions réalisées
                <br />
                <Link to="/candidature">Consulter mes missions réalisées {">"}</Link>
              </p>
              <p>
                <strong>Attestation de réalisation de Phase 2</strong>
                <br />
                Télécharger votre attestation de réalisation de votre phase 2
                <br />
                <DownloadAttestationButton young={young} uri="2">
                  Télécharger mon attestation {">"}
                </DownloadAttestationButton>
                <MailAttestationButton young={young} type="2" template="certificate" placeholder="Attestation de réalisation de la phase 2">
                  Envoyer l'attestation de réalisation par mail {">"}
                </MailAttestationButton>
              </p>
              {/* {young.statusPhase1 === "DONE" && young.statusPhase2 === "VALIDATED" ? (
              <>
                <Separator />
                <p>
                  <strong>Attestation de réalisation du SNU</strong>
                  <br />
                  Télécharger votre attestation de réalisation du SNU
                  <br />
                  <DownloadAttestationButton
                    style={{
                      color: "#5949d0",
                      textAlign: "left",
                      fontSize: "1rem",
                      cursor: "pointer",
                    }}
                    young={young}
                    uri="snu"
                  >
                    Télécharger mon attestation {">"}
                  </DownloadAttestationButton>
                </p>
              </>
            ) : null} */}
            </div>
            <div className="thumb" />
          </Hero>
        </HeroContainer>
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

import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import DownloadAttestationButton from "../../../components/buttons/DownloadAttestationButton";
import Hero from "../../../components/Hero";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};

  const renderStep = () => {
    return (
      <>
        <Hero>
          <div className="content">
            <h1>
              <strong>{young.firstName}</strong>, vous avez validé votre Phase 3 !
            </h1>
            <p>Félicitations, vous êtes allé(e) au bout de votre parcours SNU ! L’équipe du Service National Universel vous souhaite une belle continuation !</p>
            <Separator />
            <p>
              <strong>Mon engagement prolongé</strong>
              <br />
              Retrouver l'historique de votre mission de phase 3
              <br />
              <Link to="/phase3/valider">Consulter ma mission {">"}</Link>
            </p>
            <p>
              <strong>Attestation de réalisation de Phase 3</strong>
              <br />
              Télécharger votre attestation de réalisation de votre phase 3
              <br />
              <DownloadAttestationButton
                style={{
                  color: "#5949d0",
                  textAlign: "left",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
                young={young}
                uri="3"
              >
                Télécharger mon attestation {">"}
              </DownloadAttestationButton>
            </p>
            <p>
              <strong>S'engager au-delà du SNU</strong>
              <br />
              Si vous le souhaitez, vous pouvez prolonger encore votre engagement
              <br />
              <Link to="/phase3/les-programmes">Les possibilités d'engagement {">"}</Link>
              <br />
              <Link to="/phase3/mission">Trouver une mission {">"}</Link>
            </p>
          </div>
          <div className="thumb" />
        </Hero>
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

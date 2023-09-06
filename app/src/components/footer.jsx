import React from "react";
import { Container } from "reactstrap";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { supportURL } from "@/config";

export default function Footer() {
  console.log("location.pathname: ", location.pathname);
  if (
    ["/preinscription", "/auth", "/inscription2023", "/reinscription", "/representants-legaux", "/public-engagements", "/inscription", "/noneligible"].includes(location.pathname)
  ) {
    return null;
  }

  return (
    <FooterContainer>
      <Container>
        <ul>
          <li>
            <a href="https://www.snu.gouv.fr/mentions-legales" target="_blank" rel="noreferrer">
              Mentions légales
            </a>
          </li>
          <li>
            <a href="https://snu.gouv.fr/accessibilite" target="_blank" rel="noreferrer">
              Accessibilité
            </a>
          </li>
          <li>
            <a href="https://www.snu.gouv.fr/donnees-personnelles" target="_blank" rel="noreferrer">
              Données personnelles et cookies
            </a>
          </li>
          <li>
            <Link to="conditions-generales-utilisation">Conditions générales d&apos;utilisation</Link>
          </li>
          <li>
            <a href={supportURL} target="_blank" rel="noreferrer">
              Besoin d&apos;aide
            </a>
          </li>
        </ul>
        <p>Tous droits réservés - Ministère de l&apos;éducation nationale et de la jeunesse - {new Date().getFullYear()}</p>
        <ul>
          <li>
            <a href="https://www.gouvernement.fr/" target="_blank" rel="noreferrer">
              gouvernement.fr
            </a>
          </li>
          <li>
            <a href="https://www.education.gouv.fr/" target="_blank" rel="noreferrer">
              education.gouv.fr
            </a>
          </li>
          <li>
            <a href="http://jeunes.gouv.fr/" target="_blank" rel="noreferrer">
              jeunes.gouv.fr
            </a>
          </li>
          <li>
            <a href="https://presaje.sga.defense.gouv.fr/" target="_blank" rel="noreferrer">
              majdc.fr
            </a>
          </li>
          <li>
            <a href="https://www.service-public.fr/" target="_blank" rel="noreferrer">
              service-public.fr
            </a>
          </li>
          <li>
            <a href="https://www.legifrance.gouv.fr/" target="_blank" rel="noreferrer">
              legifrance.gouv.fr
            </a>
          </li>
          <li>
            <a href="https://www.data.gouv.fr/fr/" target="_blank" rel="noreferrer">
              data.gouv.fr
            </a>
          </li>
        </ul>
      </Container>
    </FooterContainer>
  );
}

const FooterContainer = styled.footer`
  text-align: center;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-left: 0;
  }
  padding: 5px 0;
  background: #fff;
  margin-top: auto;
  margin-left: 16rem;
  position: relative;
  z-index: 2;
  ul {
    margin: 10px 0;
  }
  li {
    display: inline-block;
    margin: 5px 10px;
    @media (max-width: 768px) {
      margin: 2px 5px;
    }
  }
  p,
  a {
    margin: 0;
    color: #6f7f98;
  }
  a:hover {
    color: #000;
  }
`;

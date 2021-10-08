import React from "react";
import { Container } from "reactstrap";
import styled from "styled-components";

export default () => {
  return (
    <Footer>
      <Container>
        <ul>
          <li>
            <a href="https://www.snu.gouv.fr/mentions-legales-10" target="_blank">
              Mentions légales
            </a>
          </li>
          <li>
            <a href="https://www.snu.gouv.fr/accessibilite-du-site-24" target="_blank">
              Accessibilité
            </a>
          </li>
          <li>
            <a href="https://www.snu.gouv.fr/donnees-personnelles-et-cookies-23" target="_blank">
              Données personnelles et cookies
            </a>
          </li>
          <li>
            <a href="https://www.snu.gouv.fr/besoin-d-aide" target="_blank">
              Besoin d'aide
            </a>
          </li>
          <li>
            <a href="https://www.snu.gouv.fr/foire-aux-questions-11" target="_blank">
              FAQ
            </a>
          </li>
        </ul>
        <p>Tous droits réservés - Ministère de l'éducation nationale, de la jeunesse et des sports - {new Date().getFullYear()}</p>
        <ul>
          <li>
            <a href="https://www.gouvernement.fr/" target="_blank">
              gouvernement.fr
            </a>
          </li>
          <li>
            <a href="https://www.education.gouv.fr/" target="_blank">
              education.gouv.fr
            </a>
          </li>
          <li>
            <a href="http://jeunes.gouv.fr/" target="_blank">
              jeunes.gouv.fr
            </a>
          </li>
          <li>
            <a href="https://presaje.sga.defense.gouv.fr/" target="_blank">
              majdc.fr
            </a>
          </li>
          <li>
            <a href="https://www.service-public.fr/" target="_blank">
              service-public.fr
            </a>
          </li>
          <li>
            <a href="https://www.legifrance.gouv.fr/" target="_blank">
              legifrance.gouv.fr
            </a>
          </li>
          <li>
            <a href="https://www.data.gouv.fr/fr/" target="_blank">
              data.gouv.fr
            </a>
          </li>
        </ul>
      </Container>
    </Footer>
  );
};

const Footer = styled.footer`
  text-align: center;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  padding: 5px 0;
  background: #fff;
  margin-top: auto;
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

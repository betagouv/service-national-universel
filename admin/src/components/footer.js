import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import styled from "styled-components";
import { adminURL } from "../config";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

export default function FooterComponent() {
  const user = useSelector((state) => state.Auth.user);
  const [from, setFrom] = useState();
  const history = useHistory();

  useEffect(() => {
    if (history) {
      return history.listen((location) => {
        console.log(location.pathname);
        setFrom(location.pathname);
      });
    }
  }, [history]);

  return (
    <Footer>
      <Container>
        <ul>
          <li>
            <a href="https://www.snu.gouv.fr/mentions-legales-10" target="_blank" rel="noreferrer">
              Mentions légales
            </a>
          </li>
          <li>
            <a href="https://www.snu.gouv.fr/accessibilite-du-site-24" target="_blank" rel="noreferrer">
              Accessibilité
            </a>
          </li>
          <li>
            <a href="https://www.snu.gouv.fr/donnees-personnelles-et-cookies-23" target="_blank" rel="noreferrer">
              Données personnelles et cookies
            </a>
          </li>
          <li>
            <a href={`${adminURL}/conditions-generales-utilisation`} target="_blank" rel="noreferrer">
              Conditions générales d&apos;utilisation
            </a>
          </li>
          <li>
            <a href={user ? `${adminURL}/besoin-d-aide?from=${from}` : `${adminURL}/public-besoin-d-aide?from=${window.location.pathname}`} target="_blank" rel="noreferrer">
              Besoin d&apos;aide
            </a>
          </li>
        </ul>
        <p>Tous droits réservés - Ministère de l&apos;éducation nationale, de la jeunesse et des sports - {new Date().getFullYear()}</p>
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
    </Footer>
  );
}

const Footer = styled.footer`
  text-align: center;
  font-size: 14px;
  padding: 5px 0;
  background: #fff;
  ul {
    margin: 10px 0;
  }
  li {
    display: inline-block;
    margin: 5px 10px;
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

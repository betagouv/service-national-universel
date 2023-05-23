import React, { useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { Container } from "reactstrap";
import styled from "styled-components";
import { appURL } from "../config";
import { useSelector } from "react-redux";

export default function Footer() {
  const young = useSelector((state) => state.Auth.young);
  const [from, setFrom] = useState();
  const [showOldFooter, setShowOldFooter] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (history) {
      return history.listen((location) => {
        setFrom(location.pathname);
      });
    }
  }, [history]);

  useEffect(() => {
    if (
      ["preinscription", "auth", "inscription2023", "reinscription", "representants-legaux", "public-engagements", "inscription", "noneligible"].findIndex((route) =>
        location.pathname.includes(route),
      ) === -1
    ) {
      setShowOldFooter(true);
    } else setShowOldFooter(false);
  }, [from]);

  return showOldFooter ? (
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
            <a href={`${appURL}/conditions-generales-utilisation`} target="_blank" rel="noreferrer">
              Conditions générales d&apos;utilisation
            </a>
          </li>
          <li>
            <NavLink to={young ? `/besoin-d-aide?from=${from}` : `/public-besoin-d-aide?from=${window.location.pathname}`}>Besoin d&apos;aide</NavLink>
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
  ) : null;
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

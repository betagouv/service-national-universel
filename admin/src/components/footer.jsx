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
        setFrom(location.pathname);
      });
    }
  }, [history]);

  return (
    <Footer>
      <Container>
        <ul>
          <li>
            <a href="https://www.snu.gouv.fr/mentions-legales" target="_blank" rel="noreferrer">
              Mentions légales
            </a>
          </li>
          <li>
            <a href="https://snu.gouv.fr/accessibilite/" target="_blank" rel="noreferrer">
              Accessibilité&nbsp;:&nbsp;non conforme
            </a>
          </li>
          <li>
            <a href="https://www.snu.gouv.fr/donnees-personnelles" target="_blank" rel="noreferrer">
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
        <ul className="mt-[8px]">
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
        <p className="mt-[24px]">Tous droits réservés - Ministère de l&apos;éducation nationale et de la jeunesse - {new Date().getFullYear()}</p>
      </Container>
    </Footer>
  );
}

const Footer = styled.footer`
  padding: 16px 0;
  min-height: 108px;
  text-align: center;
  font-size: 12px;
  line-height: 20px;
  font-weight: 400;
  background: #f3f4f6;
  li {
    display: inline-block;
    padding: 0 24px;
    border-right: 1px solid #d1d5db;
    &:last-child {
      border-right: none;
    }
  }
  p,
  a {
    color: #6f7f98;
  }
  a {
    margin: 0;
  }
  a:hover {
    color: #000;
  }

  @media (max-width: 768px) {
    li {
      display: block;
      padding: 0;
      border-right: none;
    }
  }
`;

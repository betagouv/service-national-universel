import React, { useEffect, useState } from "react";
import { Container, Modal } from "reactstrap";
import styled from "styled-components";
import { useCookies } from "react-cookie";
import CloseSvg from "../assets/Close";

export default function Cookie() {
  const [cookies, setCookie] = useCookies(["accept-cookie"]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (cookies["accept-cookie"] === "true") {
      //
    }
  }, [cookies]);

  if (["true", "false"].includes(cookies["accept-cookie"])) return null;

  return (
    <CookieContainer>
      <Modal size="lg" isOpen={open} scrollable={true} toggle={() => setOpen(false)}>
        <ModalContainer>
          <div style={{ display: "flex", width: "100%", justifyContent: "end", cursor: "pointer" }}>
            <CloseSvg className="close-icon" height={15} width={15} onClick={() => setOpen(false)} />
          </div>
          <Title style={{ textAlign: "center", color: "#1D4094", marginBottom: "30px", fontWeight: "600" }}>Gestion de vos cookies</Title>
          <TextBigModal style={{ fontWeight: "500" }}>
            Le Service National Universel s&apos;engage, dans le cadre des missions qui lui sont confiées, à assurer la protection, la confidentialité et la sécurité de
            l&apos;ensemble de vos données personnelles dans le respect de votre vie privée. Lorsque vous naviguez sur notre site, nous pouvons être amenés à déposer différents
            types de cookies sur votre terminal. Ils ont des finalités différentes décrites ci-dessous. Cette page vous permet de les accepter ou de les refuser de manière globale
            ou au cas par cas.
          </TextBigModal>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <ButtonModalBlue
              onClick={() => {
                setCookie("accept-cookie", "true", { path: "/", maxAge: 60 * 60 * 24 * 365 });
              }}>
              TOUT ACCEPTER
            </ButtonModalBlue>
            <ButtonModalRed
              onClick={() => {
                setCookie("accept-cookie", "false", { path: "/", maxAge: 60 * 60 * 24 * 365 });
              }}>
              TOUT REFUSER
            </ButtonModalRed>
          </div>
          <hr />
          <Subtitle>Nécessaires au bon fonctionnement du site</Subtitle>
          <TextModal>
            Ces cookies permettent de garantir des fonctionnalités importantes du site comme la mémorisation de l&apos;espace visité. Le site web ne pouvant fonctionner
            correctement sans eux, ils ne peuvent être désactivés.
          </TextModal>
          <hr />
          <Subtitle>Campagnes</Subtitle>
          <TextModal>
            Ces cookies sont utilisés pour diffuser des contenus ciblés en fonction de votre navigation. Ils permettent également d&apos;établir des statistiques anonymes de nos
            campagnes de communication, via Google Tag Manager, pour évaluer leur diffusion et leur efficacité.
          </TextModal>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "40px 0 10px 0" }}>
            <ButtonModalBlue
              onClick={() => {
                setCookie("accept-cookie", "true", { path: "/", maxAge: 60 * 60 * 24 * 365 });
              }}>
              ACCEPTER
            </ButtonModalBlue>
            <ButtonModalRed
              onClick={() => {
                setCookie("accept-cookie", "false", { path: "/", maxAge: 60 * 60 * 24 * 365 });
              }}>
              REFUSER
            </ButtonModalRed>
          </div>
          <hr />
          <Subtitle>Mesure d&apos;audience</Subtitle>
          <TextModal>Les services de mesure d&apos;audience permettent de générer des statistiques de fréquentation utiles à l&apos;amélioration du site.</TextModal>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "40px 0 10px 0" }}>
            <ButtonModalBlue
              onClick={() => {
                setCookie("accept-cookie", "true", { path: "/", maxAge: 60 * 60 * 24 * 365 });
              }}>
              ACCEPTER
            </ButtonModalBlue>
            <ButtonModalRed
              onClick={() => {
                setCookie("accept-cookie", "false", { path: "/", maxAge: 60 * 60 * 24 * 365 });
              }}>
              REFUSER
            </ButtonModalRed>
          </div>
          <hr />
        </ModalContainer>
      </Modal>
      <Container>
        <p>
          Ce site utilise des cookies qui nous permettent de vous proposer une navigation optimale, de mesurer l&apos;audience du site et de nos campagnes de communication, ainsi
          que de vous proposer des vidéos.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "15px", padding: "25px 0 15px 0" }}>
          <Button
            onClick={() => {
              setCookie("accept-cookie", "true", { path: "/", maxAge: 60 * 60 * 24 * 365 });
            }}>
            Tout accepter
          </Button>
          <Button
            onClick={() => {
              setCookie("accept-cookie", "false", { path: "/", maxAge: 60 * 60 * 24 * 365 });
            }}>
            Tout refuser
          </Button>
          <Button style={{ background: "#4766A9", color: "#fff" }} onClick={() => setOpen(true)}>
            Personnaliser
          </Button>
        </div>
        <a
          style={{ textDecoration: "underline", fontWeight: "200", cursor: "pointer" }}
          href={"https://www.snu.gouv.fr/donnees-personnelles-et-cookies-23"}
          target="_blank"
          rel="noreferrer">
          En savoir plus
        </a>
      </Container>
    </CookieContainer>
  );
}

const ModalContainer = styled.footer`
  padding: 30px;
  overflow: scroll;
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Title = styled.footer`
  text-align: center;
  color: #1d4094;
  margin-bottom: 30px;
  font-weight: 600;
  font-size: xx-large;
  @media (max-width: 768px) {
    font-size: x-large;
  }
`;

const Subtitle = styled.footer`
  color: #1d4094;
  font-weight: 500;
  padding: 3px 0 20px 0;
`;

const TextBigModal = styled.footer`
  font-weight: 500;
  padding-bottom: 20px;
  @media (max-width: 768px) {
    font-size: small;
  }
`;

const TextModal = styled.footer`
  font-size: smaller;
  font-weight: 500;
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const ButtonModalBlue = styled.button`
  padding: 4px 13px;
  border: 1px solid;
  background: #fff;
  border-radius: 50px;
  font-weight: 500;
  font-size: smaller;
  cursor: pointer;
  color: #1d4094;

  &:hover {
    background: #1d4094;
    color: #fff;
  }
`;

const ButtonModalRed = styled.footer`
  padding: 4px 13px;
  border: 1px solid;
  background: #fff;
  border-radius: 50px;
  font-weight: 500;
  font-size: smaller;
  cursor: pointer;
  color: #ac5355;

  &:hover {
    background: #ac5355;
    color: #fff;
  }
`;

const Button = styled.footer`
  background: #fff;
  display: inline-block;
  color: #142d68;
  font-weight: 500;
  border-radius: 2px;
  padding: 1px 7px;
  cursor: pointer;
`;

const CookieContainer = styled.footer`
  text-align: center;
  color: #fff;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  padding: 40px 0 15px 0;
  background: #142d68;
  position: fixed;
  bottom: 0px;
  width: 100%;
  z-index: 100;

  ul {
    margin: 10px 0;
  }

  li {
    display: inline-block;
    margin: 5px 10px;
  }

  a {
    margin: 0;
    color: #6f7f98;
  }

  a:hover {
    color: #000;
  }
`;

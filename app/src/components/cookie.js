import React, {useState} from "react";
import {Container, Modal} from "reactstrap";
import styled from "styled-components";
import {useSelector} from "react-redux";

export default function Cookie() {
  const young = useSelector((state) => state.Auth.young);
  const [open, setOpen] = useState(false);

  return (
    <CookieContainer>
      <Modal size="lg" isOpen={open} scrollable={true} toggle={()=>setOpen(false)}>
        <ModalContainer>
          <h2 style={{textAlign: "center", color: "#1D4094", marginBottom: "30px", fontWeight: "600"}}>Gestion de vos cookies</h2>
          <p style={{fontWeight: "500"}}>L'Assurance Maladie s'engage, dans le cadre des missions qui lui sont confiées, à assurer la protection, la confidentialité et la sécurité de l'ensemble de vos
            données personnelles dans
            le respect de votre vie privée. Lorsque vous naviguez sur notre site, nous pouvons être amenés à déposer différents types de cookies sur votre terminal. Ils ont des finalités différentes
            décrites ci-dessous. Cette page vous permet de les accepter ou de les refuser de manière globale ou au cas par cas.</p>
          <div style={{display: "flex", justifyContent: "flex-end", gap: "10px"}}>
            <ButtonModalBlue>TOUT ACCEPTER</ButtonModalBlue>
            <ButtonModalRed>TOUT REFUSER</ButtonModalRed>
          </div>
          <hr/>
          <Subtitle>Nécessaires au bon fonctionnement du site</Subtitle>
          <TextModal>Ces cookies permettent de garantir des fonctionnalités importantes du site comme la sélection de votre caisse à travers la saisie de votre code postal, la mémorisation de l'espace
            visité ou la personnalisation de l'affichage (version contrastée). Le site web ne pouvant fonctionner correctement sans eux, ils ne peuvent être désactivés.
          </TextModal>
          <hr/>
          <Subtitle>Campagnes</Subtitle>
          <TextModal>Ces cookies sont utilisés pour diffuser des contenus ciblés en fonction de votre navigation. Ils permettent également d'établir des statistiques anonymes de nos campagnes de
            communication, via Google Tag Manager, pour évaluer leur diffusion et leur efficacité.
          </TextModal>
          <div style={{display: "flex", justifyContent: "flex-end", gap: "10px", padding: "40px 0 10px 0"}}>
            <ButtonModalBlue>ACCEPTER</ButtonModalBlue>
            <ButtonModalRed>REFUSER</ButtonModalRed>
          </div>
          <hr/>
          <Subtitle>Mesure d'audience</Subtitle>
          <TextModal>Les services de mesure d'audience permettent de générer des statistiques de fréquentation utiles à l'amélioration du site.</TextModal>
          <div style={{display: "flex", justifyContent: "flex-end", gap: "10px", padding: "40px 0 10px 0"}}>
            <ButtonModalBlue>ACCEPTER</ButtonModalBlue>
            <ButtonModalRed>REFUSER</ButtonModalRed>
          </div>
          <hr/>
          <Subtitle>Vidéos</Subtitle>
          <TextModal>Ces cookies déposés via le service de partage de vidéos Vimeo vous permettent de visionner les contenus multimédia.</TextModal>
          <div style={{display: "flex", justifyContent: "flex-end", gap: "10px", padding: "40px 0 10px 0"}}>
            <ButtonModalBlue>ACCEPTER</ButtonModalBlue>
            <ButtonModalRed>REFUSER</ButtonModalRed>
          </div>
          <hr/>
          <Subtitle>Réseaux sociaux</Subtitle>
          <TextModal>Ces cookies déposés via les boutons réseaux sociaux permettent de faciliter le partage des contenus du site sur Facebook, Twitter ou LinkedIn.</TextModal>
          <div style={{display: "flex", justifyContent: "flex-end", gap: "10px", padding: "40px 0 10px 0"}}>
            <ButtonModalBlue>ACCEPTER</ButtonModalBlue>
            <ButtonModalRed>REFUSER</ButtonModalRed>
          </div>
          <hr/>
        </ModalContainer>
      </Modal>
      <Container>
        <p>Ce site utilise des cookies qui nous permettent de vous proposer une navigation optimale, de mesurer l'audience du site et de nos campagnes de communication, ainsi que de vous proposer
          des vidéos.</p>
        <div style={{display: "flex", justifyContent: "center", gap: "15px", padding: "25px 0 15px 0"}}>
          <Button onClick={() => console.log("TEST")}>Tout accepter</Button>
          <Button onClick={() => console.log("TEST")}>Tout refuser</Button>
          <Button style={{background: "#4766A9", color: "#fff"}} onClick={() => setOpen(true)}>Personnaliser</Button>
        </div>
        <a style={{textDecoration: "underline", fontWeight: "200", cursor: "pointer"}} href={"https://www.snu.gouv.fr/donnees-personnelles-et-cookies-23"}>En savoir plus</a>
      </Container>
    </CookieContainer>
  );
}

const ModalContainer = styled.footer`
  padding: 50px;
  overflow: scroll;
`;

const Subtitle = styled.footer`
  color: #1D4094;
  font-weight: 500;
  padding: 3px 0 20px 0;
`;

const TextModal = styled.footer`
  font-size: smaller;
  font-weight: 500;
`;

const ButtonModalBlue = styled.footer`
  padding: 4px 13px;
  border: 1px solid;
  background: #fff;
  border-radius: 50px;
  font-weight: 500;
  font-size: smaller;
  cursor: pointer;
  color: #1D4094;

  &:hover {
    background: #1D4094;
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
  color: #AC5355;

  &:hover {
    background: #AC5355;
    color: #fff;
  }
`;

const Button = styled.footer`
  background: #fff;
  display: inline-block;
  color: #142D68;
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
  background: #142D68;
  position: fixed;
  bottom: 0px;
  width: 100%;
  z-index: 10;

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

  a {
    margin: 0;
    color: #6f7f98;
  }

  a:hover {
    color: #000;
  }
`;

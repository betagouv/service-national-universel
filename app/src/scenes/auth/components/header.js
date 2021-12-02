import React from "react";
import styled from "styled-components";

export default function Header() {
  return (
    <HeaderContainer>
      <Logos>
        <a href="https://www.snu.gouv.fr/">
          <img className="mobileHide" src={require("../../../assets/fr.png")} height={80} />
        </a>
        <a href="https://www.snu.gouv.fr/">
          <img src={require("../../../assets/logo-snu.png")} height={80} />
        </a>
      </Logos>
      <Title>
        <h1>Connexion à votre espace</h1>
        <h3>Suivez les étapes de votre parcours SNU</h3>
      </Title>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.div`
  padding: 24px;
  background-color: #fff;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
  position: sticky;
  left: 0;
  top: 0;
  z-index: 20;
  @media (max-width: 768px) {
    .mobileHide {
      display: none;
    }
    position: relative;
  }
`;

const Logos = styled.div`
  display: flex;
  align-items: center;
  img {
    vertical-align: top;
    margin-right: 40px;
    height: 80px;
    @media (max-width: 768px) {
      height: 40px;
      .mobileHide {
        height: 80px;
      }
    }
  }
`;

const Title = styled.div`
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  h1 {
    color: #151d2f;
    font-size: 2rem;
    font-weight: 700;
  }
  h3 {
    color: #6a7181;
    font-size: 1.5rem;
  }
  @media (max-width: 768px) {
    h1 {
      font-size: 1.2rem;
    }
    h3 {
      font-size: 0.8rem;
    }
  }
`;

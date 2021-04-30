import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

export default ({ showMessage = true }) => {
  return (
    <Header>
      <Logos>
        <a href="https://www.snu.gouv.fr/">
          <img className="mobileHide" src={require("../../../assets/fr.png")} />
        </a>
        <a href="https://www.snu.gouv.fr/">
          <img src={require("../../../assets/logo-snu.png")} />
        </a>
      </Logos>
      {showMessage ? (
        <Title className="mobileHide">
          <h1>
            Inscriptions <span>au Service National Universel</span>
          </h1>
          <h3>Ouvertes jusqu'au 30 avril 2021</h3>
        </Title>
      ) : null}
      <AvatarContainer to="/auth/login">
        <Avatar src={require("../../../assets/avatar.jpg")} />
        <AvatarText>connexion</AvatarText>
      </AvatarContainer>
    </Header>
  );
};

const AvatarContainer = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AvatarText = styled.div`
  color: #aaa;
  text-transform: uppercase;
  font-size: 0.8rem;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  background-color: #aaa;
  border-radius: 50%;
  object-fit: cover;
  object-fit: contain;
  cursor: pointer;
`;

const Header = styled.div`
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
    padding: 12px 16px;
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
    height: 80px;
    @media (max-width: 768px) {
      height: 40px;
    }
  }
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: center;
  h1 {
    color: #151d2f;
    font-size: 1.5rem;
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

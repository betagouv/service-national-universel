import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { colors } from "../../../utils";

export default function HeaderComponent() {
  return (
    <Header>
      <Logos>
        <a href="https://www.snu.gouv.fr/">
          <img className="mobileHide" src={require("../../../assets/fr.png")} height={80} />
        </a>
        <a href="https://www.snu.gouv.fr/">
          <img src={require("../../../assets/logo-snu.png")} height={80} />
        </a>
      </Logos>
      <ButtonContainer>
        <Button style={{ borderBottom: "1px solid #f1f1f1" }}>
          <Link to="/auth">espace&nbsp;administrateur </Link>
        </Button>
        <Button>
          <a href="https://moncompte.snu.gouv.fr/" target="_blank" rel="noreferrer">
            espace&nbsp;volontaire
          </a>
        </Button>
      </ButtonContainer>
    </Header>
  );
}

const Header = styled.div`
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
  flex: 1;
  img {
    vertical-align: top;
    padding: 0.2rem 1rem;
    height: 80px;
    @media (max-width: 768px) {
      height: 40px;
      .mobileHide {
        height: 80px;
      }
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-left: 1px solid #f1f1f1;
`;

const Button = styled.div`
  color: ${colors.grey};
  text-transform: uppercase;
  font-size: 0.8rem;
  display: flex;
  :hover {
    background-color: #f1f1f1;
  }
  border: 1px solid #f1f1f1;
  > * {
    padding: 1rem;
    flex: 1;
    text-align: center;
  }
`;

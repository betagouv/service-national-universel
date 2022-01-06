import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { colors } from "../../../utils";
import { useSelector, useDispatch } from "react-redux";
import api from "../../../services/api";
import { setYoung } from "../../../redux/auth/actions";

export default function HeaderComponent({ location }) {
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  const logout = async () => {
    try {
      await api.post(`/young/logout`);
    } catch (error) {
      console.log({ error });
    }
    dispatch(setYoung(null));
  };

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
      <CTAContainer>
        {young ? (
          <AvatarText onClick={logout} to={{ pathname: "/", search: location?.search }}>
            Se deconnecter
          </AvatarText>
        ) : (
          <AvatarText onClick={() => window.plausible?.("Clic CTA - Connexion")} to={{ pathname: "/auth/login", search: location?.search }}>
            Se connecter
          </AvatarText>
        )}
        <AvatarText to={{ pathname: "/inscription/profil" }}>S&apos;inscrire</AvatarText>
      </CTAContainer>
    </Header>
  );
}

const CTAContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  justify-content: space-between;
  align-items: flex-end;
`;

const AvatarText = styled(Link)`
  color: #aaa;
  text-transform: uppercase;
  font-size: 0.9rem;
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
  cursor: pointer;
  :hover {
    color: ${colors.purple};
  }
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

import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";

import api from "../../../services/api";
import { setYoung } from "../../../redux/auth/actions";
import { STEPS } from "../utils";

export default ({ step }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  const currentIndex = Object.keys(STEPS).indexOf(step);

  const getStatus = (s) => {
    if (s === step) return "inprogress";
    const stepIndex = Object.keys(STEPS).indexOf(s);
    if (stepIndex > currentIndex) return "todo";
    return "done";
  };

  const logout = async () => {
    try {
      await api.post(`/young/logout`);
    } catch (error) {
      console.log({ error });
    }
    dispatch(setYoung(null));
    // window.location.href = "/";
  };

  const handleClick = (s) => {
    if (s === step || !young) return; //click on same step or not connected

    const stepIndex = Object.keys(STEPS).indexOf(s);
    const limitIndex = Object.keys(STEPS).indexOf(young.inscriptionStep);
    if (limitIndex < stepIndex) return;

    return history.push(`/inscription/${s.toLowerCase()}`);
  };

  return (
    <>
      <HeaderNav>
        <h1>
          Mon inscription <span className="mobileHide">au Service National Universel</span>
        </h1>
        {young ? (
          <div onClick={logout}>
            <Button>SE DÉCONNECTER</Button>
          </div>
        ) : (
          <Link to="/auth">
            <Button>SE CONNECTER</Button>
          </Link>
        )}
      </HeaderNav>
      <Topbar>
        <Element status={getStatus(STEPS.PROFIL)} onClick={() => handleClick(STEPS.PROFIL)}>
          <a>
            <span className="icon">
              <span>01</span>
            </span>
            <span className="text">Profil</span>
          </a>
        </Element>
        <Element status={getStatus(STEPS.COORDONNEES)} onClick={() => handleClick(STEPS.COORDONNEES)}>
          <a>
            <span className="icon">
              <span>02</span>
            </span>
            <span className="text">Coordonnées</span>
          </a>
        </Element>
        <Element status={getStatus(STEPS.PARTICULIERES)} onClick={() => handleClick(STEPS.PARTICULIERES)}>
          <a>
            <span className="icon">
              <span>03</span>
            </span>
            <span className="text">Situations particulières</span>
          </a>
        </Element>
        <Element status={getStatus(STEPS.REPRESENTANTS)} onClick={() => handleClick(STEPS.REPRESENTANTS)}>
          <a>
            <span className="icon">
              <span>04</span>
            </span>
            <span className="text">Représentants légaux</span>
          </a>
        </Element>
        <Element status={getStatus(STEPS.CONSENTEMENTS)} onClick={() => handleClick(STEPS.CONSENTEMENTS)}>
          <a>
            <span className="icon">
              <span>05</span>
            </span>
            <span className="text">Consentements</span>
          </a>
        </Element>
        <Element status={getStatus(STEPS.DOCUMENTS)} onClick={() => handleClick(STEPS.DOCUMENTS)}>
          <a>
            <span className="icon">
              <span>06</span>
            </span>
            <span className="text">Pièces justificatives</span>
          </a>
        </Element>
        <Element onClick={() => handleClick(STEPS.DONE)} style={{ flexGrow: 0 }}>
          <div className="logo" />
        </Element>
      </Topbar>
    </>
  );
};

const HeaderNav = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 0.5rem;
  margin-bottom: 1rem;
  justify-content: space-between;
  h1 {
    color: #6b7280;
    font-size: 1.5rem;
    font-weight: 500;
    margin-bottom: 0;
  }
  @media (max-width: 768px) {
    .mobileHide {
      display: none;
    }
  }
`;

const Button = styled.button`
  text-transform: capitalize;
  color: #4b5563;
  background-color: #fff;
  padding: 0.5rem 1rem;
  border: 0;
  outline: 0;
  white-space: nowrap;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.75rem;
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
  :hover {
    opacity: 0.9;
  }
`;

const Topbar = styled.ul`
  background-color: #fff;
  list-style: none;
  display: flex;
  justify-content: space-around;
  width: 100%;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  overflow-x: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  max-width: 1270px;
  margin: 0 auto 0.5rem;
`;

const Element = styled.li`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;

  .logo {
    font-size: 0;
    margin: 15px;
    background: url(${require("../../../assets/logo-snu.png")}) center no-repeat;
    background-size: contain;
    height: 35px;
    width: 35px;
    -webkit-filter: ${(props) => {
      if (props.status === "inprogress" || props.status === "done") return "";
      return "grayscale(100%)";
    }};
    filter: ${(props) => {
      if (props.status === "inprogress" || props.status === "done") return "";
      return "grayscale(100%)";
    }};
    opacity: ${(props) => {
      if (props.status === "inprogress" || props.status === "done") return "";
      return "0.4";
    }};
  }

  a {
    text-decoration: none;
    font-size: 14px;
    line-height: 1.2;
    font-weight: ${(props) => {
      if (props.status === "inprogress" || props.status === "done") return "600";
      return "400";
    }};
    color: ${(props) => {
      if (props.status === "todo") return "#949ca8!important";
      if (props.status === "inprogress") return "#362F78!important";
      if (props.status === "done") return "black!important";
      return "";
    }};

    position: relative;
    display: flex;
    align-items: center;
    padding: 5px;
    z-index: 2;
    cursor: pointer;
    .icon {
      background-color: ${(props) => {
        if (props.status === "inprogress" || props.status === "todo") return "#fff";
        if (props.status === "done") return "#362f78";
        return "";
      }};
      color: ${(props) => {
        if (props.status === "todo") return "#7A808C";
        if (props.status === "inprogress") return "#362f78";
        if (props.status === "done") return "#fff";
        return "";
      }};
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 2px solid;
      border-color: ${(props) => {
        if (props.status === "done" || props.status === "inprogress") return "#362f78";
        if (props.status === "todo") return "#D3D7DB";
        return "";
      }};
      margin: 10px;
    }
    &.done {
      color: #000;
    }
    &.active {
      color: #5145cd;
      ::before {
        border: 2px solid #5145cd;
      }
      ::after {
        border-left: 2px solid #5145cd;
        border-bottom: 2px solid #5145cd;
      }
    }
    &.done {
      ::before {
        background-color: #5145cd;
        border: 2px solid #5145cd;
      }
      ::after {
        border-left: 2px solid #fff;
        border-bottom: 2px solid #fff;
      }
    }
  }

  @media (max-width: 1240px) {
    .text {
      display: none;
    }
  }
`;

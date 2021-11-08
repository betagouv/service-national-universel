import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { STEPS } from "../utils";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import QuestionMark from "../../../assets/QuestionMark";

export default ({ step }) => {
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);

  const currentIndex = Object.keys(STEPS).indexOf(step);

  function getStatus(s) {
    if (s === step) return "inprogress";
    const stepIndex = Object.keys(STEPS).indexOf(s);
    if (stepIndex > currentIndex) return "todo";
    return "done";
  }

  const handleClick = (s) => {
    if (s === step || !young) return; //click on same step or not connected

    const stepIndex = Object.keys(STEPS).indexOf(s);
    const limitIndex = Object.keys(STEPS).indexOf(young.inscriptionStep);
    if (limitIndex < stepIndex) return;

    return history.push(`/inscription/${s.toLowerCase()}`);
  };

  return (
    <Sidebar>
      <MainNav>
        <li>
          <Header>
            <Logos>
              <a href="https://www.snu.gouv.fr/">
                <img src={require("../../../assets/fr.png")} />
              </a>
              <a href="https://www.snu.gouv.fr/">
                <img src={require("../../../assets/logo-snu.png")} />
              </a>
            </Logos>
          </Header>
          <ul className="stepNav">
            <Element status={getStatus(STEPS.PROFIL)}>
              <a onClick={() => handleClick(STEPS.PROFIL)}>Mon profil</a>
            </Element>
            <Element status={getStatus(STEPS.COORDONNEES)}>
              <a onClick={() => handleClick(STEPS.COORDONNEES)}>Coordonnées</a>
            </Element>
            <Element status={getStatus(STEPS.PARTICULIERES)}>
              <a onClick={() => handleClick(STEPS.PARTICULIERES)}>Situations particulières</a>
            </Element>
            <Element status={getStatus(STEPS.REPRESENTANTS)}>
              <a onClick={() => handleClick(STEPS.REPRESENTANTS)}>Représentants légaux</a>
            </Element>
            <Element status={getStatus(STEPS.CONSENTEMENTS)}>
              <a onClick={() => handleClick(STEPS.CONSENTEMENTS)}>Consentements</a>
            </Element>
            <Element status={getStatus(STEPS.DOCUMENTS)}>
              <a onClick={() => handleClick(STEPS.DOCUMENTS)}>Pièces justificatives</a>
            </Element>
            <Element status={getStatus(STEPS.AVAILABILITY)}>
              <a onClick={() => handleClick(STEPS.AVAILABILITY)}>Disponibilités</a>
            </Element>
          </ul>
        </li>
      </MainNav>
      <HelpButton to={young ? `/besoin-d-aide` : `/public-besoin-d-aide`} />
    </Sidebar>
  );
};

const HelpButton = ({ to }) => (
  <div className="help-button-container">
    <NavLink className="help-button" to={to}>
      <QuestionMark className="icon" />
      <div className="help-button-text">
        <div className="help-button-text-primary">Besoin d'aide ?</div>
        <div className="help-button-text-secondary">Tutoriels, contacts</div>
      </div>
    </NavLink>
  </div>
);

const Logos = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  img {
    vertical-align: top;
    height: 4rem;
    @media (max-width: 768px) {
      height: 3rem;
    }
  }
`;

const Header = styled.div`
  padding: 1.5rem 35px;
  margin-bottom: 2rem;
  background-color: #fff;
`;

const Sidebar = styled.div`
  background-color: #362f78;
  width: 320px;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  transition: 0.2s;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  @media (max-width: 768px) {
    display: none;
  }
  a {
    font-size: 12px;
    /* color: #b4c6fc; */
    color: #fff;
    display: flex;
    align-items: center;
    font-weight: 500;
    text-transform: uppercase;
    .icon {
      height: 24px;
      width: 24px;
      margin-right: 20px;
      svg {
        stroke: #8da2fb;
      }
    }
  }
  .help-button-container {
    margin: 2rem auto;
    justify-content: center;
    display: flex;
    .help-button {
      border: 1px solid #7786cf;
      border-radius: 0.3rem;
      padding: 0.5rem;
      align-items: center;
      display: flex;
      .icon {
        height: 1.5rem;
        width: 1.5rem;
        color: #7786cf;
        margin-right: 0.5rem;
      }
      .help-button-text {
        color: white;
        text-align: center;
        .help-button-text-primary {
          font-weight: 400;
          font-size: 0.9rem;
        }
        .help-button-text-secondary {
          font-weight: 300;
          font-size: 0.6rem;
        }
      }
      :hover {
        background: #7786cf;
        cursor: pointer;
        .icon {
          color: #fff;
        }
      }
    }
  }
`;

const Element = styled.li`
  a {
    cursor: pointer;
    display: block;
    color: #b4c6fc;
    position: relative;
    margin-bottom: 20px;
    padding-left: 25px;
    color: ${(props) => {
    if (props.status === "todo") return "#b4c6fc!important";
    if (props.status === "inprogress") return "#fff!important";
    if (props.status === "done") return "#fff!important";
    return "";
  }};
    font-weight: ${(props) => {
    if (props.status === "todo") return "400";
    if (props.status === "inprogress") return "600";
    if (props.status === "done") return "600";
    return "";
  }};

    ::before {
      display: ${(props) => {
    if (props.status === "todo") return "none";
    if (props.status === "inprogress") return "none";
    if (props.status === "done") return "block";
    return "";
  }};
      content: "";
      border-left: 2px solid #362f78;
      border-bottom: 2px solid #362f78;
      height: 5px;
      width: 8px;
      border-radius: 0;
      position: absolute;
      left: 0;
      top: 46.5%;
      transform: translatey(-50%) rotate(-45deg);
      z-index: 2;
    }
    ::after {
      content: "";
      display: ${(props) => {
    if (props.status === "todo") return "none";
    if (props.status === "inprogress") return "block";
    if (props.status === "done") return "block";
    return "";
  }};
      height: 8px;
      width: 8px;
      border-radius: 50%;
      position: absolute;
      left: 0;
      top: 50%;
      transform: translatey(-50%);
      z-index: 1;
      background-color: ${(props) => {
    if (props.status === "todo") return "#b4c6fc!important";
    if (props.status === "inprogress") return "#362f78!important";
    if (props.status === "done") return "#fff!important";
    return "";
  }};
      box-shadow: ${(props) => {
    if (props.status === "todo") return "";
    if (props.status === "inprogress") return " 0 0 0 4px #fff";
    if (props.status === "done") return " 0 0 0 4px #fff";
    return "";
  }};
    }
  }
`;

const MainNav = styled.ul`
  > li {
    background-size: 20px;
    padding-left: 0;
    margin-bottom: 15px;
    .icon {
      height: 32px;
      width: 32px;
      border-radius: 50%;
      background-color: #8da2fb;
      display: flex;
      align-items: center;
      justify-content: center;
      svg {
        stroke: #42389d;
        height: 20px;
      }
    }
    > a {
      cursor: pointer;
      text-transform: uppercase;
      color: #fff;
      display: block;
      font-size: 12px;
      padding: 15px 10px 15px 35px;
      height: 70px;
      font-weight: 700;
      position: relative;
      display: flex;
      align-items: center;
    }
    span {
      text-transform: none;
      display: block;
      color: #b4c6fc;
      font-size: 12px;
      font-weight: 400;
    }
    /* vertical line between */
    :not(:last-child) {
      position: relative;
      ::after {
        content: "";
        display: block;
        height: 100%;
        width: 2px;
        background-color: #8da2fb;
        position: absolute;
        left: 50px;
        top: 40px;
        z-index: -1;
      }
    }
  }
  li {
    a.done {
      .icon {
        background-color: #31c48d;
        svg {
          stroke: #fff;
        }
      }
    }
  }
  .stepNav {
    padding-left: 35px;
    a {
      cursor: pointer;
      display: block;
      color: #b4c6fc;
      position: relative;
      margin-bottom: 20px;
      padding-left: 25px;
      font-size: 14px;
      :hover {
        color: #fff;
        font-weight: 600;
        background-color: transparent;
        box-shadow: none;
      }
      ::after {
        content: "";
        display: block;
        height: 8px;
        width: 8px;
        border-radius: 50%;
        background-color: #fff;
        position: absolute;
        left: 0;
        top: 50%;
        transform: translatey(-50%);
        z-index: 1;
      }
    }
  }
`;

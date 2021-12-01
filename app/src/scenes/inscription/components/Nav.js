import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";

import api from "../../../services/api";
import { setYoung } from "../../../redux/auth/actions";
import { STEPS } from "../utils";
import BackIcon from "../../../components/BackIcon";

export default function Nav({ step }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  const logout = async () => {
    try {
      await api.post(`/young/logout`);
    } catch (error) {
      console.log({ error });
    }
    dispatch(setYoung(null));
    // window.location.href = "/";
  };

  const canGoToStep = (s) => {
    if (s === step || !young) return false; //click on same step or not connected

    const stepIndex = Object.keys(STEPS).indexOf(s);
    const limitIndex = Object.keys(STEPS).indexOf(young.inscriptionStep);

    if (stepIndex >= Object.keys(STEPS).length - 1 || stepIndex < 0) return false;
    if (limitIndex < stepIndex) return false;

    return true;
  };

  const handleClick = (s) => {
    if (!canGoToStep(s)) return;

    return history.push(`/inscription/${s.toLowerCase()}`);
  };

  const Step = ({ stepId, stepName, stepNumber }) => {
    const STEPSKeys = Object.keys(STEPS);
    const currentIndex = STEPSKeys.indexOf(step);

    const status = (() => {
      if (stepId === step) return "inprogress";
      const stepIndex = STEPSKeys.indexOf(stepId);
      if (stepIndex > currentIndex) return "todo";
      return "done";
    })();

    if (window.innerWidth > 1240) {
      return (
        <>
          <Element status={status} onClick={() => handleClick(stepId)}>
            <a>
              <span className="icon">
                <span>0{stepNumber}</span>
              </span>
              {status === "inprogress" && <span className="text">{stepName}</span>}
            </a>
          </Element>
          <Divider status={status} />
        </>
      );
    }

    if (status !== "inprogress") return <></>;

    const nextStepID = STEPSKeys[currentIndex + 1];
    const previousStepID = STEPSKeys[currentIndex - 1];
    return (
      <>
        <MobileNavigation style={{ marginLeft: "10px", opacity: previousStepID ? 1 : 0.4 }} onClick={() => handleClick(previousStepID)} disabled={!previousStepID}>
          <BackIcon fill="#362F78" />
        </MobileNavigation>
        <MobileCurrentStep>
          <span className="icon">
            <span>
              {stepNumber} / {STEPSKeys.length - 1}
            </span>
          </span>
          {/* <span className="text">{stepName}</span> */}
        </MobileCurrentStep>
        <MobileNavigation style={{ transform: "rotate(180deg)", marginRight: "10px" }} disabled={!nextStepID || !canGoToStep(nextStepID)} onClick={() => handleClick(nextStepID)}>
          <BackIcon fill="#362F78" />
        </MobileNavigation>
      </>
    );
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
        <Step stepId={STEPS.PROFIL} stepName="Profil" stepNumber="1" />
        <Step stepId={STEPS.COORDONNEES} stepName="Coordonnées" stepNumber="2" />
        <Step stepId={STEPS.PARTICULIERES} stepName="Situations particulières" stepNumber="3" />
        <Step stepId={STEPS.REPRESENTANTS} stepName="Représentants légaux" stepNumber="4" />
        <Step stepId={STEPS.CONSENTEMENTS} stepName="Consentements" stepNumber="5" />
        <Step stepId={STEPS.DOCUMENTS} stepName="Pièces justificatives" stepNumber="6" />
        <Step stepId={STEPS.AVAILABILITY} stepName="Disponibilités" stepNumber="7" />
        {window.innerWidth > 1240 && (
          <Element onClick={() => handleClick(STEPS.DONE)} style={{ flexGrow: 0 }}>
            <div className="logo" />
          </Element>
        )}
      </Topbar>
    </>
  );
}

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

const Divider = styled.div`
  flex-grow: 1;
  border-bottom: 2px solid;
  border-color: ${(props) => {
    if (props.status === "done") return "#362F78";
    return "#7F8591";
  }};
  margin: 5px;
  align-self: center;
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

const MobileCurrentStep = styled.li`
  flex-grow: 1;
  justify-content: center;
  align-self: center;
  margin: 15px;
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #362f78;
  margin: 0;

  .icon {
    width: 40px;
    height: 40px;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    margin: 10px;
  }
`;

const MobileNavigation = styled.li`
  margin-block: auto;
  cursor: pointer;
  opacity: ${(props) => (props.disabled ? 0.4 : 1)};
`;

const Element = styled.li`
  flex: 1;
  flex-grow: ${(props) => {
    if (props.status === "inprogress") return "1";
    return "0";
  }};
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
      flex-shrink: 0;
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

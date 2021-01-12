import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import Profil from "./stepProfil";
import Coordonnees from "./stepCoordonnees";
import Representants from "./stepRepresentants";
import Particulieres from "./stepParticulieres";
import Consentements from "./stepConsentements";
import Motivations from "./stepMotivations";
import Done from "./stepDone";
import api from "../../../services/api";
import { setYoung } from "../../../redux/auth/actions";

import Drawer from "./drawer";

import { STEPS } from "../utils";

export default (props) => {
  const [step, setStep] = useState(STEPS.REPRESENTANTS);
  const [initialData, setInitialData] = useState(null);

  const young = useSelector((state) => state.Auth.young);

  useEffect(() => {
    // `props.location.state.step` and `props.location.state.data` are sent by
    if (props.location && props.location.state && props.location.state.step) {
      setStep(props.location.state.step);
    } else if(young) {
      setStep(STEPS.COORDONNEES);
    }
    if (props.location && props.location.state && props.location.state.data) {
      setInitialData(props.location.state.data);
    }
  }, []);

  useEffect(() => {
    if (document.getElementsByTagName) {
      const inputElements = document.getElementsByTagName("input");
      for (let i = 0; inputElements[i]; i++) inputElements[i].setAttribute("autocomplete", "novalue");
    }
    window.scrollTo(0, 0);
  }, [step]);

  function renderStep() {
    if (step === STEPS.COORDONNEES) return <Coordonnees setStep={setStep} />;
    if (step === STEPS.PARTICULIERES) return <Particulieres setStep={setStep} />;
    if (step === STEPS.REPRESENTANTS) return <Representants setStep={setStep} initialData={initialData} />;
    if (step === STEPS.CONSENTEMENTS) return <Consentements setStep={setStep} />;
    if (step === STEPS.MOTIVATIONS) return <Motivations setStep={setStep} />;
    if (step === STEPS.DONE) return <Done setStep={setStep} />;
    return <Profil setStep={setStep} />;
  }

  return (
    <div>
      <Drawer setStep={setStep} step={step} />
      <Content>
        <Nav setStep={setStep} step={step} />
        <Wrapper>{renderStep()}</Wrapper>
      </Content>
    </div>
  );
};

const Nav = ({ setStep, step }) => {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();

  const currentIndex = Object.keys(STEPS).indexOf(step);

  const getStatus = (s) => {
    if (s === step) return "inprogress";
    const stepIndex = Object.keys(STEPS).indexOf(s);
    if (stepIndex > currentIndex) return "todo";
    return "done";
  };

  const logout = async () => {
    await api.post(`/young/logout`);
    window.location = "/";
  };

  return (
    <>
      <HeaderNav>
        <h1>
          Mon inscription <span className="mobileHide">au Service National Universel</span>
        </h1>
        {young ? (
          <div onClick={logout}>
            <Button>SE DECONNECTER</Button>
          </div>
        ) : (
          <Link to="/auth">
            <Button>SE CONNECTER</Button>
          </Link>
        )}
      </HeaderNav>
      <Topbar>
        <Element status={getStatus(STEPS.PROFIL)} onClick={() => setStep(STEPS.PROFIL)}>
          <a>Mon profil</a>
        </Element>
        <Element status={getStatus(STEPS.COORDONNEES)} onClick={() => setStep(STEPS.COORDONNEES)}>
          <a>Coordonnées</a>
        </Element>
        <Element status={getStatus(STEPS.PARTICULIERES)} onClick={() => setStep(STEPS.PARTICULIERES)}>
          <a>Situations particulières</a>
        </Element>
        <Element status={getStatus(STEPS.REPRESENTANTS)} onClick={() => setStep(STEPS.REPRESENTANTS)}>
          <a>Représentants légaux</a>
        </Element>
        <Element status={getStatus(STEPS.CONSENTEMENTS)} onClick={() => setStep(STEPS.CONSENTEMENTS)}>
          <a>Consentements</a>
        </Element>
        <Element status={getStatus(STEPS.MOTIVATIONS)} onClick={() => setStep(STEPS.MOTIVATIONS)}>
          <a>Motivations</a>
        </Element>
        <Element>{`${((currentIndex * 100) / (Object.keys(STEPS).length - 1)).toFixed(0)}%`}</Element>
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

const Content = styled.div`
  padding: 1rem;
  margin-left: 320px;
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const Wrapper = styled.div`
  margin: 20px auto;
  background-color: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  max-width: 1270px;
`;

const Topbar = styled.ul`
  background-color: #fff;
  list-style: none;
  display: flex;
  justify-content: space-between;
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
  margin: 0 auto 20px;
  @media (max-width: 1240px) {
    box-shadow: none;
    background-color: transparent;
  }
`;

const Element = styled.li`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  :not(:last-child)::after {
    content: "";
    display: block;
    height: 100%;
    width: 20px;
    background: url(${require("../../../assets/big-angle.svg")}) center top no-repeat;
    background-size: cover;
    position: absolute;
    top: 0;
    right: 0;
  }
  :last-child {
    color: #6b7280;
    padding: 20px;
    flex: 0 0 60px;
  }
  a {
    text-decoration: none;
    font-size: 14px;
    line-height: 1.2;
    font-weight: ${(props) => {
      if (props.status === "inprogress") return "500";
      return "300";
    }};
    color: ${(props) => {
      if (props.status === "todo") return "#949ca8!important";
      if (props.status === "inprogress") return "#584FEC!important";
      if (props.status === "done") return "black!important";
      return "";
    }};

    position: relative;
    display: block;
    padding: 15px;
    padding-left: 50px;
    z-index: 2;
    cursor: pointer;

    ::before {
      content: "";
      display: block;
      border: ${(props) => {
        if (props.status === "todo") return "2px solid #949ca8";
        if (props.status === "inprogress") return "2px solid #5850ec";
        if (props.status === "done") return "2px solid #5850ec";
        return "";
      }};
      background-color: ${(props) => {
        if (props.status === "todo") return "white";
        if (props.status === "inprogress") return "white";
        if (props.status === "done") return "#5850ec";
        return "";
      }};
      height: 25px;
      width: 25px;
      border-radius: 50%;
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
    }
    ::after {
      content: "";
      display: block;
      height: 7px;
      width: 11px;

      border-bottom: ${(props) => {
        if (props.status === "done") return "2px solid white";
        if (props.status === "inprogress") return "2px solid #5850ec";
        if (props.status === "todo") return "2px solid #949ca8";
      }};
      border-left: ${(props) => {
        if (props.status === "done") return "2px solid white";
        if (props.status === "inprogress") return "2px solid #5850ec";
        if (props.status === "todo") return "2px solid #949ca8";
      }};

      transform: translateY(-50%) rotate(-45deg);
      position: absolute;
      left: 22px;
      top: 48%;
      z-index: 2;
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

  @media (max-width: 1400px) {
    a {
      font-size: 12px;
      padding-left: 45px;
      ::before {
        left: 12px;
      }
      ::after {
        left: 19px;
      }
    }
  }

  @media (max-width: 1240px) {
    align-items: flex-start;
    :not(:last-child)::after {
      background: #949ca8;
      height: 2px;
      width: 100%;
      left: 20px;
      top: 18px;
      transform: translateY(-50%);
    }
    :last-child {
      font-size: 0;
      padding: 0;
      background: url(${require("../../../assets/logo-snu.png")}) center no-repeat;
      background-size: contain;
      height: 35px;
      width: 35px;
      flex: 0 0 3rem;
    }
    a {
      max-width: 3rem;
      padding: 45px 5px 0 5px;
      text-align: center;
      color: ${(props) => {
        if (props.status === "inprogress") return "#584FEC!important";
        return "transparent!important";
      }};
      ::before {
        top: 5px;
        left: 50%;
        transform: translateX(-50%);
        height: 25px;
        width: 25px;
        background-color: rgb(244, 245, 247);
      }
      ::after {
        top: 13px;
        left: 50%;
        transform: translateX(-50%) rotate(-45deg);
        height: 6px;
        width: 10px;
        border-bottom: ${(props) => {
          if (props.status === "done") return "2px solid #5850ec";
        }};
        border-left: ${(props) => {
          if (props.status === "done") return "2px solid #5850ec";
        }};
      }
    }
  }
  @media (max-width: 414px) {
    :last-child {
      flex: 0 0 2.5rem;
    }
    a {
      max-width: 2.5rem;
    }
  }
`;

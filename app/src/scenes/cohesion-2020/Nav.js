import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";

import api from "../../services/api";
import { setYoung } from "../../redux/auth/actions";
import { STEPS_2020 } from "../inscription/utils";

export default ({ step }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  const currentIndex = Object.keys(STEPS_2020).indexOf(step);

  const getStatus = (s) => {
    if (s === step) return "inprogress";
    const stepIndex = Object.keys(STEPS_2020).indexOf(s);
    if (stepIndex > currentIndex) return "todo";
    return "done";
  };

  const handleClick = (s) => {
    if (s === step || !young) return; //click on same step or not connected
    const stepIndex = Object.keys(STEPS_2020).indexOf(s);
    const limitIndex = Object.keys(STEPS_2020).indexOf(young.cohesion2020Step || "CONSENTEMENTS");
    if (limitIndex < stepIndex) return;

    return history.push(`/cohesion/${s.toLowerCase()}`);
  };

  return (
    <>
      <Topbar>
        <Element status={getStatus(STEPS_2020.CONSENTEMENTS)} onClick={() => handleClick(STEPS_2020.CONSENTEMENTS)}>
          <a>Consentements</a>
        </Element>
        <Element status={getStatus(STEPS_2020.COORDONNEES)} onClick={() => handleClick(STEPS_2020.COORDONNEES)}>
          <a>Coordonnées</a>
        </Element>
        <Element status={getStatus(STEPS_2020.PARTICULIERES)} onClick={() => handleClick(STEPS_2020.PARTICULIERES)}>
          <a>
            Situations <br />
            particulières
          </a>
        </Element>

        <Element status={getStatus(STEPS_2020.JDC)} onClick={() => handleClick(STEPS_2020.JDC)}>
          <a>Journée de Défense et Citoyenneté</a>
        </Element>
        <Element>{`${((currentIndex * 100) / (Object.keys(STEPS_2020).length - 1)).toFixed(0)}%`}</Element>
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
    background: url(${require("../../assets/big-angle.svg")}) center top no-repeat;
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
      background: url(${require("../../assets/logo-snu.png")}) center no-repeat;
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

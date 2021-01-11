import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

import { YOUNG_STATUS } from "../../utils";
import StepWaitingValidation from "./stepWaitingValidation";
import StepWaitingCorrection from "./stepWaitingCorrection";
import StepValidated from "./stepValidated";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};

  const renderStep = () => {
    if (young.status === YOUNG_STATUS.WAITING_CORRECTION) return <StepWaitingCorrection />;
    if (young.status === YOUNG_STATUS.WAITING_VALIDATION) return <StepWaitingValidation />;
    if (young.status === YOUNG_STATUS.VALIDATED) return <StepValidated />;
    return <div />;
  };

  return renderStep();
};

const Hero = styled.div`
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  .content {
    width: 65%;
    padding: 60px 30px 60px 50px;
    position: relative;
    background-color: #fff;
    > * {
      position: relative;
      z-index: 2;
    }
  }
  h1 {
    font-size: 50px;
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 400;
    line-height: 1;
  }
  p {
    color: #6b7280;
    font-size: 16px;
    font-weight: 400;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .thumb {
    min-height: 400px;
    background: url(${require("../../assets/phase3.jpg")}) no-repeat center;
    background-size: cover;
    flex: 1;
  }
`;

const BackButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 400;
  font-size: 16px;
  margin: 40px auto 0;
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
  :hover {
    opacity: 0.9;
  }
`;

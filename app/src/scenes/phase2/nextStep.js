import React, { useState } from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { Formik, Field } from "formik";
import DndFileInput from "../../components/dndFileInput";
import ErrorMessage, { requiredMessage } from "../inscription/components/errorMessage";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../redux/auth/actions";
import { translate } from "../../utils";
import { Link } from "react-router-dom";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [expandInfo, setExpandInfo] = useState(false);
  const dispatch = useDispatch();

  const toggleInfo = () => setExpandInfo(!expandInfo);

  return (
    <Hero style={{ flexDirection: "column" }}>
      <Content style={{ width: "100%" }}>
        <h1>Prochaine étape</h1>
        <p>Vous devez désormais réaliser votre mission d'intérêt général de Phase 2.</p>
      </Content>
      <ContentHorizontal style={{ width: "100%" }} id="sanitaire">
        <div className="icon">
          <svg className="h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            ></path>
          </svg>
        </div>
        <div>
          <h2>Préférences de mission</h2>
          <p>Ces choix permettront à l'administration de vous proposer des missions en cohérence avec vos motivations.</p>
        </div>
        <div style={{ minWidth: "30%", display: "flex", justifyContent: "flex-end", alignItems: "center", marginLeft: "1.5rem" }}>
          <Link to="/preferences">
            <ContinueButton>Renseigner mes préférences</ContinueButton>
          </Link>
        </div>
      </ContentHorizontal>
      <ContentHorizontal style={{ width: "100%" }} id="sanitaire">
        <div className="icon">
          <svg className="h-6 w-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <div>
          <h2>Votre mission d'intérêt général</h2>
          <p>Consulter des milliers de missions disponibles pour la réalisation de votre phase 2.</p>
        </div>
        <div style={{ minWidth: "30%", width: "100%", display: "flex", justifyContent: "flex-end", alignItems: "center", marginLeft: "1.5rem" }}>
          <Link to="/mission">
            <ContinueButton>Trouver une mission</ContinueButton>
          </Link>
        </div>
      </ContentHorizontal>
    </Hero>
  );
};

const Hero = styled.div`
  border-radius: 0.5rem;
  @media (max-width: 768px) {
    border-radius: 0;
  }
  max-width: 80rem;
  margin: 1rem auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  .content {
    width: 65%;
    padding: 60px 30px 60px 50px;
    @media (max-width: 768px) {
      width: 100%;
      padding: 30px 10px 30px 20px;
    }
    position: relative;
    background-color: #fff;
    > * {
      position: relative;
      z-index: 2;
    }
  }
  h1 {
    font-size: 3rem;
    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 500;
    line-height: 1;
  }
  h1 {
    font-size: 3rem;
    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 500;
    line-height: 1;
  }
  h2 {
    font-size: 1.5rem;
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 700;
    line-height: 1;
  }
  p {
    color: #6b7280;
    font-size: 1.25rem;
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    font-weight: 400;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }
  .thumb {
    min-height: 400px;
    background: url(${require("../../assets/phase3.jpg")}) no-repeat center;
    background-size: cover;
    flex: 1;
  }
`;

const Content = styled.div`
  margin-top: ${({ showAlert }) => (showAlert ? "2rem" : "")};
  width: 65%;
  @media (max-width: 768px) {
    width: 100%;
  }
  padding: 60px 30px 60px 50px;
  @media (max-width: 768px) {
    width: 100%;
    padding: 30px 15px 30px 15px;
  }
  position: relative;
  background-color: #f9fafb;
  > * {
    position: relative;
    z-index: 2;
  }
  .icon {
    margin-right: 1rem;
    svg {
      width: 1.5rem;
      stroke: #5145cd;
    }
  }
  :not(:last-child) {
    border-bottom-width: 1px;
    border-color: #d2d6dc;
    border-bottom-style: dashed;
  }
  h2 {
    font-size: 1.5rem;
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 700;
    line-height: 1;
  }
  p {
    color: #6b7280;
    margin-top: 0.5rem;
    font-size: 1.125rem !important;
    @media (max-width: 768px) {
      font-size: 0.8rem !important;
    }
    font-weight: 400 !important;
  }
`;

const ContentHorizontal = styled(Content)`
  display: flex;
  width: 100%;

  .link {
    color: #5145cd;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    font-weight: 400;
    cursor: pointer;
  }
`;

const ContinueButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  margin-top: 40px;
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;

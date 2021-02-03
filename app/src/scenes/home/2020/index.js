import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";
import NextStep from "../../phase2/nextStep";

export default () => {
  const young = useSelector((state) => state.Auth.young);

  const goTo = (id) => {
    if (document.getElementById) {
      const yOffset = -70; // header's height
      const element = document.getElementById(id);
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <>
      <Hero>
        <Content>
          <h1>
            <strong>{young.firstName},</strong> ravis de vous retrouver !
          </h1>
          <p>Votre espace volontaire vous accompagne à chaque étape de votre SNU.</p>
          <p style={{ color: "#161e2e", fontSize: "1.5rem", fontWeight: 700 }}>Votre parcours</p>
          <WrapperItem>
            {/* todo add tag CANCEL */}
            <div className="title">
              1. Un séjour de cohésion <Tag color="#c81e1e">Phase annulée</Tag>
            </div>
            <div className="info">
              <div className="subtitle">Séjour annulé suite à la crise sanitaire.</div>
              <div className="subtitle">Vous pouvez cependant demander à participer à la session 2021.</div>
            </div>
          </WrapperItem>
          <WrapperItem>
            {/* todo add tag IN_PROGRESS */}
            <div className="title">
              2. Une première mission d'intérêt général <Tag color="#5145cd">En cours</Tag>
            </div>
            <div className="info">
              <div className="subtitle">À réaliser dans l’année, jusqu’au 31 juin 2021.</div>
            </div>
          </WrapperItem>
          <WrapperItem>
            <div className="title">3. Un engagement vers une société plus solidaire</div>
            <div className="info">
              <div className="subtitle">À réaliser avant vos 25 ans</div>
            </div>
          </WrapperItem>
        </Content>
        <div className="thumb" />
      </Hero>
      <NextStep />
    </>
  );
};

const Tag = styled.span`
  color: ${({ color }) => color || "#42389d"};
  background-color: ${({ color }) => `${color}11` || "#42389d22"};
  padding: 0.25rem 0.75rem;
  margin: 0 0.25rem;
  border-radius: 99999px;
  font-size: 0.85rem;
  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.1rem 0.5rem;
  }
`;

const WrapperItem = styled.div`
  margin-bottom: 1rem;
  .info {
    margin-left: 1.5rem;
    .subtitle {
      color: #6b7280;
      font-size: 0.875rem !important;
      font-weight: 500;
    }
    .link {
      color: #6b7280;
      font-size: 0.875rem;
      font-weight: 400;
      span {
        color: #5145cd;
        cursor: pointer;
      }
    }
  }
  .title {
    color: #161e2e;
    font-size: 1.25rem !important;
    font-weight: 500;
  }
`;

const Content = styled.div`
  width: 65%;
  padding: 60px 30px 60px 50px;
  @media (max-width: 768px) {
    width: 100%;
    padding: 30px 15px 30px 15px;
  }
  position: relative;
  background-color: #fff;
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
`;

const Hero = styled.div`
  border-radius: 0.5rem;
  @media (max-width: 768px) {
    border-radius: 0;
  }
  max-width: 80rem;
  margin: 0 auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  .content {
    width: 65%;
    @media (max-width: 768px) {
      width: 100%;
    }
    padding: 60px 30px 60px 50px;
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
  p {
    color: #6b7280;
    font-size: 1.25rem;
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    font-weight: 400;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .thumb {
    min-height: 400px;
    background: url(${require("../../../assets/phase3.jpg")}) no-repeat center;
    background-size: cover;
    flex: 1;
  }
`;

const Alert = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #31c48d;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  padding: 10px 20px;
  position: absolute;
  z-index: 10;
  width: 100%;
  .text {
    margin: 0 20px;
    color: #fff;
    strong {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 3px;
    }
  }
  img {
    position: absolute;
    right: 0;
    margin-right: 1rem;
    cursor: pointer;
  }
`;

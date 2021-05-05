import React, { useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { HeroContainer, Hero } from "../../components/Hero";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <HeroContainer>
      <Hero>
        {showAlert && (
          <Alert>
            <div className="text">
              <strong>CANDIDATURE REFUSÉE</strong>
            </div>
            <img src={require("../../assets/close.svg")} height={15} onClick={() => setShowAlert(false)} />
          </Alert>
        )}
        <Content showAlert={showAlert}>
          <h1>
            <strong>{young.firstName},</strong> votre candidature a été refusée.
          </h1>
          <p>Votre candidature n'a pas pu être retenue pour l'édition 2021 du Service National Universel.</p>
          <p>Nous vous souhaitons une bonne continuation !</p>
        </Content>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
};

const Content = styled.div`
  margin-top: ${({ showAlert }) => (showAlert ? "2rem" : "")};
  width: 50%;
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
`;

const Alert = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f05252;
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
    margin: 1rem;
    cursor: pointer;
  }
`;

const Heading = styled.div`
  width: 100%;
  margin: 40px auto 30px auto;
  text-align: center;
  h2 {
    color: #161e2e;
    font-size: 34px;
    font-weight: 700;
  }
  p {
    color: #6b7280;
    font-size: 18px;
  }
`;

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
              <strong>INSCRIPTION SUR LISTE COMPLÉMENTAIRE</strong>
            </div>
            <img src={require("../../assets/close.svg")} height={15} onClick={() => setShowAlert(false)} />
          </Alert>
        )}
        <Content showAlert={showAlert}>
          <h1>
            <strong>{young.firstName},</strong> bienvenue dans votre espace personnel.
          </h1>
          <p>
            Votre candidature a été placée <b style={{ color: "#5145cd" }}>en liste complémentaire</b> par l'administration. Vous serez informé(e) par e-mail si une place venait à
            se libérer vous permettant ainsi de participer au SNU.
          </p>
          <Separator />
          <p style={{ fontSize: "1.125rem" }}>
            Si vous avez la moindre question, trouvez toutes les réponses à vos questions en consultant la{" "}
            <a href="https://www.snu.gouv.fr/foire-aux-questions-11" target="blank" style={{ color: "#5145cd" }}>
              FAQ
            </a>{" "}
            du SNU.
          </p>
        </Content>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
};

const Separator = styled.hr`
  margin: 2.5rem 0;
  height: 1px;
  border-style: none;
  background-color: #e5e7eb;
`;

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
  background-color: #5949d0;
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

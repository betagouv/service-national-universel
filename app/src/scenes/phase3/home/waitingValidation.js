import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import DownloadAttestationButton from "../../../components/buttons/DownloadAttestationButton";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};

  const renderStep = () => {
    return (
      <>
        <Hero>
          <div className="content">
            <h1>
              <strong>{young.firstName}</strong>, votre Phase 3 est en attente de validation !
            </h1>
            <p>Votre tuteur de mission doit examiner le formulaire de validation que vous avez déposé puis le confirmer.</p>
            <Separator />
            <p>
              <strong>Suivre la validation de mon engagement prolongé</strong>
              <br />
              Vous pouvez suivre l'avancement de la validation de votre mission par votre tuteur.
              <br />
              <Link to="/phase3/valider">Suivre l'avancement {">"}</Link>
            </p>
          </div>
          <div className="thumb" />
        </Hero>
      </>
    );
  };

  return renderStep();
};
const Separator = styled.hr`
  margin: 2.5rem 0;
  height: 1px;
  border-style: none;
  background-color: #e5e7eb;
`;
const Hero = styled.div`
  border-radius: 0.5rem;
  margin: 1rem auto;
  max-width: 80rem;
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
    -webkit-box-orient: vertical;
    overflow: hidden;
    a {
      font-size: 1rem;
      color: #5949d0;
      :hover {
        text-decoration: underline;
      }
    }
  }
  .thumb {
    min-height: 400px;
    background: url(${require("../../../assets/phase3.jpg")}) no-repeat center;
    background-size: cover;
    flex: 1;
  }
`;

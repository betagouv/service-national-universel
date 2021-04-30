import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";
import Hero from "../../components/Hero";

export default () => {
  const young = useSelector((state) => state.Auth.young);

  return (
    <>
      <Hero>
        <Content>
          <h1>
            <strong>{young.firstName},</strong> dommage que vous nous quittiez !
          </h1>
          <p>Votre désistement du SNU a bien été pris en compte.</p>
          <p>Si l'engagement vous donne envie, vous trouverez ci-dessous des dispositifs qui pourront vous intéresser.</p>
          <p>
            Bonne continuation, <br />
            Les équipes du Service National Universel
          </p>
          <Separator />
          <Link to="/phase3/les-programmes">
            <Button>Consulter les autres possibilités d'engagement</Button>
          </Link>
        </Content>
        <div className="thumb" />
      </Hero>
    </>
  );
};

const Separator = styled.hr`
  margin: 2.5rem 0;
  height: 1px;
  border-style: none;
  background-color: #e5e7eb;
`;

const Button = styled.button`
  display: inline-block;
  padding: 10px 40px;
  background-color: #5145cd;
  color: #fff;
  font-size: 16px;
  text-align: center;
  font-weight: 700;
  margin: 25px auto 10px;
  border-radius: 30px;
  border: none;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
`;

const Content = styled.div`
  margin-top: ${({ showAlert }) => (showAlert ? "2rem" : "")};
  width: 50%;
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

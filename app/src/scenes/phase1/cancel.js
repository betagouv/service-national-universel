import React from "react";
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
            <strong>{young.firstName},</strong> votre séjour a été annulé suite à la crise sanitaire !
          </h1>
          <div style={{ marginTop: "1rem", fontStyle: "italic" }}>
            Si vous n'avez pas réalisé votre JDC, nous vous invitons à vous inscrire sur{" "}
            <a href="http://majdc.fr" target="_blank">
              majdc.fr
            </a>{" "}
            et à demander à être convoqué pour une session en ligne.
          </div>
        </Content>
        <div className="thumb" />
      </Hero>
    </>
  );
};

const Content = styled.div`
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

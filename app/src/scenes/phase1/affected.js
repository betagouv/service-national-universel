import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { HeroContainer, Hero, Content, Separator } from "../../components/Content";
import NextStep from "./nextStep";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import { translate } from "../../utils";

export default () => {
  const young = useSelector((state) => state.Auth.young);

  const [center, setCenter] = useState();

  useEffect(() => {
    (async () => {
      const { data, code, ok } = await api.get(`/cohesion-center/young/${young._id}`);
      if (!ok) return toastr.error("error", translate(code));
      setCenter(data);
    })();
  }, []);

  if (!center) return <div />;
  return (
    <HeroContainer>
      <Hero>
        <div className="content">
          <h1>
            <strong>Mon séjour de cohésion</strong>
          </h1>
          <p>
            Le SNU vous donne l'opportunité de découvrir la vie collective au sein d'un centre accueillant environ 200 jeunes de votre région pour créer ainsi des liens nouveaux et
            développer votre culture de l’engagement et ainsi affirmer votre place dans la société.
          </p>
          <p>Cette année, il se déroule du 21 juin au 2 juillet 2021. </p>
          <Separator />
          <p>
            <strong>Votre lieu d'affectation</strong>
            <br />
            Vous êtes actuellement affecté(e) à un centre de cohésion.
            <br />
            <span style={{ color: "#5145cd" }}>{`${center?.name}, ${center?.address} ${center?.zip} ${center?.city}, ${center?.department}, ${center?.region}`}</span>
          </p>
        </div>
        <div className="thumb" />
      </Hero>
      <NextStep />
      <Hero>
        <ContentHorizontal>
          <div>
            <h2>Comment bien préparer votre séjour de cohésion</h2>
            <p>Consultez le trousseau indicatif pour être sûr(e) de ne rien oublier</p>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginLeft: "auto" }}>
            <a target="blank" href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/trousseauIndicatif.pdf">
              <ContinueButton>Consulter</ContinueButton>
            </a>
          </div>
        </ContentHorizontal>
      </Hero>
    </HeroContainer>
  );
};

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
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;

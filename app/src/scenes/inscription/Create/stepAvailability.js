import React from "react";
import styled from "styled-components";

import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { HERO_IMAGES_LIST } from "../../../utils";
import InfoIcon from "../../../components/InfoIcon";
import BackIcon from "../../../components/BackIcon";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }

  return (
    <>
      <Container>
        <Info>
          <div className="back">
            <BackIcon color="#9CA3AF" style={{ marginRight: "7px" }} />
            <p>Session de Février</p>
          </div>
          <h3>Séjour de cohésion à venir</h3>
          <h1>Etes-vous disponible du 13 au 25 février 2022 ?</h1>
          <AlerteInfo>
            Vous bénéficierez d'une autorisation d'absence de votre établissement scolaire pour la semaine de cours à laquelle vous n'assistierez pas, si vous êtes scolarisé(e) en
            zone B ou C.
          </AlerteInfo>
          <div class="btns">
            <Button backgroundColor="#4f46e5" dark>
              Je suis disponible pour la session de février
            </Button>
            <Button borderColor="#D1D5DB">Non je ne suis pas disponible</Button>
          </div>
        </Info>
        <div className="thumb" />
      </Container>
    </>
  );
};

const AlerteInfo = ({ children }) => (
  <div style={{ display: "flex", color: "#32257f", backgroundColor: "#edecfc", padding: "1rem", borderRadius: "6px" }}>
    <InfoIcon color="#32257F" style={{ flex: "none" }} />
    <div style={{ fontSize: ".9rem", marginLeft: "5px" }}>{children}</div>
  </div>
);

const Info = styled.div`
  flex: 1.5;
  padding: 5rem;
  @media (max-width: 768px) {
    padding: 1rem 0;
  }

  h1 {
    color: #111827;
    font-size: 2rem;
    margin-block: 0.5rem 2.5rem;
  }

  h3 {
    text-transform: uppercase;
    color: #4f46e5;
    letter-spacing: 0.05em;
    font-size: 16px;
  }

  p {
    margin: 0;
  }

  .btns {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .back {
    display: flex;
    align-items: center;
    color: #6b7280;
    margin-bottom: 2rem;
  }
`;

const Button = styled.div`
  margin: 3rem 1rem 1rem 0rem;
  padding: 0.5rem 1rem;
  background-color: ${({ backgroundColor }) => backgroundColor || ""};
  border: 1px solid ${({ borderColor }) => borderColor || ""};
  color: ${({ dark }) => (dark ? "#fff" : "#374151")};
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  width: fit-content;

  &:last-child {
    margin-right: 0rem;
  }
`;

const Container = styled.div`
  display: flex;

  .thumb {
    min-height: 400px;
    @media (max-width: 768px) {
      min-height: 0;
    }
    ${({ thumbImage = HERO_IMAGES_LIST[Math.floor(Math.random() * HERO_IMAGES_LIST.length)] }) => `background: url(${require(`../../../assets/${thumbImage}`)}) no-repeat center;`}
    background-size: cover;
    flex: 1;
    -webkit-clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
    clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
  }
`;

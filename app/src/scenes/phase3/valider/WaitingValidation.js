import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";

import YoungMissionCard from "../components/YoungMissionCard";

export default () => {
  const young = useSelector((state) => state.Auth.young);

  return (
    <Wrapper>
      <Infos>
        Votre phase 3 est en <b>attente de validation</b>.
        <br />
        Votre demande a bien été prise en compte, {young.phase3TutorFirstName} {young.phase3TutorLastName} va prendre connaissance de votre demande.
      </Infos>
      <YoungMissionCard />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 1rem;
  width: 100%;
  .detail {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
    text-align: left;
    margin-top: 1rem;
    &-title {
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
    }
  }
  p {
    font-size: 13px;
    color: #798399;
    margin-top: 1rem;
  }
`;

const Infos = styled.div`
  color: #6b7280;
  font-style: italic;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

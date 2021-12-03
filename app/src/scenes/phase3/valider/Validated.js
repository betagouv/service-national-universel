import React from "react";
import styled from "styled-components";

import YoungMissionCard from "../components/YoungMissionCard";

export default function Validated() {
  return (
    <Wrapper>
      <SuccessMessage>
        <Logo>
          <svg height={64} width={64} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#057a55" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </Logo>
        Votre phase 3 a été validée !
      </SuccessMessage>
      <YoungMissionCard />
    </Wrapper>
  );
}

const Logo = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background-color: #def7ec;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  img {
    color: #057a55;
  }
`;

const SuccessMessage = styled.div`
  padding: 0.5rem;
  margin: 0 auto;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #046c4e;
  font-size: 0.8rem;
  width: fit-content;
`;

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

import React, { useState } from "react";
import styled from "styled-components";
import { Row, Container } from "reactstrap";
import { useSelector } from "react-redux";

import { YOUNG_STATUS_PHASE3 } from "../../../utils";
import QuestionMark from "../../../assets/question-mark.svg";
import WaitingValidation from "./WaitingValidation";
import Validated from "./Validated";
import WaitingRealisation from "./WaitingRealisation";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [infosHover, setInfosHover] = useState(false);
  const [infosClick, setInfosClick] = useState(false);
  const toggleInfos = () => {
    setInfosClick(!infosClick);
  };
  const renderContent = () => {
    // return <WaitingRealisation />;
    if (young.statusPhase3 === YOUNG_STATUS_PHASE3.WAITING_VALIDATION) return <WaitingValidation />;
    if (young.statusPhase3 === YOUNG_STATUS_PHASE3.VALIDATED) return <Validated />;
    return <WaitingRealisation />;
  };
  return (
    <Wrapper>
      <Heading>
        <p>VALIDER MA PHASE 3</p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h1>J'ai terminé ma mission de phase 3</h1>
          <Icon src={QuestionMark} onClick={toggleInfos} onMouseEnter={() => setInfosHover(true)} onMouseLeave={() => setInfosHover(false)} />
        </div>
        {infosHover || infosClick ? (
          <Infos>
            Vous devez renseigner ici un engagement que vous avez réalisé sur une durée minimum de 3 mois, pour le valoriser comme mission de phase 3.
            <br />
            Le tuteur de mission à déclarer est la personne qui vous a accompagné lors de votre mission. C'est lui qui sera en charge de valider la réalisation de votre mission de
            phase 3.
            <br />
            NB : Les candidature sur les missions de phase 3 se font en dehors de la plateforme, selon les procédures propres à chaque dispositif.
          </Infos>
        ) : null}
      </Heading>
      {renderContent()}
    </Wrapper>
  );
};

const Infos = styled.div`
  color: #6b7280;
  font-style: italic;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const Icon = styled.img`
  height: 2rem;
  opacity: 0.7;
  font-size: 18px;
  cursor: pointer;
  margin-left: 2rem;
`;

const Wrapper = styled(Container)`
  padding: 20px 40px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;
const Heading = styled.div`
  margin-bottom: 30px;
  h1 {
    color: #161e2e;
    font-size: 3rem;
    font-weight: 700;
    @media (max-width: 768px) {
      font-size: 2rem;
    }
    margin-bottom: 0;
  }
  p {
    color: #42389d;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 5px;
  }
`;

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { YOUNG_STATUS_PHASE1 } from "snu-lib/constants";
import { HeroContainer, Hero } from "../../components/Content";
import ImageRight from "./ImageRight";
import AutoTest from "./AutoTest";
import { toastr } from "react-redux-toastr";
import api from "../../services/api";
import { translate } from "../../utils";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [service, setService] = useState();

  useEffect(() => {
    (async () => {
      const { data, code, ok } = await api.get(`/department-service`);
      if (!ok) return toastr.error("error", translate(code));
      console.log(data);
      setService(data);
    })();
  }, []);

  return (
    <HeroContainer>
      <Hero style={{ flexDirection: "column" }}>
        <Content style={{ width: "100%" }}>
          <h1>Prochaine étape</h1>
          {young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION ? (
            <>
              <p>
                Vous êtes actuellement <Tag>en&nbsp;attente&nbsp;d'affectation à un centre de cohésion.</Tag>
              </p>
              <p>Vous serez informé(e) par e-mail du lieu et des modalités de votre séjour fin mai.</p>
            </>
          ) : null}
          {young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_LIST ? (
            <>
              <p>
                Vous êtes actuellement <Tag>en&nbsp;attente&nbsp;d'affectation à un centre de cohésion.</Tag>
              </p>
              <p>Le SNU étant victime de son succès, nous oeuvrons pour vous trouver une place.</p>
              <p>Nous vous recontacterons par email au plus vite pour vous confirmer votre participation au séjour de cohésion.</p>
            </>
          ) : null}
        </Content>
        <ContentHorizontal style={{ width: "100%" }} id="sanitaire">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              ></path>
            </svg>
          </div>
          <div>
            <h2>Transmission de la fiche sanitaire</h2>
            <p>Téléchargez la fiche sanitaire.</p>
            <p>Vous devez renvoyer votre fiche sanitaire complétée et signée par voie postale sous pli confidentiel au plus tard le 4 juin 2021.</p>
            {service ? (
              <p>
                L'adresse de destination est la suivante :
                <br />
                {service?.directionName}, {service?.address} {service?.zip} {service?.city}
              </p>
            ) : null}
            <a href="https://apicivique.s3.eu-west-3.amazonaws.com/Note_relative_aux_informations_d_ordre_sanitaire.pdf" target="blank" className="link">
              Note relative aux informations d'ordre sanitaire{" >"}
            </a>

            <div style={{ marginTop: "2rem" }}>
              <div style={{ color: "#777" }}>
                <b> Rappel : </b>Vous devez réaliser un bilan de santé obligatoire auprès de votre médecin traitant. Il est fortement recommandé de le faire avant votre séjour de
                cohésion
              </div>
              <a
                href="https://www.ameli.fr/assure/sante/themes/suivi-medical-de-lenfant-et-de-ladolescent/examen-medical-propose-ladolescent-entre-15-et-16-ans"
                className="link"
                target="_blank"
              >
                Plus d’informations sur le bilan de santé obligatoire ›
              </a>
            </div>
          </div>
          <div style={{ minWidth: "30%", display: "flex", justifyContent: "flex-end", alignItems: "center", marginLeft: "1.5rem" }}>
            <a target="blank" href="https://apicivique.s3.eu-west-3.amazonaws.com/Fiche_sanitaire.pdf">
              <ContinueButton>Télécharger la fiche sanitaire</ContinueButton>
            </a>
          </div>
        </ContentHorizontal>
        <ImageRight />
        <AutoTest />
      </Hero>
    </HeroContainer>
  );
};

const Tag = styled.span`
  color: #42389d;
  padding: 0.25rem 0.75rem;
  margin: 0 0.25rem;
  border-radius: 99999px;
  background-color: #e5edff;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.1rem 0.5rem;
  }
`;

const Content = styled.div`
  margin-top: ${({ showAlert }) => (showAlert ? "2rem" : "")};
  width: 65%;
  @media (max-width: 768px) {
    width: 100%;
  }
  padding: 60px 30px 60px 50px;
  @media (max-width: 768px) {
    width: 100%;
    padding: 30px 15px 30px 15px;
  }
  position: relative;
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
  :not(:last-child) {
    border-bottom-width: 1px;
    border-color: #d2d6dc;
    border-bottom-style: dashed;
  }
  h2 {
    font-size: 1.5rem;
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 700;
    line-height: 1;
  }
  p {
    color: #6b7280;
    margin-top: 0.5rem;
    font-size: 1.125rem !important;
    @media (max-width: 768px) {
      font-size: 0.8rem !important;
    }
    font-weight: 400 !important;
  }
`;

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
  margin-top: 40px;
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;

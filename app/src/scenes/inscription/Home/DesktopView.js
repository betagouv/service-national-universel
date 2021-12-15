import React from "react";
import styled from "styled-components";
import { appURL } from "../../../config";
import StopIcon from "../components/stopIcon";
import TickIcon from "../components/tickIcon";
import conditions from "./conditions";
import informations from "./informations";

export default function DesktopView() {
  return (
    <Wrapper>
      <div className="infos_container">
        <section className="infos_container_section icon_section">
          {informations.map((info) => (
            <IconContainer key={info.title} icon={info.icon} title={info.title} text={info.text} />
          ))}
        </section>
        <section className="infos_container_section text_section">
          <p>
            Et cette année, les lycéens de 2de générale, technologique et professionnelle, dont l&apos;inscription est validée, sont de plein droit autorisés à participer au séjour
            de cohésion y compris sur le temps scolaire (février ou juin). Le séjour de cohésion, c&apos;est vivre une{" "}
            <b>expérience inédite et faire des rencontres inoubliables</b>.
          </p>
          <p>
            <strong>Et après le séjour ?</strong>
            <br /> Vous recevez votre certificat individuel de participation à la JDC et un accès gratuit à une plateforme d&apos;apprentissage du code de la route.
            <br />
            Qu&apos;attendez-vous pour vous inscrire ?
          </p>
        </section>
      </div>
      <Points backgroundColor="#fff">
        <div className="points-title">Conditions d&apos;inscription</div>
        <div className="first_container">
          <FirstSection>
            <div className="section_conditions">
              <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="20" rx="10" fill="#32267F" fillOpacity=".06" />
                <path
                  d="M8.644 13.843l-3.487-3.487a.536.536 0 010-.758l.759-.759c.21-.21.549-.21.758 0l2.349 2.349 5.03-5.03c.21-.21.55-.21.76 0l.758.758c.21.21.21.549 0 .758l-6.169 6.169c-.21.21-.549.21-.758 0z"
                  fill="#32267F"
                />
              </svg>
              <p>
                J’aurai <strong>15, 16 ou 17 ans</strong> au moment de mon séjour de cohésion
              </p>
            </div>
            <div className="section_conditions">
              <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="20" rx="10" fill="#32267F" fillOpacity=".06" />
                <path
                  d="M8.644 13.843l-3.487-3.487a.536.536 0 010-.758l.759-.759c.21-.21.549-.21.758 0l2.349 2.349 5.03-5.03c.21-.21.55-.21.76 0l.758.758c.21.21.21.549 0 .758l-6.169 6.169c-.21.21-.549.21-.758 0z"
                  fill="#32267F"
                />
              </svg>
              <p>
                Je suis de <strong>nationalité française</strong>
              </p>
            </div>
          </FirstSection>
          <div className="border_container">
            <SecondSection>
              <p>
                Vérifiez si vous êtes <strong>éligible au SNU :</strong>
              </p>
              <p className="conditions_date">
                séjour du <strong>13 au 25 février 2022</strong>
              </p>
              <p className="conditions_date">
                séjour du <strong>12 au 24 juin 2022</strong>
              </p>
              <p className="conditions_date">
                séjour du <strong>3 au 15 juillet 2022</strong>
              </p>
              {conditions.map((condition, i) => (
                <React.Fragment key={i}>
                  <p className="conditions_label">
                    {condition.label} <strong>{condition.bold}</strong>
                  </p>
                  {condition.isDate1 ? (
                    <p className="centered">
                      <TickIcon />
                    </p>
                  ) : (
                    <p className="centered">
                      <StopIcon />
                    </p>
                  )}
                  {condition.isDate2 ? (
                    <p className="centered">
                      <TickIcon />
                    </p>
                  ) : (
                    <p className="centered">
                      <StopIcon />
                    </p>
                  )}
                  {condition.isDate3 ? (
                    <p className="centered">
                      <TickIcon />
                    </p>
                  ) : (
                    <p className="centered">
                      <StopIcon />
                    </p>
                  )}
                </React.Fragment>
              ))}
            </SecondSection>
            <p className="conditions_info">
              *Les élèves de 2nde dont l&apos;établissement relève du ministère de l’éducation nationale, de la jeunesse et des sports peuvent s’inscrire même si le séjour se
              déroule sur leur temps scolaire. Ils bénéficieront d’une autorisation de participation au séjour de cohésion.
            </p>
          </div>
        </div>
        <GridContainer className="second_container">
          <div className="third_section bottom_section">
            <svg width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="#32257F" />
              <path d="M21 24h-1v-4h-1l2 4zm-1-8h.01H20zm9 4a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Infos>
              <p>Pour compléter l&apos;inscription en quelques minutes, il vous faudra :</p>
              <p>
                • Une <b>pièce d&apos;identité</b> (Carte Nationale d&apos;Identité ou Passeport)
                <br />• L&apos;accord de votre ou vos <b>représentants légaux</b>
              </p>
            </Infos>
          </div>
          <div className="bottom_section">
            <svg width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="#32257F" />
              <path
                d="M16.228 17c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M29 20a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <FAQ href={`${appURL}/public-besoin-d-aide`} target="blank">
              <p>
                <strong>Besoin d&apos;aide ?</strong>
              </p>
              <p>Toutes les réponses à vos questions</p>
            </FAQ>
          </div>
        </GridContainer>
      </Points>
    </Wrapper>
  );
}

function IconContainer({ icon, title, text }) {
  return (
    <div className="icons_container">
      <span>{icon}</span>
      <h5>{title}</h5>
      <p>{text}</p>
    </div>
  );
}

const Wrapper = styled.div`
  display: flex;
  margin-top: -2rem;
  display: flex;
  flex-direction: column;
  .icons_container {
    span {
      box-shadow: 0px 3px 14px rgba(0, 0, 0, 0.1);
      background: #fff;
      padding: 0.7rem;
      border-radius: 0.5rem;
    }
    h5 {
      color: #111827;
      margin-top: 1.5rem;
      margin-bottom: 0;
    }
  }
  .infos_container {
    margin: 4.5rem auto 2rem auto;
    max-width: 1300px;
    p {
      color: #6b7280;
      margin: 0;
      padding: 0.5rem;
    }
    padding: 0 1rem;
    &_section {
      display: grid;
    }
  }
  .text_section {
    padding-top: 1.5rem;
    border-top: 0.5px solid #dfdfdf;
    grid-template-columns: 1fr 1fr;
    p {
      text-align: left;
      padding: 1rem;
      strong {
        color: #111827;
      }
    }
  }
  .icon_section {
    margin-bottom: 1.5rem;
    grid-template-columns: 1fr 1fr 1fr;
  }
  @media (max-width: 767px) {
    display: none;
  }
`;

const FAQ = styled.a`
  width: 100%;
  color: #32267f;
  p {
    margin: 0;
    text-align: left;
  }
  :hover {
    color: #32267f;
    opacity: 0.8;
  }
`;

const Infos = styled.div`
  color: #6a7181;
`;

const Points = styled.div`
  position: relative;
  box-shadow: 0px 0px 14px rgba(0, 0, 0, 0.1);
  flex: 1;
  background-color: ${({ backgroundColor }) => (backgroundColor ? backgroundColor : "transparent")};
  .points-title {
    margin-top: 1.5rem;
    text-transform: uppercase;
    display: inline-block;
    padding: 2rem 20px;
    color: #32257f;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 1px;
  }
  li {
    color: #32267f;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
  }
  p {
    text-align: left;
    margin-bottom: 0;
  }
  svg {
    margin-right: 10px;
  }
  .first_container {
    border-top: 0.5px solid #dfdfdf;
  }
  .border_container {
    border-top: 0.5px solid #dfdfdf;
    padding-bottom: 1rem;
    .conditions_info {
      max-width: 950px;
      padding: 0.5rem;
      margin: 0 auto;
      font-size: 0.8rem;
      color: #32267f;
    }
  }
  .second_container {
    box-shadow: inset 0 10px 14px rgba(0, 0, 0, 0.08);
    background: #f8f8f8;
  }
  .button {
    text-transform: uppercase;
    color: #fff;
    background-color: #61c091;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    padding: 22px 10px;
    margin: -2px;
    letter-spacing: 0.03em;
    border-radius: 30px;
    :hover {
      opacity: 0.9;
    }
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  .third_section {
    border-right: 0.5px solid #dfdfdf;
  }
  .bottom_section {
    width: 100%;
    display: flex;
    padding: 2rem 3rem;
    align-items: center;
    font-size: 0.8rem;
    svg {
      width: 50px;
    }
  }
`;

const FirstSection = styled.section`
  display: flex;
  justify-content: space-between;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0.5rem;
  .section_conditions {
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    color: #32267f;
  }
`;

const SecondSection = styled.section`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(6, 1fr);
  max-width: 950px;
  margin: 0 auto;
  padding: 0.5rem;
  color: #32267f;
  .conditions_date {
    font-size: 0.8rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .conditions_label {
    align-self: center;
  }
  .centered {
    place-self: center;
  }
  p {
    padding: 0.5rem;
  }
  .section_year {
    padding: 1rem 3rem;
    display: flex;
    align-items: center;
  }
  .section_dates {
    padding: 0.5rem 3.5rem;
    margin-left: 1.5rem;
    font-size: 0.9rem;
  }
  .section_dates_bullet {
    margin-right: 5px;
  }
  .section_precision {
    font-size: 0.7rem;
    padding: 0 4rem 1rem 4rem;
    margin-left: 2rem;
  }
`;

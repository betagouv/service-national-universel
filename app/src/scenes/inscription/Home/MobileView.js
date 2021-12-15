import React from "react";
import styled from "styled-components";
import StopIcon from "../components/stopIcon";
import TickIcon from "../components/tickIcon";
import conditions from "./conditions";
import informations from "./informations";

export default function MobileView() {
  return (
    <Points>
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
      <div className="points-title">Conditions d&apos;inscription</div>
      <ul>
        <li>
          <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="20" height="20" rx="10" fill="#32267F" fillOpacity=".06" />
            <path
              d="M8.644 13.843l-3.487-3.487a.536.536 0 010-.758l.759-.759c.21-.21.549-.21.758 0l2.349 2.349 5.03-5.03c.21-.21.55-.21.76 0l.758.758c.21.21.21.549 0 .758l-6.169 6.169c-.21.21-.549.21-.758 0z"
              fill="#32267F"
            />
          </svg>
          <div>
            Je suis de <strong> nationalité française</strong>
          </div>
        </li>
        <li>
          <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="20" height="20" rx="10" fill="#32267F" fillOpacity=".06" />
            <path
              d="M8.644 13.843l-3.487-3.487a.536.536 0 010-.758l.759-.759c.21-.21.549-.21.758 0l2.349 2.349 5.03-5.03c.21-.21.55-.21.76 0l.758.758c.21.21.21.549 0 .758l-6.169 6.169c-.21.21-.549.21-.758 0z"
              fill="#32267F"
            />
          </svg>
          <div>
            J’aurai <strong>15, 16 ou 17 ans</strong> au moment de mon séjour de cohésion
          </div>
        </li>
        <li>
          <div>
            <p>
              Vérifiez si vous êtes <strong>éligible au SNU</strong> selon les dates de séjour proposées :
            </p>
            {conditions.map((condition, i) => (
              <React.Fragment key={i}>
                <p className="conditions_label">
                  {condition.label} <strong>{condition.bold}</strong>
                </p>
                {condition.isDate1 ? (
                  <Date>
                    <p className="conditions_date">{condition.date1}</p>
                    <p className="centered">
                      <TickIcon />
                    </p>
                  </Date>
                ) : (
                  <Date>
                    <p className="conditions_date">{condition.date1}</p>
                    <p className="centered">
                      <StopIcon />
                    </p>
                  </Date>
                )}
                {condition.isDate2 ? (
                  <Date>
                    <p className="conditions_date">{condition.date2}</p>
                    <p className="centered">
                      <TickIcon />
                    </p>
                  </Date>
                ) : (
                  <Date>
                    <p className="conditions_date">{condition.date2}</p>
                    <p className="centered">
                      <StopIcon />
                    </p>
                  </Date>
                )}
                {condition.isDate3 ? (
                  <Date>
                    <p className="conditions_date">{condition.date3}</p>
                    <p className="centered">
                      <TickIcon />
                    </p>
                  </Date>
                ) : (
                  <Date>
                    <p className="conditions_date">{condition.date3}</p>
                    <p className="centered">
                      <StopIcon />
                    </p>
                  </Date>
                )}
              </React.Fragment>
            ))}
            <p style={{ fontSize: "0.9rem", marginTop: "1rem" }}>
              *Les élèves de 2nde dont l&apos;établissement relève du ministère de l’éducation nationale, de la jeunesse et des sports peuvent s’inscrire même si le séjour se
              déroule sur leur temps scolaire. Ils bénéficieront d’une autorisation de participation au séjour de cohésion.
            </p>
          </div>
        </li>
        <li style={{ padding: 0 }}>
          <FAQ href="https://support.snu.gouv.fr/help/fr-fr/16-comprendre-le-snu" target="blank">
            <p>Toutes les réponses à vos questions</p>
            <svg width="6" height="10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M.293 9.707a1 1 0 010-1.414L3.586 5 .293 1.707A1 1 0 011.707.293l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                fill="#fff"
              />
            </svg>
          </FAQ>
        </li>
        <li>
          <Infos>
            Pour compléter l&apos;inscription en quelques minutes, il vous faudra :
            <div>
              • Une <b>pièce d&apos;identité</b> (Carte Nationale d&apos;Identité ou Passeport)
              <br />• L&apos;accord de votre ou vos <b>représentants légaux</b>
            </div>
          </Infos>
        </li>
      </ul>
    </Points>
  );
}

function IconContainer({ icon, title, text }) {
  return (
    <div className="icon_container">
      <span>{icon}</span>
      <h5>{title}</h5>
      <p>{text}</p>
    </div>
  );
}

const FAQ = styled.a`
  width: 100%;
  padding: 1rem;
  color: #fff;
  background-color: #32267f;
  display: flex;
  align-items: center;
  svg {
    height: 10px;
  }
  p {
    flex: 1;
    margin: 0;
  }
`;

const Infos = styled.div`
  font-size: 0.8rem;
  color: #6a7181;
  a {
    color: #42389d;
    :hover {
      text-decoration: underline;
    }
  }
`;

const Points = styled.div`
  position: relative;
  max-width: 575px;
  margin: 40px auto;
  .icon_container {
    padding: 1rem;
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
  }
  .text_section {
    padding-top: 1.5rem;
    border-top: 0.5px solid #dfdfdf;
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
  }
  .points-title {
    text-transform: uppercase;
    display: inline-block;
    padding: 5px 20px;
    color: #32257f;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 1px;
  }
  .conditions_date {
    font-size: 0.8rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .note {
    font-size: 0.8rem;
  }
  li {
    color: #32267f;
    font-size: 16px;
    padding: 25px 2rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    svg {
      width: 26px;
      margin-right: 10px;
    }
    div {
      width: 100%;
    }
    border-top: 1px solid #e5e7eb;
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
  display: none;
  @media (max-width: 767px) {
    display: block;
  }
`;

const Date = styled.div`
  display: flex;
  justify-content: space-between;
`;

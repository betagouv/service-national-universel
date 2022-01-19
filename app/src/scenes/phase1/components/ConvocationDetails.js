import React, { useState } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import api from "../../../services/api";

import { Separator } from "../../../components/Content";
import { translate } from "../../../utils";
import DownloadConvocationButton from "../../../components/buttons/DownloadConvocationButton";
import roundRight from "../../../assets/roundRight.svg";
import roundLeft from "../../../assets/roundLeft.svg";
import questionMark from "../../../assets/question-mark.svg";
import bus from "../../../assets/bus.png";
import map from "../../../assets/map.png";
import { supportURL } from "../../../config";

export function ConvocationDetails({ young, center, meetingPoint }) {
  console.log("CENTER", center);
  const [open, setOpen] = useState(false);
  const [isAutonomous, setIsAutonomous] = useState(young.deplacementPhase1Autonomous);

  async function confirmAutonomous() {
    const { data, code, ok } = await api.put(`/young`, {
      deplacementPhase1Autonomous: "true",
    });
    if (!ok) return toastr.error("error", translate(code));
    setIsAutonomous(data.deplacementPhase1Autonomous);
    console.log("AUTO", data);
    return toastr.success("Mis à jour !");
  }
  return (
    <>
      <Container>
        <section className="download">
          <div>
            <h2>Votre convocation</h2>
            <p>
              Votre convocation sera à présenter à votre arrivée muni d&apos;une <strong>pièce d&apos;identité valide</strong> et de votre{" "}
              <strong>test PCR ou antigénique négatif de moins de 72 heures </strong>
              (recommandé)
            </p>
          </div>
          <div className="button-container">
            <ContinueButton>
              <DownloadConvocationButton young={young} uri="cohesion">
                Télécharger&nbsp;ma&nbsp;convocation
              </DownloadConvocationButton>
            </ContinueButton>
          </div>
        </section>
      </Container>
      <Separator />
      <Container>
        <div className="flex">
          <div className="flex-firstchild">
            <img src={map} className="icon" />
            <section>
              <h3>Mon point de rassemblement</h3>
              <p style={{ margin: 0 }}>{meetingPoint?.departureAddress}</p>
            </section>
          </div>
          <div className="flex-secondchild">
            <img src={bus} className="icon" />
            <section className="meeting">
              <div className="meeting-dates">
                <img src={roundRight} />
                <article>
                  <p>ALLER</p>
                  <span>Le {meetingPoint?.departureAtString}</span>
                </article>
              </div>
              <div className="meeting-dates">
                <img src={roundLeft} />
                <article>
                  <p>RETOUR</p>
                  <span>Le {meetingPoint?.returnAtString}</span>
                </article>
              </div>
            </section>
          </div>
        </div>
        <Separator className="mobile-only" />
        <section className="autonomous">
          <div className="autonomous-switch">
            <p className="black-bold">Vous souhaitez vous rendre au centre par vos propres moyens ?</p>
            {open ? (
              <button className="autonomous-button" onClick={() => setOpen(false)}>
                ↑ Réduire{" "}
              </button>
            ) : (
              <button className="autonomous-button" onClick={() => setOpen(true)}>
                <svg width="11" height="10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.5 1v4m0 0v4m0-4h4m-4 0h-4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                En savoir plus{" "}
              </button>
            )}
          </div>
          {open ? (
            <>
              <p style={{ marginTop: "1rem" }}>
                <strong>{`${center?.name}, ${center?.address} ${center?.zip} ${center?.city}, ${center?.department}, ${center?.region}`}</strong>
              </p>
              <div className="meeting-dates">
                <img src={roundRight} />
                <article>
                  <p>ALLER</p>
                  <span>Le {meetingPoint?.departureAtString}</span>
                </article>
              </div>
              <div className="meeting-dates">
                <img src={roundLeft} />
                <article>
                  <p>RETOUR</p>
                  <span>Le {meetingPoint?.returnAtString}</span>
                </article>
              </div>
              {isAutonomous === "true" ? (
                <p style={{ color: "#5145cd", marginTop: "2rem" }}>Vous avez choisi de vous rendre au centre de cohésion par vos propres moyens.</p>
              ) : (
                <ContinueButton onClick={confirmAutonomous}>
                  Je confirme venir par mes propres moyens{" "}
                  <svg width="16" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 7l4 4L15 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </ContinueButton>
              )}
            </>
          ) : null}
        </section>
        <Separator />
        <section className="more-info">
          <div className="more-info-question">
            <img src={questionMark} />
            <p className="black-bold">Des questions sur le transport ?</p>
          </div>
          <a href={`${supportURL}/base-de-connaissance`}>
            Rendez-vous sur notre <span>base de connaissance ›</span>
          </a>
        </section>
      </Container>
    </>
  );
}

const Container = styled.div`
  h2 {
    font-size: 2rem;
  }
  h3 {
    font-size: 1.2rem;
    font-weight: bold;
  }
  .black-bold {
    color: black;
    font-weight: bold;
  }
  .meeting {
    &-dates p {
      font-size: 1rem;
      font-weight: bold;
      color: black;
      margin-bottom: 0.3rem;
      margin-top: 0.5rem;
    }
    &-dates {
      img {
        width: 1.5rem;
        height: 1.5rem;
        margin: 1rem 0;
      }
    }
  }
  .button-container {
    display: flex;
    justify-content: center;
  }
  .autonomous {
    margin-top: 1rem;
    color: black;
    &-button {
      display: flex;
      align-items: center;
      padding: 0.3rem 1rem;
      background: #ffffff;
      border: 1px solid #d1d5db;
      box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
      border-radius: 17px;
      svg {
        margin-right: 0.3rem;
      }
    }
    &-switch {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }
  .flex {
    display: flex;
    justify-content: center;
    flex-direction: column;
    .icon {
      width: 3rem;
      height: 3rem;
      margin-right: 0;
    }
    &-firstchild {
      margin-bottom: 2rem;
    }
  }
  .more-info {
    a {
      color: #6c6c6c;
    }
    span {
      color: #5245cc;
      text-decoration: underline;
    }
    img {
      width: 1.5rem;
      margin-bottom: 1rem;
    }
  }
  @media (min-width: 768px) {
    .download {
      display: flex;
    }
    .button-container {
      justify-content: flex-end;
      align-items: center;
      margin-left: auto;
      padding: 1rem;
    }
    .flex {
      display: flex;
      align-items: center;
      flex-direction: row;
      &-firstchild {
        display: flex;
        align-items: center;
        margin-bottom: 0;
      }
      &-secondchild {
        display: flex;
        align-items: center;
        margin-left: 3rem;
      }
      .icon {
        margin-right: 2rem;
      }
    }
    .meeting {
      display: grid;
      grid-template-rows: 1fr 1fr;
      &-dates {
        display: flex;
        align-items: center;
        text-align: left;
        img {
          margin-right: 1.5rem;
          margin-bottom: 0;
        }
      }
    }
    .autonomous-switch {
      margin-top: 3rem;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      button {
        display: flex;
        justify-content: center;
        min-width: 148px;
      }
      p {
        margin: 0;
      }
    }
    .more-info {
      img {
        margin-bottom: 0;
      }
      display: flex;
      align-items: center;
      justify-content: space-between;
      p {
        margin: 0 0 0 1rem;
      }
      &-question {
        display: flex;
      }
    }
    .mobile-only {
      display: none;
    }
  }
`;

const ContinueButton = styled.button`
  margin: 1rem auto;
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
  svg {
    margin-left: 0.5rem;
    margin-bottom: 0.2rem;
  }
`;

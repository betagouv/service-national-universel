import React, { useState } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import api from "../../../services/api";
import { useDispatch } from "react-redux";

import { setYoung } from "../../../redux/auth/actions";
import { Separator, Content } from "../../../components/Content";
import { translate } from "../../../utils";
import DownloadConvocationButton from "../../../components/buttons/DownloadConvocationButton";
import roundRight from "../../../assets/roundRight.svg";
import roundLeft from "../../../assets/roundLeft.svg";
import questionMark from "../../../assets/question-mark.svg";
import map from "../../../assets/map.png";
import { supportURL } from "../../../config";
import Convocation from "./Convocation";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import LoadingButton from "../../../components/buttons/LoadingButton";

export default function ConvocationDetails({ young, center, meetingPoint }) {
  const [open, setOpen] = useState(false);
  const [isAutonomous, setIsAutonomous] = useState(young.deplacementPhase1Autonomous === "true");
  const [showConvocation, setShowConvocation] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleAutonomousClick = () => {
    setModal({
      isOpen: true,
      title: "Je confirme venir et rentrer par mes propres moyens",
      message: (
        <>
          <p>
            Vous confirmez vous rendre au centre <b>{[center?.name, center?.address, center?.zip, center?.city, center?.department, center?.region].filter((e) => e).join(", ")}</b>{" "}
            et en revenir par vos propres moyens.
          </p>
          <br />
          <p>Cette action est irréversible.</p>
        </>
      ),
      onConfirm: confirmAutonomous,
      confirmText: "Je confirme",
    });
  };

  async function confirmAutonomous() {
    setIsLoading(true);
    const { data, code, ok } = await api.post(`/young/${young._id}/deplacementPhase1Autonomous`);
    if (!ok) {
      setIsLoading(false);
      return toastr.error("error", translate(code));
    }
    dispatch(setYoung(data));
    setIsAutonomous(data.deplacementPhase1Autonomous === "true");
    setIsLoading(false);
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
            <p className="show-convocation">
              En cas de problème de téléchargement : <span onClick={() => setShowConvocation((e) => !e)}>afficher ma convocation</span>
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
      {showConvocation ? (
        <>
          <Separator />
          <Convocation />
        </>
      ) : null}
      <Separator />
      <Container>
        <div className="meeting">
          <img src={map} className="icon" />
          <section className="meeting-point">
            <h3>Mon point de rassemblement</h3>
            {isAutonomous ? (
              <p style={{ margin: 0 }}>{[center?.name, center?.address, center?.zip, center?.city, center?.department, center?.region].filter((e) => e).join(", ")}</p>
            ) : (
              <p style={{ margin: 0 }}>
                {meetingPoint
                  ? `${[meetingPoint?.departureAddress, meetingPoint?.departureZip, meetingPoint?.departureCity, meetingPoint?.departureDepartment, meetingPoint?.departureRegion]
                      .filter((e) => e)
                      .join(", ")}`
                  : "Aucun point de rassemblement ne vous a été assigné pour le moment."}
              </p>
            )}
          </section>
          <section className="meeting-dates">
            <div className="meeting-dates-detail">
              <img src={roundRight} />
              <article>
                <p>ALLER</p>
                {isAutonomous ? <span>Le dimanche 13 février 2022 à 16 heures</span> : <span>{meetingPoint ? `Le ${meetingPoint?.departureAtString}` : "Horaire à venir"}</span>}
              </article>
            </div>
            <div className="meeting-dates-detail">
              <img src={roundLeft} />
              <article>
                <p>RETOUR</p>
                {isAutonomous ? <span>Le vendredi 25 février 2022 à 11 heures</span> : <span>{meetingPoint ? `Le ${meetingPoint?.returnAtString}` : "Horaire à venir"}</span>}
              </article>
            </div>
          </section>
        </div>
        <Separator className="mobile-only" />
        {isAutonomous ? (
          <p style={{ color: "#5145cd", marginTop: "2rem" }}>Vous avez choisi de vous rendre au centre de cohésion par vos propres moyens.</p>
        ) : (
          <section className="autonomous">
            <div className="autonomous-switch">
              <p className="black-bold">Vous souhaitez vous rendre au centre et en revenir par vos propres moyens ?</p>
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
                <div className="meeting meeting-autonomous">
                  <img src={map} className="icon" />
                  <p className="meeting-center">
                    <strong>{[center?.name, center?.address, center?.zip, center?.city, center?.department, center?.region].filter((e) => e).join(", ")}</strong>
                  </p>
                  <section className="meeting-dates">
                    <div className="meeting-dates-detail">
                      <img src={roundRight} />
                      <article>
                        <p>ALLER</p>
                        <span>Le dimanche 13 février 2022 à 16 heures</span>
                      </article>
                    </div>
                    <div className="meeting-dates-detail">
                      <img src={roundLeft} />
                      <article>
                        <p>RETOUR</p>
                        <span>Le vendredi 25 février 2022 à 11 heures</span>
                      </article>
                    </div>
                  </section>
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <LoadingButton loading={isLoading} disabled={isLoading} onClick={handleAutonomousClick}>
                    Je confirme venir et rentrer par mes propres moyens&nbsp;
                    <svg width="16" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 7l4 4L15 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </LoadingButton>
                </div>
              </>
            ) : null}
          </section>
        )}

        <Separator />
        <section className="more-info">
          <div className="more-info-question">
            <img src={questionMark} />
            <p className="black-bold">Des questions sur le transport ?</p>
          </div>
          <a href={`${supportURL}/base-de-connaissance/le-transport`} target="_blank" rel="noreferrer">
            Rendez-vous sur notre <span>base&nbsp;de&nbsp;connaissance&nbsp;›</span>
          </a>
        </section>
      </Container>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        confirmText={modal?.confirmText}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
        onCancel={() => {
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
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
  .button-container {
    display: flex;
    justify-content: center;
  }
  .show-convocation {
    font-size: 0.9rem;
    span {
      cursor: pointer;
      color: #5245cc;
      text-decoration: underline;
    }
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
  .meeting {
    display: flex;
    justify-content: center;
    flex-direction: column;
    .icon {
      display: none;
    }
    &-point {
      max-width: 450px;
    }
    &-center {
      align-self: center;
      margin-top: 1rem;
      max-width: 400px;
      margin-bottom: 0;
    }
    &-dates {
      &-detail p {
        font-size: 1rem;
        font-weight: bold;
        color: black;
        margin-bottom: 0.3rem;
        margin-top: 0.5rem;
      }
      &-detail span {
        color: #888888;
        font-weight: bold;
      }
      &-detail {
        letter-spacing: 2px;
        img {
          width: 1.5rem;
          height: 1.5rem;
          margin: 1rem 0;
        }
      }
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
    .meeting {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-direction: row;
      .icon {
        display: block;
        width: 4rem;
        height: 4rem;
        margin-right: 2rem;
      }
      &-center {
        margin-right: 1rem;
        margin-top: 0;
      }
      &-point {
        margin-right: 2rem;
      }
      &-dates {
        min-width: 300px;
        display: grid;
        grid-template-rows: 1fr 1fr;
        &-detail {
          display: flex;
          align-items: center;
          text-align: left;
          img {
            margin-right: 1.5rem;
            margin-bottom: 0;
          }
        }
      }
    }
    .meeting-autonomous {
      padding: 3rem 0;
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
      gap: 1rem;
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
const ContentHorizontal = styled(Content)`
  display: flex;
  width: 100%;
  @media (max-width: 768px) {
    flex-direction: column;
  }

  .link {
    color: #5145cd;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    font-weight: 400;
    cursor: pointer;
  }
`;

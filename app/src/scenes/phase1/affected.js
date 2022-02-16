import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";


import { HeroContainer, Hero, Content, Separator, AlertBoxInformation } from "../../components/Content";
import NextStep from "./nextStep";
import api from "../../services/api";
import { translate, translateCohort } from "../../utils";
import ConvocationDetails from "./components/ConvocationDetails";
import { supportURL } from "../../config";
import Case from "../../assets/case";
import Question from "../../assets/question";
import Bouclier from "../../assets/bouclier";
import right from "../../assets/right.svg";
import ModalConfirm from "../../components/modals/ModalConfirm";
import ModalConfirmWithMessage from "../../components/modals/ModalConfirm";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import Chevron from "../../components/Chevron"
import { Link } from "react-router-dom";


export default function Affected() {
  const young = useSelector((state) => state.Auth.young);
  const [center, setCenter] = useState();
  const [meetingPoint, setMeetingPoint] = useState();
  const [showInfoMessage, setShowInfoMessage] = useState(false);

  const getMeetingPoint = async () => {
    const { data, ok } = await api.get(`/young/${young._id}/meeting-point`);
    if (!ok) setMeetingPoint(null);
    setMeetingPoint(data);
  };

  useEffect(() => {
    (async () => {
      const { data, code, ok } = await api.get(`/session-phase1/${young.sessionPhase1Id}/cohesion-center`);
      if (!ok) return toastr.error("error", translate(code));
      setCenter(data);
      getMeetingPoint();
    })();
  }, [young]);

  if (!center) return <div />;
  return (
    <>
      <HeroContainer>
        {showInfoMessage ? (
          <AlertBoxInformation
            title="Information"
            message="Suite au séjour de cohésion, les espaces volontaires vont s'actualiser dans les prochaines semaines, les attestations seront disponibles directement en ligne."
            onClose={() => setShowInfoMessage(false)}
          />
        ) : null}
        <Hero style={{ flexDirection: "column" }}>
          <Section className="hero-container">
            <section className="content">
              <h1>
                <strong>Mon séjour de cohésion </strong>
                <br /> <span>{translateCohort(young.cohort)}</span>
              </h1>
              <p>
                Le SNU vous donne l&apos;opportunité de découvrir la vie collective au sein d&apos;un centre accueillant environ 200 jeunes de votre région (sauf exception) pour
                créer ainsi des liens nouveaux et développer votre culture de l’engagement et ainsi affirmer votre place dans la société.
              </p>
              <ChangeSejour/>
              <Separator style={{ width: "150px" }} />
              <p>
                <strong style={{ color: "black" }}>Votre lieu d&apos;affectation</strong>
                <br />
                <strong>
                  <span>Vous êtes actuellement affecté(e) au centre de cohésion de :</span>
                </strong>
                <br />
                <span style={{ color: "#5145cd" }}>{`${center?.name}, ${center?.address} ${center?.zip} ${center?.city}, ${center?.department}, ${center?.region}`}</span>
              </p>
            </section>
            <div className="thumb" />
          </Section>
          <Separator style={{ margin: 0 }} />
          <Protocole href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/protocole-sanitaire-cohesion-2022.pdf" target="_blank" rel="noreferrer">
            <span>
              <Bouclier />
              <p>
                Protocole sanitaire en vigueur pour les Accueils Collectifs de Mineur
                <br />
                <em style={{ fontWeight: "bold" }}>Il est recommandé de réaliser un test PCR, antigénique ou autotest moins de 24h avant le départ en séjour.</em>
              </p>
            </span>
            <img src={right} />
          </Protocole>
        </Hero>
      </HeroContainer>
      <GoodToKnow>
        <section className="good-article">
          <Case />
          <div className="good-article-text">
            <p>Dans ma valise, il y a...</p>
            <a href={`${supportURL}/base-de-connaissance/dans-ma-valise-materiel-trousseau`} target="_blank" rel="noreferrer">
              Comment bien <span>préparer&nbsp;son&nbsp;séjour&nbsp;›</span>
            </a>
          </div>
        </section>
        <section className="good-article">
          <Question />
          <div className="good-article-text">
            <p>Vous avez des questions sur le séjour ?</p>
            <a href={`${supportURL}/base-de-connaissance/phase-1-le-sejour-de-cohesion`} target="_blank" rel="noreferrer">
              Consulter notre <span>base&nbsp;de&nbsp;connaissance&nbsp;›</span>
            </a>
          </div>
        </section>
      </GoodToKnow>
      <HeroContainer id="convocationPhase1">
        <Hero>
          <Content style={{ width: "100%", padding: "3.2rem" }}>
            <ConvocationDetails young={young} center={center} meetingPoint={meetingPoint} />
          </Content>
        </Hero>
      </HeroContainer>
      <Documents>Documents à renseigner</Documents>
      <NextStep />
    </>
  );
}

const ChangeSejour = ({onChange}) => {
  const [modalConfirm, setModalConfirm]= useState(false);
  const [modalConfirmWithMessage, setModalConfirmWithMessage] = useState(false);
  const [motif, setMotif] = useState("");
  const [newSejour, setNewSejour] = useState();

  const young = useSelector((state) => state.Auth.young);


  const motifs = [
    "Non disponibilité pour motif familial ou personnel",
    "Non disponibilité pour motif scolaire ou professionnel",
    "L’affectation ne convient pas",
    "Impossibilité de se rendre au point de rassemblement",
    "Autre",
  ];

  const defaultInput = `Bonjour ${young.firstName} ${
    young.lastName
  },\n\nVotre changement de séjour pour le Service National Universel a été pris en compte.\n\nVous êtes maintenant positionné(e) sur le séjour se déroulant ${translateCohort(
    newSejour,
  )}.\n\n[Zone de texte : Renseignez la raison du changement de cohorte]\n\nCordialement\nLes équipes du Service National Universel`;

  const handleChangeCohort = async (messageTextArea) => {
    try {
      //await api.put(`/referent/young/${young._id}`, { cohort: newCohort });
      //! TODO : Ajouter le template
      // await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_VALIDATED}`);}
      //await onChange();
      toastr.success("Séjour modifiée avec succès");
      setModalConfirmWithMessage(false);
    } catch (e) {
      return toastr.error("Oups, une erreur est survenue pendant le changement de cohorte du volontaire :", translate(e.code));
    }
  };

  const submit = async () => {
    setModalConfirm(true);
    console.log("#######OK######")
  }

  return  (
        <>
          <ChangeButton primary>
            <Link to="/changeSejour"> 
              Changer de séjour
            </Link>
          </ChangeButton>
          <ModalConfirm
            size="lg"
            isOpen={modalConfirm}
            title="Changement de séjour"
            message={<>
              Voulez-vous vraiment changer de séjour ?<br />
            </>}
            onCancel={() => setModalConfirm(false)}
            onConfirm={() => {
              setModalConfirm(false);
              setModalConfirmWithMessage(true);
            } }
            showHeaderIcon={true}>
              <>
                <div style={{ display: "grid", marginBlock: "20px", gridTemplateColumns: "1fr 375px", gridGap: "20px", alignItems: "center", justifyItems: "left", minWidth: "75%" }}>
                  <p style={{ margin: 0 }}>Choix du nouveau séjour :</p>
                    <CohortDropDown cohort={newSejour} color="#ffffff" onClick={(value) => { } } width="375px" />
                  <p style={{ margin: 0 }}>Précisez le motif de changement de séjour :</p>

                  <ActionBox color="#ffffff" width="375px">
                    <UncontrolledDropdown setActiveFromChild>
                      <DropdownToggle tag="button">
                        {motif || <p></p>}
                         <Chevron color="#9a9a9a" />
                      </DropdownToggle>
                      <DropdownMenu>
                        {motifs
                          .filter((e) => e !== motif)
                          .map((status) => {
                            return (
                              <DropdownItem key={status} className="dropdown-item" onClick={() => setMotif(status)}>
                                {status}
                              </DropdownItem>
                            );
                          })}
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </ActionBox>
                </div>
                <p style={{ margin: 0, marginTop: "16px" }}>
                Pourquoi je ne vois pas tous les séjours ?{" "}
                  <a href="https://support.snu.gouv.fr/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion-en-2022-1" style={{ color: "#5145cc" }}>
                  En savoir plus sur les séjours où je suis éligible.                  </a>
                </p>
              </>
            </ModalConfirm>
            <ModalConfirmWithMessage
              isOpen={modalConfirmWithMessage}
              title="Changement de cohorte"
              message="Veuillez éditer le message ci-dessous pour préciser le motif de changement de cohorte avant de l’envoyer"
              defaultInput={defaultInput}
              onChange={() => setModalConfirmWithMessage(false)}
              onConfirm={handleChangeCohort}
            />
        </>
  )

};

const CohortDropDown = ({ cohort, onClick, color, width }) => {
  const options = ["Juillet 2022", "Juin 2022", "Février 2022"];

  return (
    <ActionBox color={color} width={width}>
      <UncontrolledDropdown setActiveFromChild>
        <DropdownToggle tag="button">
          Cohorte {cohort}
          <Chevron color="#9a9a9a" />
        </DropdownToggle>
        <DropdownMenu>
          {options
            .filter((e) => e !== cohort)
            .map((status) => {
              return (
                <DropdownItem key={status} className="dropdown-item" onClick={() => onClick(status)}>
                  Cohorte {status}
                </DropdownItem>
              );
            })}
        </DropdownMenu>
      </UncontrolledDropdown>
    </ActionBox>
  );
};

const Section = styled.section`
  display: flex;
  h1 span {
    color: #2e2e2e;
    font-weight: 400;
  }
  p span {
    color: #888888;
  }
`;

const Protocole = styled.a`
  padding: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    display: grid;
    grid-template-columns: 4rem 2fr;
    align-items: center;
    p {
      color: black;
      margin-bottom: 0;
    }
  }
  svg {
    min-width: 2rem;
    margin-right: 0.5rem;
  }
  img {
    display: none;
  }
  @media (min-width: 768px) {
    span {
      font-size: 1.2rem;
    }
    img {
      display: block;
      width: 0.8rem;
    }
  }
`;

const GoodToKnow = styled.article`
  max-width: 1280px;
  margin: 2rem auto;
  padding: 0 2rem;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  .good-article {
    margin: 2rem;
    display: flex;
    align-items: center;
    &-text {
      margin-left: 1rem;
    }
    svg {
      min-width: 48px;
    }
  }
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
  p {
    margin: 0;
    color: black;
    font-weight: bold;
  }
  @media (min-width: 1335px) {
    justify-content: center;
  }
  @media (max-width: 360px) {
    .good-article {
      flex-direction: column;
    }
    svg {
      margin-bottom: 0.5rem;
    }
  }
`;

const Documents = styled.h2`
  max-width: 1280px;
  margin: 2rem auto;
  padding: 0 2rem;
  color: #6b7280;
  font-weight: bold;
  font-size: 2.25rem;
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

const ChangeButton = styled.button`
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

const ActionBox = styled.div`
  margin-left: 10px;
  .dropdown-menu {
    width: ${({ width }) => width};
    a,
    div {
      white-space: nowrap;
      font-size: 14px;
      :hover {
        color: inherit;
      }
    }
  }
  button {
    background-color: ${({ color }) => color};
    border: 1px solid #cecece;
    color: #9a9a9a;
    display: inline-flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    border-radius: 0.5rem;
    padding: 0 0 0 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    outline: 0;
    width: ${({ width }) => width};
    min-height: 34px;
    .edit-icon {
      height: 17px;
      margin-right: 10px;
      path {
        fill: ${({ color }) => `${color}`};
      }
    }
    .down-icon {
      margin-left: auto;
      padding: 7px 15px;
      margin-left: 15px;
      svg {
        height: 10px;
      }
      svg polygon {
        fill: ${({ color }) => `${color}`};
      }
    }
  }
  .dropdown-item {
    border-radius: 0;
    background-color: transparent;
    border: none;
    color: #767676;
    white-space: nowrap;
    font-size: 14px;
    padding: 5px 15px;
    font-weight: 400;
    :hover {
      background-color: #f3f3f3;
    }
  }
`;
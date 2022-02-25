import React, { useState, useEffect } from "react";

import styled from "styled-components";
import Chevron from "../../components/Chevron";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ModalConfirm from "../../components/modals/ModalConfirm";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { translate, translateCohort, HERO_IMAGES_LIST } from "../../utils";
import Loader from "../../components/Loader";

import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";

export default function changeSejour() {
  const young = useSelector((state) => state.Auth.young);
  const [newSejour, setNewSejour] = useState("");
  const [motif, setMotif] = useState("");
  const [modalConfirmControlOk, setmodalConfirmControlOk] = useState(false);
  const [modalConfirmGoalReached, setmodalConfirmGoalReached] = useState(false);
  const [sejours, setSejours] = useState(null);
  const [isEligible, setIsElegible] = useState(false);
  const [sejourGoal, setSejourGoal] = useState(null);
  const [messageTextArea, setMessageTextArea] = useState("");
  const [loading, setLoading] = useState(true);

  const motifs = [
    "Non disponibilité pour motif familial ou personnel",
    "Non disponibilité pour motif scolaire ou professionnel",
    "L'affectation ne convient pas",
    "Impossibilité de se rendre au point de rassemblement",
    "Autre",
  ];

  useEffect(() => {
    (async function getInfo() {
      try {
        const { data } = await api.post("/cohort-session/eligibility/2022", {
          birthDate: young.birthdateAt,
          schoolLevel: young.schoolLevel,
          department: young.department,
        });
        const sejourGoal = data.map((e) => {
          // les dates de fin d'inscription aux séjours ne sont pas renseignés pour le moment
          //var date = new Date();
          //console.log(date.toISOString());
          //if (e.inscriptionLimitDate > date.toISOSString())    date de fin de d'inscription aux séjours à récupérer
          return { sejour: e.id, goal: e.goalReached };
        });
        const sejour = sejourGoal.map((e) => e.sejour);

        setSejours(sejour);
        setIsElegible(!!data);
        setSejourGoal(sejourGoal);
      } catch (e) {
        toastr.error("Oups, une erreur est survenue", translate(e.code));
      }
      setLoading(false);
    })();
  }, []);

  const onConfirmer = () => {
    if (newSejour && motif) {
      var isGoalTrue = sejourGoal.find((obj) => obj.goal === true && obj.id === newSejour);
      //si le volontaire est en statut de phase 1 “affectée” et que les objectifs de recrutement sont atteint pour le nouveau séjour choisi

      if (isGoalTrue === undefined) {
        setmodalConfirmControlOk(true);
      } else {
        setmodalConfirmGoalReached(true);
      }
    } else {
      toastr.info("Veuillez renseigner tous les champs");
    }
  };

  const handleChangeSejour = async () => {
    try {
      await api.put("/young/" + young._id + "/change-cohort/", { cohortChangeReason: motif, cohortDetailedChangeReason: messageTextArea, cohort: newSejour });
      toastr.success("Cohorte modifiée avec succés. Votre nouvelle cohorte se tiendra en " + newSejour);
      setmodalConfirmControlOk(false);
    } catch (e) {
      return toastr.error("Oups, une erreur est survenue lors de votre changement de cohorte :", translate(e.code));
    }
  };

  const handleWaitingList = async () => {
    try {
      await api.put("/young/" + young._id + "/change-cohort/", { cohortChangeReason: motif, cohortDetailedChangeReason: messageTextArea, cohort: newSejour });
      toastr.success("Vous avez été ajouté en liste d'attente");
      setmodalConfirmGoalReached(false);
    } catch (e) {
      return toastr.error("Oups, une erreur est survenue lors de votre changement de cohorte :", translate(e.code));
    }
  };
  if (loading) {
    return <Loader />;
  } else {
    return (
      <>
        <HeroContainer>
          {isEligible ? (
            <Hero style={{ flexDirection: "column" }}>
              <Section className="hero-container">
                <section className="content">
                  <h1>
                    <strong>Changer mes dates de séjour de cohésion </strong>
                  </h1>
                  <p>
                    <b>Une contrainte personnelle, familiale, scolaire ou professionnelle ?</b>
                    <br />
                    Vous pouvez modifier les dates de votre séjour initialement prévu {translateCohort(young.cohort)}.
                  </p>
                  <p style={{ marginTop: 10, marginBottom: 9, fontSize: 14, fontWeight: 500 }}>Dates de séjour</p>
                  <ActionBox color="#ffffff" width="375px">
                    <SectionHelp>
                      <UncontrolledDropdown setActiveFromChild>
                        <DropdownToggle tag="button">
                          Séjour {newSejour}
                          <Chevron color="#9a9a9a" />
                        </DropdownToggle>
                        <DropdownMenu>
                          {sejours
                            .filter((e) => e !== young.cohort)
                            .map((status) => {
                              return (
                                <DropdownItem key={status} className="dropdown-item" onClick={() => setNewSejour(status)}>
                                  Séjour {status}
                                </DropdownItem>
                              );
                            })}
                        </DropdownMenu>
                      </UncontrolledDropdown>
                      <a
                        href="https:support.snu.gouv.fr/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion-en-2022-1"
                        style={{ color: "#5145cc" }}
                        target="_blank"
                        rel="noreferrer">
                        Pourquoi je ne vois pas tous les séjours ?
                      </a>
                    </SectionHelp>
                  </ActionBox>
                  <p style={{ marginTop: 30, marginBottom: 0, fontSize: 14, fontWeight: 500 }}>Précisez la raison de votre changement de séjour</p>
                  <ActionBox color="#ffffff" width="375px">
                    <Section>
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
                    </Section>
                  </ActionBox>
                  <p style={{ marginTop: 30, marginBottom: 0, fontSize: 14, fontWeight: 500 }}>Précisez en quelques mots la raison de votre changement de séjour (facultatif)</p>
                  <ActionBox>
                    <Section>
                      <textarea placeholder={"En quelques mots..."} rows="15" value={messageTextArea} onChange={(e) => setMessageTextArea(e.target.value)} />
                    </Section>
                  </ActionBox>
                  <div
                    style={{
                      display: "grid",
                      marginBlock: "20px",
                      gridTemplateColumns: "1fr 1fr",
                      alignItems: "center",
                      minWidth: "75%",
                      justifyItems: "between",
                    }}>
                    <p>
                      <ContinueButton style={{ marginLeft: "60px" }} onClick={() => onConfirmer()}>
                        Enregistrer
                      </ContinueButton>
                      <ModalConfirm
                        size="lg"
                        isOpen={modalConfirmControlOk}
                        title="Changement de séjour"
                        message={
                          <>
                            Êtes-vous sûr ? <br /> <br />
                            Vous vous apprêtez à changer de séjour pour {newSejour}. Cette action est irréversible, souhaitez-vous confirmer cette action ? <br />
                          </>
                        }
                        onCancel={() => setmodalConfirmControlOk(false)}
                        onConfirm={() => {
                          handleChangeSejour();
                        }}
                        disableConfirm={!motif}
                        showHeaderIcon={true}></ModalConfirm>
                      <ModalConfirm
                        size="lg"
                        isOpen={modalConfirmGoalReached}
                        title="Changement de séjour"
                        message={
                          <>
                            Malheureusement il n&apos;y a plus de place disponible actuellement pour ce séjour . Vous allez être positionné(e) sur liste complémentaire et vous
                            serez averti(e) si des places se libérent. <br /> <br />
                            Souhaitez-vous maintenir votre choix de séjour ?
                          </>
                        }
                        onCancel={() => setmodalConfirmGoalReached(false)}
                        onConfirm={() => {
                          handleWaitingList();
                        }}
                        disableConfirm={!motif}
                        showHeaderIcon={true}></ModalConfirm>
                    </p>
                    <p>
                      <ButtonLink to="/phase1">Annuler</ButtonLink>
                    </p>
                  </div>
                </section>
                <div className="thumb" />
              </Section>
            </Hero>
          ) : (
            <Wrapper>
              <h2>Vous n&apos;êtes élégible à aucun séjour de cohésion pour le moment.</h2>
              <a href="https://support.snu.gouv.fr/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion-en-2022-1" style={{ color: "#5145cc" }}>
                En savoir plus sur les séjours où je suis éligible.
              </a>
            </Wrapper>
          )}
        </HeroContainer>
      </>
    );
  }
}

const SectionHelp = styled.section`
  display: flex;
  a {
    color: rgb(107 114 128) !important;
    margin-left: 1rem;
    font-size: 12px;
    text-decoration-line: underline;
    align-self: center;
  }
`;

const Section = styled.section`
  display: flex;
  h1 span {
    color: #2e2e2e;
    font-weight: 400;
  }
  p span {
    color: #888888;
  }
  a {
    margin-left: 1rem;
    font-size: 12px;
    align-self: center;
  }
  b {
    color: rgb(51 65 85);
  }
  textarea {
    width: 90%;
    height: 160px;
    border: 1px solid #cecece;
    border-radius: 6px;
    padding: 8px;
    color: rgb(51 65 85);
  }
`;

const Wrapper = styled.div`
  padding: 20px 40px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;

const ActionBox = styled.div`
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

const ContinueButton = styled.button`
  @media (max-width: 767px) {
    margin: 1rem 0;
  }
  color: #fff;
  background-color: #5145cd;
  padding: 10px 40px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  display: block;
  width: auto;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  align-self: flex-end;
  :hover {
    opacity: 0.9;
  }
`;

const ButtonLink = styled(Link)`
  @media (max-width: 767px) {
    margin: 1rem 0;
  }
  width: 146px;
  color: #000 !important;
  background-color: #ff;
  padding: 10px 40px;
  border: 1px solid #cecece;
  outline: 0;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px !important;
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  align-self: flex-end;
  :hover {
    opacity: 0.9;
  }
`;

const HeroStyle = styled.div`
  border-radius: 0.5rem;
  @media (max-width: 768px) {
    border-radius: 0;
  }
  margin: 0 auto;
  max-width: 80rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  background-color: #fff;

  .content {
    width: 65%;
    padding: 60px 30px 60px 50px;
    @media (max-width: 768px) {
      width: 100%;
      padding: 30px 15px 30px 15px;
      text-align: center;
    }
    position: relative;
    background-color: #fff;
    > * {
      position: relative;
    }
  }
  h1 {
    font-size: 3rem;
    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 500;
    line-height: 1;
  }
  h2 {
    font-size: 1.5rem;
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 500;
    line-height: 1;
  }
  p {
    color: #6b7280;
    font-size: 1.25rem;
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    font-weight: 400;
    a {
      font-size: 1rem;
      color: #5949d0;
      :hover {
        text-decoration: underline;
      }
    }
  }
  .thumb {
    min-height: 400px;
    @media (max-width: 768px) {
      min-height: 0;
    }
    ${({ thumbImage = HERO_IMAGES_LIST[1] }) => `background: url(${require(`../../assets/${thumbImage}`)}) no-repeat center;`}
    background-size: cover;
    flex: 1;
    -webkit-clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
    clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
  }

  .diagorente {
    min-height: 400px;
    background: url(${require("../../assets/image-diagorente.png")}) no-repeat center;
    background-size: cover;
    flex: 1;
    -webkit-clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
    clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
  }
`;

const HeroContainer = styled.div`
  flex: 1;
  padding: 1rem;
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

const Hero = ({ children, ...props }) => <HeroStyle {...props}>{children}</HeroStyle>;

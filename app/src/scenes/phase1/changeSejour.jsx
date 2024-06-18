import Img2 from "../../assets/image-diagorente.png";
import React, { useState, useEffect } from "react";

import styled from "styled-components";
import Chevron from "../../components/Chevron";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import ModalConfirm from "../../components/modals/ModalConfirm";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { translate, HERO_IMAGES_LIST, SENDINBLUE_TEMPLATES } from "../../utils";
import Loader from "../../components/Loader";
import Badge from "../../components/Badge";
import { setYoung } from "../../redux/auth/actions";

import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { capture } from "../../sentry";
import { YOUNG_STATUS, getCohortPeriod, getCohortPeriodTemp } from "snu-lib";
import { getCohort } from "@/utils/cohorts";
import { supportURL } from "@/config";

export default function ChangeSejour() {
  const young = useSelector((state) => state.Auth.young);
  const [newSejour, setNewSejour] = useState("");
  const [motif, setMotif] = useState("");
  const [modalConfirmControlOk, setmodalConfirmControlOk] = useState(false);
  const [modalConfirmGoalReached, setmodalConfirmGoalReached] = useState(false);
  const [sejours, setSejours] = useState(null);
  const [isEligible, setIsElegible] = useState(false);
  const [messageTextArea, setMessageTextArea] = useState("");
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const dispatch = useDispatch();

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
        const { data } = await api.post(`/cohort-session/eligibility/2023/${young._id}`);
        const isArray = Array.isArray(data);
        if (isArray) {
          const availableCohorts = data.map((cohort) => cohort.name).filter((cohort) => (young.status === YOUNG_STATUS.WITHDRAWN ? cohort : cohort !== young.cohort));
          availableCohorts.push("à venir");
          setSejours(availableCohorts);
          setIsElegible(availableCohorts.length > 0);
        } else {
          setIsElegible(false);
          setSejours([]);
        }
      } catch (e) {
        capture(e);
        toastr.error("Oups, une erreur est survenue", translate(e.code));
      }
      setLoading(false);
    })();
  }, []);

  const onConfirmer = async () => {
    try {
      if (newSejour && motif && messageTextArea) {
        if (!young?.department) {
          toastr.error("Il n'y a pas de département pour ce jeune");
          throw new Error("Department is undefined");
        }
        if (newSejour === "à venir") {
          setmodalConfirmControlOk(true);
          return;
        }
        const res = await api.get(`/inscription-goal/${newSejour}/department/${young.department}/reached`);
        if (!res.ok) throw new Error(res);
        const isGoalReached = res.data;
        if (!isGoalReached) {
          setmodalConfirmControlOk(true);
        } else {
          setmodalConfirmGoalReached(true);
        }
      } else {
        toastr.error("Veuillez renseigner tous les champs", "");
      }
    } catch (error) {
      return toastr.error("Oups, une erreur est survenue lors de votre changement de cohorte", translate(error.code));
    }
  };

  const handleChangeSejour = async () => {
    try {
      const { ok, data, code } = await api.put("/young/" + young._id + "/change-cohort/", {
        cohortChangeReason: motif,
        cohortDetailedChangeReason: messageTextArea,
        cohort: newSejour,
      });
      if (!ok) {
        capture(new Error(code));
        return toastr.error("Oups, une erreur est survenue", translate(code));
      }
      toastr.success("Cohorte modifiée avec succés. Votre nouvelle session se tiendra en " + newSejour);
      dispatch(setYoung(data));
      setmodalConfirmControlOk(false);
      history.push("/phase1");
    } catch (e) {
      return toastr.error("Oups, une erreur est survenue lors de votre changement de cohorte :", translate(e.code));
    }
  };

  const handleWaitingList = async () => {
    try {
      const { ok, data, code } = await api.put("/young/" + young._id + "/change-cohort/", {
        cohortChangeReason: motif,
        cohortDetailedChangeReason: messageTextArea,
        cohort: newSejour,
      });
      if (!ok) {
        capture(new Error(code));
        return toastr.error("Oups, une erreur est survenue", translate(code));
      }
      toastr.success("Vous avez été ajouté en liste d'attente");
      await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_LIST}`);
      if (data) dispatch(setYoung(data));
      setmodalConfirmGoalReached(false);
      history.push("/");
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
                    Vous pouvez modifier les dates de votre séjour initialement prévu {getCohortPeriodTemp({ ...young, cohort: getCohort(young.cohort) })}.
                  </p>
                  <p style={{ marginTop: 10, marginBottom: 9, fontSize: 14, fontWeight: 500 }}>Dates de séjour</p>
                  <ActionBox color="#ffffff" width="375px">
                    <SectionHelp>
                      <UncontrolledDropdown setActiveFromChild>
                        <DropdownToggle tag="button">
                          {newSejour ? `Séjour ${newSejour}` : "Choisir un séjour"}
                          <Chevron color="#9a9a9a" />
                        </DropdownToggle>
                        <DropdownMenu>
                          {sejours.map((cohort) => {
                            return (
                              <DropdownItem key={cohort} className="dropdown-item" onClick={() => setNewSejour(cohort)}>
                                {`Séjour ${getCohortPeriod(getCohort(cohort))}`}
                              </DropdownItem>
                            );
                          })}
                        </DropdownMenu>
                      </UncontrolledDropdown>
                      <a
                        href="https:support.snu.gouv.fr/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion"
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
                          {motif || "Précisez la raison de votre changement de séjour"}
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
                            Ancien séjour :{" "}
                            <Badge color="#aaaaaa" backgroundColor="#F9FCFF" text={`Séjour ${getCohortPeriod(getCohort(young.cohort))}`} style={{ cursor: "default" }} />
                            <br />
                            Nouveau séjour :{" "}
                            <Badge color="#0C7CFF" backgroundColor="#F9FCFF" text={`Séjour ${getCohortPeriod(getCohort(newSejour))}`} style={{ cursor: "default" }} />
                            <div className="mt-2 text-xs">Cette action est irréversible, souhaitez-vous confirmer cette action ?</div>
                          </>
                        }
                        onCancel={() => setmodalConfirmControlOk(false)}
                        onConfirm={async () => {
                          await handleChangeSejour();
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
                        onConfirm={async () => {
                          await handleWaitingList();
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
              <h2>Vous n&apos;êtes éligible à aucun séjour de cohésion pour le moment.</h2>
              <br />
              <a
                href={supportURL + "/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion"}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-600 hover:underline underline-offset-2">
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
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
    /* background: url(images[../../assets/programmes-engagement/${HERO_IMAGES_LIST[1]}]?.default) no-repeat center; */
    background-size: cover;
    flex: 1;
    -webkit-clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
    clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
  }

  .diagorente {
    min-height: 400px;
    background: url(${Img2}) no-repeat center;
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

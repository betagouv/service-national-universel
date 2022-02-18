import React, { useState, useEffect } from "react";


import styled from "styled-components";
import Chevron from "../../components/Chevron";
import { Field, Formik } from "formik";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ModalConfirm from "../../components/modals/ModalConfirm";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { translate } from "../../utils";
import { YOUNG_STATUS_PHASE1 } from "../../utils";


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

  const motifs = [
    "Non disponibilité pour motif familial ou personnel",
    "Non disponibilité pour motif scolaire ou professionnel",
    "L'affectation ne convient pas",
    "Impossibilité de se rendre au point de rassemblement",
    "Autre",
  ];

  const options = ["Juillet 2022", "Juin 2022", "Février 2022"];

  useEffect(() => {
    (async function getInfo() {
      try {
        const { ok, code, data } = await api.post("/cohort-session/eligibility/2022", {
          birthDate: young.birthdateAt,
          schoolLevel: young.schoolLevel,
          department: young.department
        });
        console.log(data);
        console.log("######");
        console.log(young.cohort);
        console.log(young.cohortChangeReason);
        const sejourGoal = data.map(e => {
          console.log(e.inscriptionLimitDate);
          var date = new Date();
          console.log(date.toISOString());
          //if (e.inscriptionLimitDate > date.toISOSString())    date de fin de d'inscription aux séjours à récupérer         
          return { 'sejour': e.id, 'goal': e.goalReached }
        })

        const sejour = sejourGoal.map(e => e.sejour)

        setSejours(sejour);
        setIsElegible(!!data);
        setSejourGoal(sejourGoal);
      } catch (e) {
        toastr.error("Oups, une erreur est survenue", translate(e.code));
      }

    })()
  }, [])

  const onConfirmer = () => {
    if (newSejour && motif) {
      var isGoalTrue = sejourGoal.filter(obj => {
        if (obj.goal === true && obj.goal === newSejour)
          return obj.sejour === newSejour
      })
      //si le volontaire est en statut de phase 1 “affectée” et que les objectifs de recrutement sont atteint pour le nouveau séjour choisi

      console.log("##########2"+isGoalTrue)

      if (isGoalTrue.length === 0) {
        setmodalConfirmControlOk(true);
      }
      else {
        setmodalConfirmGoalReached(true);
      }
    }
  }

  const handleChangeSejour = async () => {
    try {
      console.log("handleChangeSejour");
      console.log(newSejour.type);
      console.log(typeof motif);
      await api.put('/young', {cohortChangeReason: motif })
      await api.put('/young', { cohort: newSejour });
      toastr.success("Cohorte modifiée avec succès");
      setmodalConfirmControlOk(false);
    } catch (e) {
      return toastr.error("Oups, une erreur est survenue lors de votre changement de cohorte :", translate(e.code));
    }
  }

  const handleWaitingList = async () => {
    try {
      console.log(['/cohort-session/'+young._id]);
      await api.put('/cohort-session/'+young._id,{ cohort: newSejour } );
      toastr.success("Vous avez été ajouté en liste d'attente");
      setmodalConfirmGoalReached(false);
    } catch (e) {
      return toastr.error("Oups, une erreur est survenue lors de votre changement de cohorte :", translate(e.code));
    }
  }



  return (
    <>
      {isEligible ? (
        <Wrapper>
          <Heading>
            <span>{`${young.firstName} ${young.lastName}`}</span>
            <h1>Changement de séjour</h1>
          </Heading>

          <>
            <h3 style={{ margin: 0 }}>Vous souhaitez changer de dates de séjour de cohésion ?</h3>
            <div style={{ display: "grid", marginBlock: "20px", gridTemplateColumns: "1fr 375px", gridGap: "20px", alignItems: "center", justifyItems: "left", minWidth: "75%" }}>
              <p style={{ margin: 0 }}>Choix du nouveau séjour de cohésion:</p>

              <ActionBox color="#ffffff" width="375px">
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
              </ActionBox>
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
                En savoir plus sur les séjours où je suis éligible.</a>
            </p>
            <div style={{ display: "grid", marginBlock: "20px", gridTemplateColumns: "1fr 375px", gridGap: "20px", alignItems: "center", justifyItems: "center", minWidth: "75%" }}>
              <p>
                <ContinueButton style={{ marginLeft: 10 }} onClick={() => onConfirmer()} >
                  Enregistrer
                </ContinueButton>
                <ModalConfirm
                  size="lg"
                  isOpen={modalConfirmControlOk}
                  title="Changement de séjour"
                  message={
                    <>
                      Êtes-vous sûr ? <br /> <br />
                      Vous vous apprêtez à changer de séjour pour le {newSejour}.
                      Cette action est irréversible, souhaitez-vous confirmer cette action ?  <br />
                    </>
                  }
                  onCancel={() => setmodalConfirmControlOk(false)}
                  onConfirm={() => {
                    handleChangeSejour();
                  }}
                  disableConfirm={!motif}
                  showHeaderIcon={true}>
                </ModalConfirm>
                <ModalConfirm
                  size="lg"
                  isOpen={modalConfirmGoalReached}
                  title="Changement de séjour"
                  message={
                    <>
                      Malheureusement il n&apos;y a plus de place disponible actuellement pour ce séjour .
                      Vous allez être positionné(e) sur liste complémentaire et vous serez averti(e) si des places se libérent. <br /> <br />
                      Souhaitez-vous maintenir votre choix de séjour ?

                    </>
                  }
                  onCancel={() => setmodalConfirmGoalReached(false)}
                  onConfirm={() => {
                    handleWaitingList();
                  }}
                  disableConfirm={!motif}
                  showHeaderIcon={true}>
                </ModalConfirm>
              </p>
              <p>
                <ContinueButton>
                  <Button to="/phase1">
                    Annuler
                  </Button>
                </ContinueButton>
              </p>
            </div>
          </>
        </Wrapper>
      ) :
        (
          <Wrapper>
            <h2>
              Vous n&apos;êtes élégible à aucun séjour de cohésion pour le moment.
            </h2>
            <a href="https://support.snu.gouv.fr/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion-en-2022-1" style={{ color: "#5145cc" }}>
              En savoir plus sur les séjours où je suis éligible.</a>
          </Wrapper>
        )
      }

    </>
  );

};




const Wrapper = styled.div`
  padding: 20px 40px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;

const Heading = styled.div`
  margin-bottom: 30px;
  span {
    color: #42389d;
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 5px;
  }
  h1 {
    color: #161e2e;
    margin-bottom: 0;
    font-size: 3rem;
    @media (max-width: 767px) {
      font-size: 1.8rem;
    }
    font-weight: 800;
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

const Button = styled(Link)`
  color: #fff;
  :hover {
    opacity: 0.9;
    color: #fff;
  }
`;
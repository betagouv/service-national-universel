import React, { useEffect, useState } from "react";
import { IoWarningOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { DropdownItem, DropdownMenu, DropdownToggle, Modal, UncontrolledDropdown } from "reactstrap";
import { ROLES, translate, translateCohort } from "snu-lib";
import IconChangementCohorte from "../../../assets/IconChangementCohorte";
import Pencil from "../../../assets/icons/Pencil";
import Badge from "../../../components/Badge";
import Chevron from "../../../components/Chevron";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import api from "../../../services/api";
import { BorderButton, PlainButton } from "./Buttons";

export function ChangeCohortPen({ young, onChange }) {
  const user = useSelector((state) => state.Auth.user);
  const disabled = ![ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role);
  const [changeCohortModal, setChangeCohortModal] = useState(false);
  const [options, setOptions] = useState(null);

  const getEligibleCohorts = async () => {
    const { data } = await api.post("/cohort-session/eligibility/2023", {
      birthDate: young.birthdateAt,
      schoolLevel: young.grade,
      department: young.department,
      frenchNationality: young.frenchNationality,
    });
    const isArray = Array.isArray(data);
    if (isArray) {
      const options = data.map((c) => ({ name: c.name, goal: c.goalReached })).filter((c) => c.name !== young.cohort);
      setOptions(options);
    } else {
      setOptions([]);
    }
  };

  useEffect(() => {
    if (young) {
      getEligibleCohorts();
    }
  }, [young]);

  if (disabled) return null;
  if (options === null || options.length === 0) return null;

  return (
    <>
      <div
        className="flex items-center justify-center p-[9px] rounded-[4px] cursor-pointer border-[1px] border-[transparent] hover:border-[#E5E7EB] mr-[15px]"
        onClick={() => setChangeCohortModal(true)}>
        <Pencil stroke="#66A7F4" className="w-[11px] h-[11px]" />
      </div>
      <ChangeCohortModal isOpen={changeCohortModal} young={young} options={options} close={() => setChangeCohortModal(false)} onChange={onChange} />
    </>
  );
}

function ChangeCohortModal({ isOpen, young, close, onChange, options }) {
  const [modalConfirmWithMessage, setModalConfirmWithMessage] = useState(false);
  const [newCohort, setNewCohort] = useState({});
  const [motif, setMotif] = useState("");
  const [message, setMessage] = useState("");

  const motifs = [
    "Non disponibilité pour motif familial ou personnel",
    "Non disponibilité pour motif scolaire ou professionnel",
    "L’affectation ne convient pas",
    "Impossibilité de se rendre au point de rassemblement",
    "Autre",
  ];

  async function handleChangeCohort() {
    try {
      await api.put(`/referent/young/${young._id}/change-cohort`, { cohort: newCohort.name, message, cohortChangeReason: motif });
      await onChange();
      toastr.success("Cohorte modifiée avec succès");
      setModalConfirmWithMessage(false);
    } catch (e) {
      return toastr.error("Oups, une erreur est survenue pendant le changement de cohorte du volontaire :", translate(e.code));
    }
  }

  return (
    <>
      <ModalConfirm
        size="lg"
        isOpen={isOpen}
        title="Changement de cohorte"
        message={
          <>
            Vous êtes sur le point de changer la cohorte de {young.firstName} {young.lastName}. <br />
          </>
        }
        onCancel={close}
        onConfirm={() => {
          close();
          setModalConfirmWithMessage(true);
        }}
        disableConfirm={!motif}
        showHeaderIcon={true}
        showHeaderText={false}>
        <>
          <div style={{ display: "grid", marginBlock: "20px", gridTemplateColumns: "1fr 375px", gridGap: "20px", alignItems: "center", justifyItems: "left", minWidth: "75%" }}>
            <p style={{ margin: 0 }}>Précisez le motif de changement de séjour :</p>

            <div className="text-[#9a9a9a] bg-[#ffffff] w-[375px]">
              <UncontrolledDropdown setActiveFromChild>
                <DropdownToggle tag="button">
                  <div className="border-[#D1D5DB] border-[1px] rounded-[100px] bg-white flex items-center justify-between w-[375px] py-[4px] px-[15px]">
                    {motif || <p></p>}
                    <Chevron color="#9a9a9a" style={{ padding: 0, margin: 0, marginLeft: "15px" }} />
                  </div>
                </DropdownToggle>
                <DropdownMenu right>
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
            </div>
            <p style={{ margin: 0 }}>Choix de la nouvelle cohorte :</p>
            <CohortDropDown cohort={newCohort} onClick={(value) => setNewCohort(value)} options={options} />
          </div>
          <p style={{ margin: 0, marginTop: "16px" }}>
            Veuillez vous assurer de son éligibilité , pour en savoir plus consulter{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href=" https://support.snu.gouv.fr/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion-en-2022-1"
              style={{ color: "#5145cc" }}>
              l’article de la base de connaissance
            </a>
          </p>
        </>
      </ModalConfirm>
      <Modal size="lg" centered isOpen={modalConfirmWithMessage}>
        <div className="bg-white rounded-[8px]">
          <div className="px-[24px] pt-[24px]">
            <h1 className="text-[20px] leading-[28px] text-red-500 mt-[24px] text-center">ALERTE</h1>
            {/* {newCohort.goal === true ? (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 px-4 py-3 my-4 mx-4 rounded-lg">
                <div className="flex gap-2 items-center">
                  <IoWarningOutline className="h-6 w-6" />
                  <p className="font-bold">Attention</p>
                </div>
                <p className="text-sm">
                  Malheureusement il n&apos;y a plus de place disponible actuellement pour ce séjour. Le volontaire va être positionné(e) sur liste complémentaire.
                </p>
              </div>
            ) : null} */}
            <p className="text-[14px] leading-[20px] text-[#6B7280] mt-[8px] text-center">
              Veuillez éditer le message ci-dessous pour préciser le motif de changement de cohorte avant de l’envoyer :
            </p>
            <div className="flex flex-col mt-[24px] w-2/3 items-center justify-center text-center mx-auto">
              Bonjour {young.firstName} {young.lastName}, Votre changement de séjour pour le Service National Universel a été pris en compte.
              <div className="mt-2">
                Ancien séjour : <Badge color="#aaaaaa" backgroundColor="#F9FCFF" text={young.cohort} style={{ cursor: "default" }} />
              </div>
              <div>
                Nouveau séjour : <Badge color="#0C7CFF" backgroundColor="#F9FCFF" text={translateCohort(newCohort.name)} style={{ cursor: "default" }} />
              </div>
              <textarea className="border-[1px] rounded-lg w-full mt-2 p-2" placeholder="Votre message..." rows="5" value={message} onChange={(e) => setMessage(e.target.value)} />
              <div className="mt-2">
                Cordialement, <br /> Les équipes du Service National Universel
              </div>
            </div>
          </div>
          <div className="flex p-[24px] items-center justify-between">
            <BorderButton onClick={() => setModalConfirmWithMessage(false)} className="mr-[6px] grow">
              Annuler
            </BorderButton>
            <PlainButton onClick={handleChangeCohort} className="ml-[6px] grow">
              Confirmer
            </PlainButton>
          </div>
        </div>
      </Modal>
    </>
  );
}

function CohortDropDown({ originalCohort, cohort, onClick, options }) {
  const user = useSelector((state) => state.Auth.user);
  const disabled = ![ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role);
  const [ops, setOps] = useState(options);

  useEffect(() => {
    setOps(options.filter((e) => e.name !== cohort.name));
  }, [cohort, options]);

  return (
    <div className={` w-[375px] `}>
      <UncontrolledDropdown setActiveFromChild>
        <DropdownToggle tag="button" disabled={disabled}>
          <div className={`flex items-center justify-between gap-1 w-[375px] py-[4px] px-[15px] text-[#0C7CFF] border-[#0C7CFF] border-[1px] rounded-[100px] bg-[#F9FCFF]`}>
            {originalCohort ? <IconChangementCohorte /> : <p></p>}
            {cohort?.name || <p></p>}
            {!disabled ? <Chevron color="#0C7CFF" style={{ padding: 0, margin: 0, marginLeft: "15px" }} /> : null}
          </div>
        </DropdownToggle>
        <DropdownMenu>
          {ops.length > 0 ? (
            options
              .filter((e) => e.name !== cohort.name)
              .map((op) => {
                return (
                  <DropdownItem key={op.name} className="dropdown-item" onClick={() => onClick(op)}>
                    Cohorte {op.name}
                  </DropdownItem>
                );
              })
          ) : (
            <DropdownItem className="dropdown-item">Aucune autre cohorte disponible</DropdownItem>
          )}
        </DropdownMenu>
      </UncontrolledDropdown>
    </div>
  );
}

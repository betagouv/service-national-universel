import React, { useEffect, useState } from "react";
import { IoWarningOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { DropdownItem, DropdownMenu, DropdownToggle, Modal, UncontrolledDropdown } from "reactstrap";
import { ROLES, translate, translateCohort, YOUNG_STATUS, calculateAge } from "snu-lib";
import IconChangementCohorte from "../../../assets/IconChangementCohorte";
import Pencil from "../../../assets/icons/Pencil";
import Badge from "../../../components/Badge";
import Chevron from "../../../components/Chevron";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import api from "../../../services/api";
import { BorderButton, PlainButton } from "./Buttons";

export function ChangeCohortPen({ young, onChange }) {
  const user = useSelector((state) => state.Auth.user);
  const [changeCohortModal, setChangeCohortModal] = useState(false);
  const [options, setOptions] = useState(null);

  const disabled = ![ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role);
  let unmounted = false;

  useEffect(() => {
    if (young) {
      (async function getSessions() {
        const isEligibleForCohortToCome = calculateAge(young.birthdateAt, new Date("2023-09-30")) < 18;
        const cohortToCome = { name: "à venir", isEligible: isEligibleForCohortToCome };
        if (user.role !== ROLES.ADMIN) {
          setOptions(isEligibleForCohortToCome && young.cohort !== "à venir" ? [cohortToCome] : []);
          return;
        }
        const { data } = await api.post(`/cohort-session/eligibility/2023/${young._id}`);
        if (Array.isArray(data)) {
          const cohorts = data.map((c) => ({ name: c.name, goal: c.goalReached, isEligible: c.isEligible })).filter((c) => c.name !== young.cohort);
          cohorts.push(cohortToCome);
          if (!unmounted) setOptions(cohorts);
        } else if (!unmounted) setOptions([]);
      })();
    }
    return () => {
      unmounted = true;
    };
  }, [young]);

  if (disabled) return null;
  if (options === null || options.length === 0) return null;

  return (
    <>
      <div
        className="mr-[15px] flex cursor-pointer items-center justify-center rounded-[4px] border-[1px] border-[transparent] p-[9px] hover:border-[#E5E7EB]"
        onClick={() => setChangeCohortModal(true)}>
        <Pencil stroke="#66A7F4" className="h-[11px] w-[11px]" />
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
  const [fillingRateMet, setFillingRateMet] = useState(false);

  const verifyFillingRate = async () => {
    if (newCohort?.name === "à venir") return setModalConfirmWithMessage(true);
    const res = await api.get(`/inscription-goal/${newCohort?.name}/department/${young.department}`);
    if (!res.ok) throw new Error(res);
    const fillingRate = res.data;
    if (fillingRate >= 1.05) {
      setFillingRateMet(true);
    }
    setModalConfirmWithMessage(true);
  };

  useEffect(() => {
    if (modalConfirmWithMessage === false) {
      setFillingRateMet(false);
    }
  }, [modalConfirmWithMessage]);

  const motifs = [
    "Non disponibilité pour motif familial ou personnel",
    "Non disponibilité pour motif scolaire ou professionnel",
    "L’affectation ne convient pas",
    "Impossibilité de se rendre au point de rassemblement",
    "Autre",
  ];

  async function handleChangeCohort() {
    try {
      if (!message) return toastr.error("Veuillez indiquer un message");
      await api.put(`/referent/young/${young._id}/change-cohort`, { cohort: newCohort.name, message, cohortChangeReason: motif });
      if (young.status === YOUNG_STATUS.VALIDATED && fillingRateMet) await api.put(`/referent/young/${young._id}`, { status: YOUNG_STATUS.WAITING_LIST });
      if (young.status === YOUNG_STATUS.WAITING_LIST && !fillingRateMet) await api.put(`/referent/young/${young._id}`, { status: YOUNG_STATUS.VALIDATED });
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
          verifyFillingRate();
        }}
        disableConfirm={!motif || !newCohort.name}
        showHeaderIcon={true}
        showHeaderText={false}>
        <>
          <div style={{ display: "grid", marginBlock: "20px", gridTemplateColumns: "1fr 375px", gridGap: "20px", alignItems: "center", justifyItems: "left", minWidth: "75%" }}>
            <p style={{ margin: 0 }}>Précisez le motif de changement de séjour :</p>

            <div className="w-[375px] bg-[#ffffff] text-[#9a9a9a]">
              <UncontrolledDropdown setActiveFromChild>
                <DropdownToggle tag="button">
                  <div className="flex w-[375px] items-center justify-between rounded-[100px] border-[1px] border-[#D1D5DB] bg-white py-[4px] px-[15px]">
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
            <a target="_blank" rel="noreferrer" href="https://support.snu.gouv.fr/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion" style={{ color: "#5145cc" }}>
              l’article de la base de connaissance
            </a>
          </p>
        </>
      </ModalConfirm>
      <Modal size="lg" centered isOpen={modalConfirmWithMessage}>
        <div className="rounded-[8px] bg-white">
          <div className="px-[24px] pt-[24px]">
            <h1 className="mt-[24px] text-center text-[20px] leading-[28px] text-red-500">ALERTE</h1>
            {fillingRateMet && young.status !== YOUNG_STATUS.VALIDATED && (
              <div className="my-4 mx-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-100 px-4 py-3 text-yellow-700">
                <div className="flex items-center gap-2">
                  <IoWarningOutline className="h-6 w-6" />
                  <p className="font-bold">Objectif d&apos;inscription départementale atteint</p>
                </div>
                <p className="text-l">L&apos;objectif d&apos;inscription de votre département a été atteint à 105%.</p>
              </div>
            )}
            {fillingRateMet && young.status === YOUNG_STATUS.VALIDATED && (
              <div className="my-4 mx-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-100 px-4 py-3 text-yellow-700">
                <div className="flex items-center gap-2">
                  <IoWarningOutline className="h-6 w-6" />
                  <p className="font-bold">Objectif d&apos;inscription départementale atteint</p>
                </div>
                <p className="text-l">
                  L&apos;objectif d&apos;inscription de votre département a été atteint à 105%. Le dossier de {young.firstName} {young.lastName} va être{" "}
                  <strong className="text-bold uppercase">validé sur liste complémentaire</strong>.
                </p>
              </div>
            )}
            <p className="mt-[8px] text-center text-[14px] leading-[20px] text-[#6B7280]">
              Veuillez éditer le message ci-dessous pour préciser le motif de changement de cohorte avant de l’envoyer :
            </p>
            <div className="mx-auto mt-[24px] flex w-2/3 flex-col items-center justify-center text-center">
              Bonjour {young.firstName} {young.lastName}, Votre changement de séjour pour le Service National Universel a été pris en compte.
              <div className="mt-2">
                Ancien séjour : <Badge color="#aaaaaa" backgroundColor="#F9FCFF" text={young.cohort} style={{ cursor: "default" }} />
              </div>
              <div>
                Nouveau séjour : <Badge color="#0C7CFF" backgroundColor="#F9FCFF" text={translateCohort(newCohort.name)} style={{ cursor: "default" }} />
              </div>
              <textarea className="mt-2 w-full rounded-lg border-[1px] p-2" placeholder="Votre message..." rows="5" value={message} onChange={(e) => setMessage(e.target.value)} />
              <div className="mt-2">
                Cordialement, <br /> Les équipes du Service National Universel
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-[24px]">
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
          <div className={`flex w-[375px] items-center justify-between gap-1 rounded-[100px] border-[1px] border-[#0C7CFF] bg-[#F9FCFF] py-[4px] px-[15px] text-[#0C7CFF]`}>
            {originalCohort ? <IconChangementCohorte /> : <p></p>}
            {cohort?.name || <p></p>}
            {!disabled ? <Chevron color="#0C7CFF" style={{ padding: 0, margin: 0, marginLeft: "15px" }} /> : null}
          </div>
        </DropdownToggle>
        <DropdownMenu className="max-h-[25vh] overflow-scroll">
          {ops.length > 0 ? (
            options
              .filter((e) => e.name !== cohort.name)
              .map((op) => {
                return (
                  <DropdownItem key={op.name} className="dropdown-item" onClick={() => onClick(op)}>
                    Cohorte {op.name}
                    {!op.isEligible && " (non éligible)"}
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

import React, { useState } from "react";
import Title from "../../../components/views/Title";
import { canViewEmailHistory, ROLES, translateCohort } from "../../../utils";
import Badge from "../../../components/Badge";
import TabList from "../../../components/views/TabList";
import Tab from "./Tab";
import { appURL } from "../../../config";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { useSelector } from "react-redux";
import Pencil from "../../../assets/icons/Pencil";
import History from "../../../assets/icons/History";
import Field from "./Field";
import { translate } from "snu-lib";
import { Button } from "./Buttons";
import Bin from "../../../assets/Bin";
import TakePlace from "../../../assets/icons/TakePlace";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import { toastr } from "react-redux-toastr";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import IconChangementCohorte from "../../../assets/IconChangementCohorte";
import Chevron from "../../../components/Chevron";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";

export default function YoungHeader({ young, tab, onChange }) {
  const user = useSelector((state) => state.Auth.user);
  const [notesCount, setNotesCount] = useState(0); // TODO: pour l'instant on ne sait pas ce que c'est ???
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  function onClickDelete() {
    setConfirmModal({
      isOpen: true,
      onConfirm: onConfirmDelete,
      title: "Êtes-vous sûr(e) de vouloir supprimer ce volontaire ?",
      message: "Cette action est irréversible.",
    });
  }

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.put(`/young/${young._id}/soft-delete`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Ce volontaire a été supprimé.");
      return history.push("/inscription");
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du volontaire :", translate(e.code));
    }
  };

  return (
    <div className="px-[30px] pt-[15px] flex items-end border-b-[#E5E7EB] border-b-[1px]">
      <div className="grow">
        <Title>
          <div className="mr-[15px]">
            {young.firstName} {young.lastName}
          </div>
          <Badge color="#66A7F4" backgroundColor="#F9FCFF" text={young.cohort} />
          <EditCohortButton young={young} onChange={onChange} />
          {young.originalCohort && (
            <Badge color="#9A9A9A" backgroundColor="#F6F6F6" text={young.originalCohort} tooltipText={`Anciennement ${young.originalCohort}`} style={{ cursor: "default" }} />
          )}
        </Title>
        <TabList className="mt-[30px]">
          <Tab isActive={tab === "file"} onClick={() => history.push(`/volontaire/${young._id}`)}>
            Dossier d&apos;inscription
          </Tab>
          <Tab isActive={tab === "historique"} onClick={() => history.push(`/volontaire/${young._id}/historique`)}>
            <div className="flex items-center">
              <History className="block flex-[0_0_18px] mr-[8px]" fill="#9CA3AF" />
              Historique
            </div>
          </Tab>
          {canViewEmailHistory(user) ? (
            <Tab isActive={tab === "notifications"} disabled onClick={() => history.push(`/volontaire/${young._id}/notifications`)}>
              Notifications
            </Tab>
          ) : null}
          <Tab isActive={tab === "notes"} onClick={() => history.push(`/volontaire/${young._id}/notes`)}>
            ({notesCount}) Notes internes
          </Tab>
        </TabList>
      </div>
      <div className="ml-[30px]">
        <div className="">
          <Field mode="readonly" name="status" label="Inscription" value={translate(young.status)} />
          <div className="flex items-center justify-between my-[15px]">
            <Button icon={<Bin fill="red" />} onClick={onClickDelete}>
              Supprimer
            </Button>
            <Button
              className="ml-[8px]"
              icon={<TakePlace className="text-[#6B7280]" />}
              href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${young._id}`}
              onClick={() => plausibleEvent("Volontaires/CTA - Prendre sa place")}>
              Prendre sa place
            </Button>
          </div>
        </div>
      </div>
      <ModalConfirm
        isOpen={confirmModal?.isOpen}
        title={confirmModal?.title}
        message={confirmModal?.message}
        onCancel={() => setConfirmModal({ isOpen: false })}
        onConfirm={() => {
          confirmModal?.onConfirm();
          setConfirmModal({ isOpen: false });
        }}
      />
    </div>
  );
}

function EditCohortButton({ young, onChange }) {
  const user = useSelector((state) => state.Auth.user);
  const options = ["à venir"];
  const disabled = ![ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role);
  const [newCohort, setNewCohort] = useState(young.cohort);
  const [changeCohortModal, setChangeCohortModal] = useState(false);

  function onSelect(value) {
    setNewCohort(value);
    setChangeCohortModal(true);
  }

  return (
    <UncontrolledDropdown setActiveFromChild>
      <DropdownToggle tag="button" disabled={disabled}>
        <div className="flex items-center justify-center p-[9px] rounded-[4px] cursor-pointer border-[1px] border-[transparent] hover:border-[#E5E7EB] mr-[15px]">
          <Pencil stroke="#66A7F4" className="w-[11px] h-[11px]" />
        </div>
      </DropdownToggle>
      <DropdownMenu>
        {options
          .filter((e) => e !== young.cohort)
          .map((status) => {
            return (
              <DropdownItem key={status} className="dropdown-item" onClick={() => onSelect(status)}>
                Cohorte {status}
              </DropdownItem>
            );
          })}
      </DropdownMenu>
      <ChangeCohortModal isOpen={changeCohortModal} young={young} cohort={newCohort} close={() => setChangeCohortModal(false)} onChange={onChange} />
    </UncontrolledDropdown>
  );
}

function ChangeCohortModal({ isOpen, young, cohort, close, onChange }) {
  const [modalConfirmWithMessage, setModalConfirmWithMessage] = useState(false);
  const [newCohort, setNewCohort] = useState(cohort);
  const [motif, setMotif] = useState("");

  const motifs = [
    "Non disponibilité pour motif familial ou personnel",
    "Non disponibilité pour motif scolaire ou professionnel",
    "L’affectation ne convient pas",
    "Impossibilité de se rendre au point de rassemblement",
    "Autre",
  ];

  async function handleChangeCohort(message) {
    try {
      await api.put(`/referent/young/${young._id}/change-cohort`, { cohort: newCohort, message, cohortChangeReason: motif });
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
            </div>
            <p style={{ margin: 0 }}>Choix de la nouvelle cohorte :</p>
            <CohortDropDown cohort={newCohort} onClick={(value) => setNewCohort(value)} width="375px" />
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
      <ModalConfirmWithMessage
        isOpen={modalConfirmWithMessage}
        title="Veuillez éditer le message ci-dessous pour préciser le motif de changement de cohorte avant de l’envoyer"
        message={
          <>
            Bonjour {young.firstName} {young.lastName},<br />
            Votre changement de séjour pour le Service National Universel a été pris en compte. <br />
            Ancien séjour : <Badge color="#aaaaaa" backgroundColor="#F9FCFF" text={young.cohort} style={{ cursor: "default" }} />
            <br />
            Nouveau séjour : <Badge color="#0C7CFF" backgroundColor="#F9FCFF" text={translateCohort(newCohort)} style={{ cursor: "default" }} />
          </>
        }
        onChange={() => setModalConfirmWithMessage(false)}
        onConfirm={handleChangeCohort}
        endMessage={
          <p>
            Cordialement <br /> Les équipes du Service National Universel
          </p>
        }
      />
    </>
  );
}

function CohortDropDown({ originalCohort, cohort, onClick, width }) {
  const user = useSelector((state) => state.Auth.user);
  const options = ["à venir"];
  const disabled = ![ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role);

  return (
    <div className={`text-[#0C7CFF] bg-[#F9FCFF] w-[${width}] border-[#0C7CFF] border-[1px] rounded-[100px]`}>
      <UncontrolledDropdown setActiveFromChild>
        <DropdownToggle tag="button" disabled={disabled}>
          <div className={`flex items-center gap-1 justify-between w-[${width}] py-[4px] px-[15px]`}>
            {originalCohort ? <IconChangementCohorte /> : null}
            {cohort}
            {!disabled ? <Chevron color="#0C7CFF" style={{ padding: 0, margin: 0, marginLeft: "15px" }} /> : null}
          </div>
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
    </div>
  );
}

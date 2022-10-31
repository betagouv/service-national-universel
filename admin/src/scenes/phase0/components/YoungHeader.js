import React, { useEffect, useState } from "react";
import Title from "../../../components/views/Title";
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
import { translate, YOUNG_STATUS, canViewEmailHistory, ROLES, translateCohort, WITHRAWN_REASONS, SENDINBLUE_TEMPLATES, YOUNG_PHASE } from "snu-lib";
import { Button } from "./Buttons";
import Bin from "../../../assets/Bin";
import TakePlace from "../../../assets/icons/TakePlace";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import { toastr } from "react-redux-toastr";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import IconChangementCohorte from "../../../assets/IconChangementCohorte";
import Chevron from "../../../components/Chevron";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";
import { useHistory } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";
import ChevronDown from "../../../assets/icons/ChevronDown";
import Warning from "../../../assets/icons/Warning";

const blueBadge = { color: "#66A7F4", backgroundColor: "#F9FCFF" };
const greyBadge = { color: "#9A9A9A", backgroundColor: "#F6F6F6" };

export default function YoungHeader({ young, tab, onChange, phase = YOUNG_PHASE.INSCRIPTION }) {
  const user = useSelector((state) => state.Auth.user);
  // const [notesCount, setNotesCount] = useState(0); // TODO: pour l'instant c'est caché
  const [confirmModal, setConfirmModal] = useState(null);
  const history = useHistory();
  const [statusOptions, setStatusOptions] = useState([]);
  const [withdrawn, setWithdrawn] = useState({ reason: "", message: "" });

  useEffect(() => {
    if (young) {
      let options = [];
      switch (young.status) {
        case YOUNG_STATUS.WAITING_LIST:
          options = [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WITHDRAWN];
          break;
        case YOUNG_STATUS.WITHDRAWN:
          if (user.role === ROLES.ADMIN) {
            options = [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WAITING_LIST];
          }
          break;
        case YOUNG_STATUS.VALIDATED:
          options = [YOUNG_STATUS.WITHDRAWN];
          break;
      }
      setStatusOptions(options.map((opt) => ({ value: opt, label: translate(opt) })));
    } else {
      setStatusOptions([]);
    }
  }, [young]);

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

  function onSelectStatus(status) {
    setWithdrawn({ reason: "", message: "", error: null });

    setConfirmModal({
      icon: <Warning className="text-[#D1D5DB] w-[36px] h-[36px]" />,
      title: "Modification de statut",
      message: `Êtes-vous sûr(e) de vouloir modifier le statut de ce profil? Un email sera automatiquement envoyé à l'utlisateur.`,
      type: status,
    });
  }

  const withdrawnReasonOptions = [
    <option key="none" value="">
      Motif
    </option>,
    ...WITHRAWN_REASONS.map((reason) => (
      <option key={reason.value} value={reason.value}>
        {reason.label}
      </option>
    )),
  ];

  async function onConfirm() {
    if (confirmModal.type === YOUNG_STATUS.WITHDRAWN) {
      if (withdrawn.reason === "") {
        setWithdrawn({ ...withdrawn, error: "Vous devez obligatoirement sélectionner un motif." });
        return;
      } else if (withdrawn.reason === "other" && withdrawn.message.trim().length === 0) {
        setWithdrawn({ ...withdrawn, error: "Pour le motif 'Autre', vous devez précisez un message." });
        return;
      } else {
        setWithdrawn({ ...withdrawn, error: null });
      }
      await changeStatus(confirmModal.type, { withdrawnReason: withdrawn.reason, withdrawnMessage: withdrawn.message });
    } else {
      await changeStatus(confirmModal.type);
    }
  }

  async function changeStatus(status, values = {}) {
    const prevStatus = young.status;
    if (status === "WITHDRAWN") {
      young.historic.push({
        phase,
        userName: `${user.firstName} ${user.lastName}`,
        userId: user._id,
        status,
        note: WITHRAWN_REASONS.find((r) => r.value === values?.withdrawnReason)?.label + " " + values?.withdrawnMessage,
      });
    } else {
      young.historic.push({ phase, userName: `${user.firstName} ${user.lastName}`, userId: user._id, status, note: values?.note });
    }
    young.status = status;
    const now = new Date();
    young.lastStatusAt = now.toISOString();
    if (status === "WITHDRAWN" && (values?.withdrawnReason || values?.withdrawnMessage)) {
      young.withdrawnReason = values?.withdrawnReason;
      young.withdrawnMessage = values?.withdrawnMessage || "";
    }
    if (status === "WAITING_CORRECTION" && values?.note) young.inscriptionCorrectionMessage = values?.note;
    if (status === "REFUSED" && values?.note) young.inscriptionRefusedMessage = values?.note;
    if (status === YOUNG_STATUS.VALIDATED && phase === YOUNG_PHASE.INTEREST_MISSION) young.phase = YOUNG_PHASE.CONTINUE;
    try {
      // we decided to let the validated youngs in the INSCRIPTION phase
      // referents use the export and need ALL the youngs of the current year
      // we'll pass every youngs currently in INSCRIPTION in COHESION_STAY once the campaign is done (~20 april 2021)

      // if (status === YOUNG_STATUS.VALIDATED && young.phase === YOUNG_PHASE.INSCRIPTION) {
      //   young.phase = YOUNG_PHASE.COHESION_STAY;
      // }

      const { lastStatusAt, withdrawnMessage, phase, inscriptionCorrectionMessage, inscriptionRefusedMessage, withdrawnReason } = young;

      const { ok, code } = await api.put(`/referent/young/${young._id}`, {
        status: young.status,
        lastStatusAt,
        withdrawnMessage,
        phase,
        inscriptionCorrectionMessage,
        inscriptionRefusedMessage,
        withdrawnReason,
      });
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));

      if (status === YOUNG_STATUS.VALIDATED && phase === YOUNG_PHASE.INSCRIPTION) {
        if (prevStatus === "WITHDRAWN") await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_REACTIVATED}`);
        else await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_VALIDATED}`);
      }
      if (status === YOUNG_STATUS.WAITING_LIST) {
        await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_LIST}`);
      }

      onChange && onChange();
      toastr.success("Mis à jour!");
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  }

  return (
    <div className="px-[30px] pt-[15px] flex items-end border-b-[#E5E7EB] border-b-[1px]">
      <div className="grow">
        <Title>
          <div className="mr-[15px]">{young.status === YOUNG_STATUS.DELETED ? "Compte supprimé" : young.firstName + " " + young.lastName}</div>
          <Badge {...(young.status === YOUNG_STATUS.DELETED ? greyBadge : blueBadge)} text={young.cohort} />
          {young.status !== YOUNG_STATUS.DELETED && (
            <>
              <EditCohortButton young={young} onChange={onChange} />
              {young.originalCohort && <Badge {...greyBadge} text={young.originalCohort} tooltipText={`Anciennement ${young.originalCohort}`} style={{ cursor: "default" }} />}
            </>
          )}
        </Title>
        <TabList className="mt-[30px]">
          <Tab isActive={tab === "file"} onClick={() => history.push(`/volontaire/${young._id}`)}>
            Dossier d&apos;inscription
          </Tab>
          {young.status !== YOUNG_STATUS.WAITING_CORRECTION && young.status !== YOUNG_STATUS.WAITING_VALIDATION && (
            <>
              <Tab isActive={tab === "phase1"} onClick={() => history.push(`/volontaire/${young._id}/phase1`)}>
                Phase 1
              </Tab>
              <Tab isActive={tab === "phase2"} onClick={() => history.push(`/volontaire/${young._id}/phase2`)}>
                Phase 2
              </Tab>
              <Tab isActive={tab === "phase3"} onClick={() => history.push(`/volontaire/${young._id}/phase3`)}>
                Phase 3
              </Tab>
            </>
          )}
          <Tab isActive={tab === "historique"} onClick={() => history.push(`/volontaire/${young._id}/historique`)}>
            <div className="flex items-center">
              <History className="block flex-[0_0_18px] mr-[8px]" fill="#9CA3AF" />
              Historique
            </div>
          </Tab>
          {canViewEmailHistory(user) ? (
            <Tab isActive={tab === "notifications"} onClick={() => history.push(`/volontaire/${young._id}/notifications`)}>
              Notifications
            </Tab>
          ) : null}
          {/*<Tab isActive={tab === "notes"} onClick={() => history.push(`/volontaire/${young._id}/notes`)}>
            ({notesCount}) Notes internes
          </Tab>*/}
        </TabList>
      </div>
      <div className="ml-[30px]">
        <div className="">
          <Field
            mode="edition"
            name="status"
            label={translate(phase)}
            value={young.status}
            transformer={translate}
            type="select"
            options={statusOptions}
            onChange={onSelectStatus}
            className={young.status === YOUNG_STATUS.DELETED ? "mb-[15px]" : ""}
          />
          {young.status !== YOUNG_STATUS.DELETED && (
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
          )}
        </div>
      </div>
      {confirmModal && (
        <ConfirmationModal
          isOpen={true}
          icon={confirmModal.icon}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmLabel || "Confirmer"}
          confirmMode={confirmModal.confirmColor || "blue"}
          onCancel={() => setConfirmModal(null)}
          onConfirm={onConfirm}>
          {confirmModal.type === YOUNG_STATUS.WITHDRAWN && (
            <div className="mt-[24px]">
              <div className="w-[100%] bg-white border-[#D1D5DB] border-[1px] rounded-[6px] mb-[16px] flex items-center pr-[15px]">
                <select
                  value={withdrawn.reason}
                  onChange={(e) => setWithdrawn({ ...withdrawn, reason: e.target.value })}
                  className="block grow p-[15px] bg-[transparent] appearance-none">
                  {withdrawnReasonOptions}
                </select>
                <ChevronDown className="flex-[0_0_16px] text-[#6B7280]" />
              </div>
              <textarea
                value={withdrawn.message}
                onChange={(e) => setWithdrawn({ ...withdrawn, message: e.target.value })}
                className="w-[100%] bg-white border-[#D1D5DB] border-[1px] rounded-[6px] p-[15px]"
                rows="5"
                placeholder="Précisez la raison de votre refus ici"
              />
              {withdrawn.error && <div className="text-[#EF4444]">{withdrawn.error}</div>}
            </div>
          )}
        </ConfirmationModal>
      )}
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

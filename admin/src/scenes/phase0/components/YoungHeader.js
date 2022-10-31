import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { canViewEmailHistory, ROLES, SENDINBLUE_TEMPLATES, translate, WITHRAWN_REASONS, YOUNG_PHASE, YOUNG_STATUS } from "snu-lib";
import Bin from "../../../assets/Bin";
import ChevronDown from "../../../assets/icons/ChevronDown";
import History from "../../../assets/icons/History";
import TakePlace from "../../../assets/icons/TakePlace";
import Warning from "../../../assets/icons/Warning";
import Badge from "../../../components/Badge";
import TabList from "../../../components/views/TabList";
import Title from "../../../components/views/Title";
import { appURL } from "../../../config";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { Button } from "./Buttons";
import { ChangeCohortPen } from "./ChangeCohortPen";
import ConfirmationModal from "./ConfirmationModal";
import Field from "./Field";
import Tab from "./Tab";

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
              <ChangeCohortPen young={young} onChange={onChange} />
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

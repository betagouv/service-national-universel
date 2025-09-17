import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import {
  canManageMig,
  canValidateYoungToLP,
  canViewNotes,
  isReadAuthorized,
  PERMISSION_RESOURCES,
  ROLES,
  translate,
  translateInscriptionStatus,
  WITHRAWN_REASONS,
  YOUNG_PHASE,
  YOUNG_STATUS,
  YOUNG_STATUS_PHASE1,
  YOUNG_STATUS_PHASE2,
  YOUNG_STATUS_PHASE3,
} from "snu-lib";
import { Button as DsfrButton } from "@snu/ds/admin";
import Bin from "@/assets/Bin";
import ChevronDown from "@/assets/icons/ChevronDown";
import History from "@/assets/icons/History";
import Warning from "@/assets/icons/Warning";
import Badge from "@/components/Badge";
import TabList from "@/components/views/TabList";
import Title from "@/components/views/Title";
import { appURL } from "@/config";
import api from "@/services/api";
import plausibleEvent from "@/services/plausible";
import { Button } from "./Buttons";
import { ChangeCohortPen } from "./ChangeCohortPen";
import ConfirmationModal from "./ConfirmationModal";
import Field from "./Field";
import Tab from "./Tab";
import PhaseStatusSelector from "./PhaseStatusSelector";
import NoteIcon from "../../volontaires/view/notes/components/NoteIcon";
import { PHASE_1, PHASE_2, PHASE_3, PHASE_INSCRIPTION } from "../../volontaires/view/notes/utils";
import NoteDisplayModal from "../../volontaires/view/notes/components/NoteDisplayModal";
import ModalConfirmDeleteYoung from "@/components/modals/young/ModalConfirmDeleteYoung";
import PanelActionButton from "@/components/buttons/PanelActionButton";
import SelectAction from "@/components/SelectAction";
import downloadPDF from "@/utils/download-pdf";
import ModalConfirm from "@/components/modals/ModalConfirm";
import { capture } from "@/sentry";
import { signinAs } from "@/utils/signinAs";
import { useMutation } from "@tanstack/react-query";
import { notifyYoungStatusChanged, updateYoung } from "../utils/service";
import { isResponsableDeCentre } from "snu-lib";

const blueBadge = { color: "#66A7F4", backgroundColor: "#F9FCFF" };
const greyBadge = { color: "#9A9A9A", backgroundColor: "#F6F6F6" };

export default function YoungHeader({ young, tab, onChange, phase = YOUNG_PHASE.INSCRIPTION, isStructure = false, applicationId = null }) {
  const user = useSelector((state) => state.Auth.user);
  const cohorts = useSelector((state) => state.Cohorts);
  const cohortYoung = cohorts.find((cohort) => cohort._id === young.cohortId);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [viewedNotes, setVieweNotes] = useState([]);
  const history = useHistory();
  const statusOptions = getStatusOptions();
  const [withdrawn, setWithdrawn] = useState({ reason: "", message: "" });
  const { mutate } = useMutation({ mutationFn: (payload) => updateYoung(young._id, payload) });

  function getStatusOptions() {
    if (young) {
      let options = [];
      if (user.role === ROLES.ADMIN) {
        options = Object.keys(YOUNG_STATUS).filter((status) => status !== young.status && ![YOUNG_STATUS.REINSCRIPTION, YOUNG_STATUS.DELETED].includes(status));
      } else {
        switch (young.status) {
          case YOUNG_STATUS.WAITING_LIST:
            if (canValidateYoungToLP(user, cohortYoung)) {
              options = [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WITHDRAWN];
            } else {
              options = [YOUNG_STATUS.WITHDRAWN];
            }
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
      }
      //referent can withdraw a young from every status except withdrawn
      if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && young.status !== "WITHDRAWN") options.push(YOUNG_STATUS.WITHDRAWN);
      options = [...new Set(options)];
      return options.map((opt) => ({ value: opt, label: translateInscriptionStatus(opt) }));
    } else {
      return [];
    }
  }

  const setViewedNoteParPhase = (phase) => () => {
    setVieweNotes(getNotesByPhase(phase));
  };

  const handleDeleteYoung = () => {
    setIsConfirmDeleteModalOpen(true);
  };

  const handleCancelDeleteYoung = () => {
    setIsConfirmDeleteModalOpen(false);
  };

  const handleDeleteYoungSuccess = () => {
    setIsConfirmDeleteModalOpen(false);
    history.push(`/volontaire/${young._id}`);
  };

  const onSelectStatus = (status) => {
    setWithdrawn({ reason: "", message: "", error: null });
    let message = "";
    if (status === YOUNG_STATUS.WITHDRAWN) {
      message = `Êtes-vous sûr(e) de vouloir désister ce profil? Les représentants légaux et le volontaire recevront automatiquement une notification avec le motif du désistement et le message personnalisé.`;
    } else {
      message = `Êtes-vous sûr(e) de vouloir modifier le statut de ce profil? Un email sera automatiquement envoyé à l'utilisateur.`;
    }
    setConfirmModal({
      icon: <Warning className="h-[36px] w-[36px] text-[#D1D5DB]" />,
      title: status === YOUNG_STATUS.WITHDRAWN ? "Désistement" : "Modification de statut",
      message,
      type: status,
    });
  };

  const withdrawnReasonOptions = [
    <option key="none" value="">
      Motif
    </option>,
    ...WITHRAWN_REASONS.filter((r) => !r.cohortOnly || r.cohortOnly.includes(young.cohort)).map((reason) => (
      <option key={reason.value} value={reason.value}>
        {reason.label}
      </option>
    )),
  ];

  const onConfirmStatus = async () => {
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
      await changeStatus(confirmModal.type, withdrawn.reason, withdrawn.message);
    } else {
      await changeStatus(confirmModal.type);
    }
  };

  async function changeStatus(status, withdrawnReason, withdrawnMessage) {
    const note = status === YOUNG_STATUS.WITHDRAWN ? WITHRAWN_REASONS.find((r) => r.value === withdrawnReason)?.label + " " + withdrawnMessage : undefined;

    const payload = {
      status,
      lastStatusAt: new Date().toISOString(),
      withdrawnReason: status === YOUNG_STATUS.WITHDRAWN ? withdrawnReason : undefined,
      withdrawnMessage: status === YOUNG_STATUS.WITHDRAWN ? withdrawnMessage : undefined,
      phase: status === YOUNG_STATUS.VALIDATED && phase === YOUNG_PHASE.INTEREST_MISSION ? YOUNG_PHASE.CONTINUE : undefined,
      historic: [...young.historic, { phase, userName: `${user.firstName} ${user.lastName}`, userId: user._id, status, note }],
    };

    mutate(payload, {
      onSuccess: async (data) => {
        await notifyYoungStatusChanged(data, young.status);
        onChange && onChange();
        toastr.success("Mis à jour!", "");
      },
      onError: (e) => {
        toastr.error(translate(e.message), "");
      },
    });
  }

  const getNotesByPhase = (phase) => {
    if (!young.notes) return [];
    return young.notes.filter((note) => note.phase === phase);
  };

  const canYoungChangeCohort = () => {
    if (young.status === YOUNG_STATUS.DELETED || isResponsableDeCentre(user)) {
      return false;
    }
    if (young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && [ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role)) {
      return false;
    }
    return true;
  };

  const onPrendreLaPlace = async (young_id) => {
    if (!user) return toastr.error("Vous devez être connecté pour effectuer cette action.");

    try {
      plausibleEvent("Volontaires/CTA - Prendre sa place");
      await signinAs("young", young_id);
    } catch (e) {
      toastr.error("Une erreur s'est produite lors de la prise de place du volontaire.");
    }
  };

  let fullName = young?.firstName + " " + young?.lastName;
  if (young?._id === "63d69a0f48ffbf062cecc967") {
    fullName = "Capitaine Ad-Hoc";
  }

  return (
    <div className="flex items-end justify-end border-b-[1px] border-b-[#E5E7EB] px-[30px] pt-[15px]">
      <NoteDisplayModal notes={viewedNotes} isOpen={viewedNotes.length > 0} onClose={() => setVieweNotes([])} user={user} />
      <div className={`flex w-full flex-row flex-wrap-reverse items-end justify-end gap-2 ${isResponsableDeCentre(user) ? "pt-[57px]" : ""}`}>
        <div className="grow self-start">
          <div className=" flex flex-row w-full justify-between items-center">
            <Title>
              <div className="mr-[15px]">
                <div className="flex items-center">
                  {!isResponsableDeCentre(user) && getNotesByPhase("").length > 0 && <NoteIcon className="mr-1" onClick={setViewedNoteParPhase("")} />}
                  {young.status === YOUNG_STATUS.DELETED ? "Compte supprimé" : fullName}
                </div>
              </div>
              <Badge
                {...(young.status === YOUNG_STATUS.DELETED ? greyBadge : blueBadge)}
                text={young._id === "679a5273850df632f3a15814" ? "2026 HTS 02 - Avril B" : young.cohort}
              />
              {canYoungChangeCohort() && (
                <>
                  <ChangeCohortPen young={young} onChange={onChange} />
                  {young.originalCohort && <Badge {...greyBadge} text={young.originalCohort} tooltipText={`Anciennement ${young.originalCohort}`} style={{ cursor: "default" }} />}
                </>
              )}
            </Title>
            {![ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role) && <AttestationDownloadButton young={young} />}
            {[ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role) && young.status !== YOUNG_STATUS.WITHDRAWN && (
              <>
                <DsfrButton title="Désister" onClick={() => onSelectStatus(YOUNG_STATUS.WITHDRAWN)} />
              </>
            )}
          </div>

          {isStructure ? (
            <TabList className="mt-[30px]">
              {young.status !== YOUNG_STATUS.WAITING_CORRECTION && young.status !== YOUNG_STATUS.WAITING_VALIDATION && !isResponsableDeCentre(user) && (
                <Tab isActive={tab === "candidature"} onClick={() => history.push(`/volontaire/${young._id}/phase2/application/${applicationId}`)}>
                  <div className="flex items-center">
                    Candidature{getNotesByPhase(PHASE_2).length > 0 && <NoteIcon id={PHASE_2} className="ml-1 block" onClick={setViewedNoteParPhase(PHASE_2)} />}
                  </div>
                </Tab>
              )}
              <Tab isActive={tab === "dossier"} onClick={() => history.push(`/volontaire/${young._id}/phase2/application/${applicationId}/dossier`)}>
                <div className="flex items-center">
                  Dossier d&apos;inscription
                  {!isResponsableDeCentre(user) && getNotesByPhase(PHASE_INSCRIPTION).length > 0 && (
                    <NoteIcon id={PHASE_INSCRIPTION} className="ml-1 block" onClick={setViewedNoteParPhase(PHASE_INSCRIPTION)} />
                  )}
                </div>
              </Tab>
            </TabList>
          ) : (
            <TabList className="mt-[30px]">
              <Tab isActive={tab === "file"} onClick={() => history.push(`/volontaire/${young._id}`)}>
                <div className="flex items-center">
                  Dossier d&apos;inscription
                  {!isResponsableDeCentre(user) && getNotesByPhase(PHASE_INSCRIPTION).length > 0 && (
                    <NoteIcon id={PHASE_INSCRIPTION} className="ml-1 block" onClick={setViewedNoteParPhase(PHASE_INSCRIPTION)} />
                  )}
                </div>
              </Tab>
              {![YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.IN_PROGRESS].includes(young.status) && (
                <>
                  <Tab isActive={tab === "phase1"} onClick={() => history.push(`/volontaire/${young._id}/phase1`)}>
                    <div className="flex items-center">
                      Phase 1{getNotesByPhase(PHASE_1).length > 0 && <NoteIcon id={PHASE_1} className="ml-1 block" onClick={setViewedNoteParPhase(PHASE_1)} />}
                    </div>
                  </Tab>
                  {!isResponsableDeCentre(user) && (
                    <>
                      {canManageMig(user) && (
                        <Tab isActive={tab === "phase2"} onClick={() => history.push(`/volontaire/${young._id}/phase2`)}>
                          <div className="flex items-center">
                            Phase 2{getNotesByPhase(PHASE_2).length > 0 && <NoteIcon id={PHASE_2} className="ml-1 block" onClick={setViewedNoteParPhase(PHASE_2)} />}
                          </div>
                        </Tab>
                      )}
                      {[YOUNG_STATUS_PHASE3.WAITING_VALIDATION, YOUNG_STATUS_PHASE3.VALIDATED].includes(young.statusPhase3) && (
                        <Tab isActive={tab === "phase3"} onClick={() => history.push(`/volontaire/${young._id}/phase3`)}>
                          <div className="flex items-center">
                            Phase 3{getNotesByPhase(PHASE_3).length > 0 && <NoteIcon id={PHASE_3} className="ml-1 block" onClick={setViewedNoteParPhase(PHASE_3)} />}
                          </div>
                        </Tab>
                      )}
                    </>
                  )}
                </>
              )}
              {!isResponsableDeCentre(user) && (
                <Tab isActive={tab === "historique"} onClick={() => history.push(`/volontaire/${young._id}/historique`)}>
                  <div className="flex items-center">
                    <History className="mr-[4px] block flex-[0_0_18px]" fill={tab === "historique" ? "#3B82F6" : "#9CA3AF"} />
                    Historique
                  </div>
                </Tab>
              )}
              {isReadAuthorized({ user, resource: PERMISSION_RESOURCES.USER_NOTIFICATIONS }) ? (
                <Tab isActive={tab === "notifications"} onClick={() => history.push(`/volontaire/${young._id}/notifications`)}>
                  Notifications
                </Tab>
              ) : null}
              {!isResponsableDeCentre(user) && canViewNotes(user) && (
                <Tab isActive={tab === "notes"} onClick={() => history.push(`/volontaire/${young._id}/notes`)}>
                  {`(${young.notes?.length || 0}) Notes internes`}
                </Tab>
              )}
            </TabList>
          )}
        </div>
        {!isStructure && !isResponsableDeCentre(user) && (
          <div className="w-[300px] self-end">
            <div className="relative mb-[15px]">
              <div className="absolute top-[-45px]">
                {young.status === YOUNG_STATUS.VALIDATED && user.role === ROLES.ADMIN && <PhaseStatusSelector young={young} onChange={onChange} />}
              </div>
            </div>
            <Field
              mode="edition"
              name="status"
              label={translate(phase)}
              value={translateInscriptionStatus(young.status)}
              transformer={translate}
              type="select"
              options={statusOptions}
              onChange={onSelectStatus}
              className={young.status === YOUNG_STATUS.DELETED ? "my-[15px]" : ""}
            />

            {young.status !== YOUNG_STATUS.DELETED && ![ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role) && (
              <div className="my-[15px] flex items-center justify-between">
                {user.role === ROLES.ADMIN && (
                  <Button icon={<Bin fill="red" />} onClick={handleDeleteYoung}>
                    Supprimer
                  </Button>
                )}
                <button
                  onClick={() => {
                    window.open(appURL, "_blank");
                    onPrendreLaPlace(young._id);
                  }}>
                  <PanelActionButton icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <ModalConfirmDeleteYoung isOpen={isConfirmDeleteModalOpen} young={young} onCancel={handleCancelDeleteYoung} onConfirm={handleDeleteYoungSuccess} />
      {confirmModal && (
        <ConfirmationModal
          isOpen={true}
          icon={confirmModal.icon}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmLabel || "Confirmer"}
          loadingText={confirmModal.loadingText}
          confirmMode={confirmModal.confirmColor || "blue"}
          onCancel={() => setConfirmModal(null)}
          onConfirm={confirmModal.type ? onConfirmStatus : () => {}}>
          {confirmModal.type === YOUNG_STATUS.WITHDRAWN && (
            <div className="mt-[24px]">
              <div className="mb-[16px] flex w-[100%] items-center rounded-[6px] border-[1px] border-[#D1D5DB] bg-white pr-[15px]">
                <select
                  value={withdrawn.reason}
                  onChange={(e) => {
                    setWithdrawn({ ...withdrawn, reason: e.target.value });
                  }}
                  className="block grow appearance-none bg-[transparent] p-[15px]">
                  {withdrawnReasonOptions}
                </select>
                <ChevronDown className="flex-[0_0_16px] text-[#6B7280]" />
              </div>
              <textarea
                value={withdrawn.message}
                onChange={(e) => {
                  setWithdrawn({ ...withdrawn, message: e.target.value });
                }}
                className="w-[100%] rounded-[6px] border-[1px] border-[#D1D5DB] bg-white p-[15px]"
                rows="5"
                placeholder="Ajoutez un message personnalisé au motif du désistement"
              />
              {withdrawn.error && <div className="text-[#EF4444]">{withdrawn.error}</div>}
            </div>
          )}
        </ConfirmationModal>
      )}
    </div>
  );
}

const AttestationDownloadButton = ({ young }) => {
  const [modal, setModal] = useState({ isOpen: false });
  const handleSendAttestationByEmail = async (phase) => {
    try {
      const { ok, code } = await api.post(`/young/${young._id}/documents/certificate/${phase}/send-email`, {
        fileName: `${young.firstName} ${young.lastName} - certificate ${phase}.pdf`,
      });
      setModal({ isOpen: false });
      if (!ok) throw new Error(translate(code));
      toastr.success(`Document envoyé à ${young.email}`);
    } catch (e) {
      capture(e);
      toastr.error("Erreur lors de l'envoi du document", e.message);
    }
  };

  const handleDownloadAttestationPdfFile = async (phase) => {
    await downloadPDF({
      url: `/young/${young._id}/documents/certificate/${phase}`,
      fileName: `${young.firstName} ${young.lastName} - attestation ${phase}.pdf`,
    });
  };
  if (young.statusPhase1 !== YOUNG_STATUS_PHASE1.DONE && young.statusPhase2 !== YOUNG_STATUS_PHASE2.VALIDATED && young.statusPhase3 !== YOUNG_STATUS_PHASE3.VALIDATED) return null;
  return (
    <>
      <ModalConfirm isOpen={modal?.isOpen} title={modal?.title} message={modal?.message} onCancel={() => setModal({ isOpen: false })} onConfirm={modal?.onConfirm} />
      <SelectAction
        title="Attestations"
        alignItems="right"
        buttonClassNames="bg-blue-600"
        textClassNames="text-white font-medium text-sm"
        rightIconClassNames="text-blue-300"
        optionsGroup={[
          {
            key: "export",
            title: "Télécharger",
            items: [
              young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && {
                key: "phase1Download",
                action: async () => handleDownloadAttestationPdfFile(1),
                render: (
                  <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                    <div className="text-sm text-gray-700">Phase 1</div>
                  </div>
                ),
              },
              young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED && {
                key: "phase2Download",
                action: async () => handleDownloadAttestationPdfFile(2),
                render: (
                  <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                    <div className="text-sm text-gray-700">Phase 2</div>
                  </div>
                ),
              },
              young.statusPhase3 === YOUNG_STATUS_PHASE3.VALIDATED && {
                key: "phase3Download",
                action: async () => handleDownloadAttestationPdfFile(3),
                render: (
                  <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                    <div className="text-sm text-gray-700">Phase 3</div>
                  </div>
                ),
              },
            ],
          },
          {
            key: "exportMail",
            title: "Envoyer par mail",
            items: [
              young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && {
                key: "phase1Mail",
                action: async () =>
                  setModal({
                    isOpen: true,
                    title: "Envoi de document par mail",
                    message: `Êtes-vous sûr de vouloir transmettre le document Attestation de réalisation de la phase 1 par mail à ${young.email} ?`,
                    onConfirm: () => handleSendAttestationByEmail(1),
                  }),
                render: (
                  <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                    <div className="text-sm text-gray-700">Phase 1</div>
                  </div>
                ),
              },
              young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED && {
                key: "phase2Mail",
                action: async () =>
                  setModal({
                    isOpen: true,
                    title: "Envoi de document par mail",
                    message: `Êtes-vous sûr de vouloir transmettre le document Attestation de réalisation de la phase 2 par mail à ${young.email} ?`,
                    onConfirm: () => handleSendAttestationByEmail(2),
                  }),
                render: (
                  <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                    <div className="text-sm text-gray-700">Phase 2</div>
                  </div>
                ),
              },
              young.statusPhase3 === YOUNG_STATUS_PHASE3.VALIDATED && {
                key: "phase3Mail",
                action: async () =>
                  setModal({
                    isOpen: true,
                    title: "Envoi de document par mail",
                    message: `Êtes-vous sûr de vouloir transmettre le document Attestation de réalisation de la phase 3 par mail à ${young.email} ?`,
                    onConfirm: () => handleSendAttestationByEmail(3),
                  }),
                render: (
                  <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                    <div className="text-sm text-gray-700">Phase 3</div>
                  </div>
                ),
              },
            ],
          },
        ]}
      />
    </>
  );
};

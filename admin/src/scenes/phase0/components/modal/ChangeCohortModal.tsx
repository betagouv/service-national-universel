import React, { useEffect, useState } from "react";
import { IoRepeat } from "react-icons/io5";
import { HiUsers, HiCheckCircle, HiExclamationCircle, HiOutlineXCircle } from "react-icons/hi";
import { toastr } from "react-redux-toastr";

import { translateStatusClasse, translateInscriptionStatus, YOUNG_SOURCE, COHORT_TYPE, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { ProfilePic } from "@snu/ds";
import { Badge, ModalConfirmation, Select, InputText, Button } from "@snu/ds/admin";

import { capture } from "@/sentry";
import downloadPDF from "@/utils/download-pdf";
import api from "@/services/api";

import UploadedFileIcon from "@/assets/icons/UploadedFileIcon";
import Loader from "@/components/Loader";
import { getClasses, searchEtablissement } from "../../utils/service";

interface Step {
  icon?: React.ReactNode;
  title?: string;
  content: React.ReactNode;
  actions: {
    title: string;
    isCancel?: boolean;
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
  }[];
}

interface Classe {
  _id: string;
  uniqueKeyAndId: string;
  name?: string;
  status: string;
}

interface ClasseOption {
  value: Classe;
  _id: string;
  label: string;
  classe: Classe;
}

export function ChangeCohortModal({ isOpen, user, young, cohorts, onClose, onChange }) {
  const [state, setState] = useState("hts-cle");
  const [step, setStep] = useState<Step>();
  const [isSaving, setIsSaving] = useState(false);
  // HTS
  const [motif, setMotif] = useState<{
    label: string;
    value: string;
  }>();
  const [cohort, setCohort] = useState<{
    label: string;
    value: string;
  }>();
  const [emailMessage, setEmailMessage] = useState<string>();
  // CLE
  const [etablissement, setEtablissement] = useState<{
    _id: string;
    name: string;
    city?: string;
  }>();
  const [classes, setClasses] = useState<ClasseOption[]>([]);
  const [classe, setClasse] = useState<Classe & { cohort?: string; label: string }>();

  const motifs = [
    "Non disponibilité pour motif familial ou personnel",
    "Non disponibilité pour motif scolaire ou professionnel",
    "L’affectation ne convient pas",
    "Impossibilité de se rendre au point de rassemblement",
    "Autre",
  ];

  // Reset state when modal is closed/opened
  useEffect(() => {
    if (state !== "hts-cle") {
      setState("hts-cle");
      // HTS
      setMotif(undefined);
      setCohort(undefined);
      setEmailMessage(undefined);
      // CLE
      setEtablissement(undefined);
      setClasse(undefined);
    }
  }, [isOpen]);

  const downloadAttestation = () => {
    downloadPDF({
      url: `/young/${young._id}/documents/certificate/1`,
      fileName: `${young.firstName} ${young.lastName} - certificate 1.pdf`,
    });
  };

  const getCohortOptions = (cohorts) => {
    const updatedCohorts = cohorts.filter((c) => c.type === COHORT_TYPE.VOLONTAIRE);
    return updatedCohorts.map((cohort) => ({
      value: cohort.name,
      label: (
        <div className="flex flex-nowrap items-center justify-between gap-1.5 p-2.5 h-[40px] w-full">
          <div className="flex items-center gap-1.5">
            {cohort.isEligible ? (
              <HiCheckCircle size={24} className="mt-0.5 mr-1 min-w-[24px] text-emerald-500" />
            ) : (
              <HiOutlineXCircle size={24} className="mt-0.5 mr-1 min-w-[24px] text-red-500" />
            )}
            <span className="text-gray-900 text-sm leading-5 font-normal">{`${cohort.name} `}</span>
          </div>
          <span className="text-gray-500 text-xs leading-4 font-medium text-right">{cohort.isEligible ? "éligible" : "Non éligible"}</span>
        </div>
      ),
    }));
  };

  useEffect(() => {
    switch (state) {
      // HTS
      case "hts-cohorts":
        return setStep({
          icon: <ProfilePic icon={({ size, className }) => <HiUsers size={size} className={className + " text-indigo-500"} />} />,
          title: "Changement vers cohorte HTS",
          content: (
            <div className="text-gray-900">
              <p className="text-lg">
                Veuillez renseigner ces informations pour le changement de cohorte de&nbsp;
                <span className="font-medium">
                  {young.firstName} <span className="uppercase">{young.lastName}</span>
                </span>
                .
              </p>
              <Select
                className="mt-6 mb-4 text-left"
                placeholder="Motif de changement de cohorte"
                options={motifs.map((e) => ({ label: e, value: e }))}
                closeMenuOnSelect
                isClearable={true}
                value={motif || ""}
                onChange={setMotif}
              />
              {Array.isArray(cohorts) ? (
                <Select
                  className="text-left"
                  placeholder="Choix de la nouvelle cohorte"
                  options={getCohortOptions(cohorts)}
                  noOptionsMessage={"Aucune cohorte éligible n'est disponible."}
                  closeMenuOnSelect
                  isClearable={true}
                  value={cohort || ""}
                  onChange={setCohort}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <Loader size="20px" containerClassName="!grow-0 !shrink-0 w-auto" />
                  <p className="flex-1 text-left">Chargement des cohortes en cours...</p>
                </div>
              )}
              <p className="my-6 text-lg">
                Assurez-vous de son éligibilité, pour en savoir plus consultez cet&nbsp;
                <a
                  href="https://support.snu.gouv.fr/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion"
                  target="_blank"
                  rel="noreferrer"
                  className="!underline !text-blue-600">
                  article de la Base de connaissance
                </a>
                .
              </p>
            </div>
          ),
          actions: [
            { title: "Annuler", isCancel: true, onClick: onClose },
            { title: "Valider", disabled: !motif || !cohort, onClick: () => setState("hts-confirmation") },
          ],
        });
      case "hts-confirmation":
        return setStep({
          ...step,
          content: (
            <div className="text-gray-900">
              <p className="text-lg">
                Veuillez confirmer les informations de la nouvelle cohorte de &nbsp;
                <span className="font-medium">
                  {young.firstName} <span className="uppercase">{young.lastName}</span>
                </span>
                .
              </p>
              <div className="my-6">
                <div className="flex items-center justify-between min-h-[32px] mb-2">
                  <div className="text-sm">Motif de changement :</div>
                  <div className="font-medium">{motif?.label}</div>
                </div>
                <div className="flex items-center justify-between min-h-[32px] mb-2">
                  <div className="text-sm">Ancienne cohorte :</div>
                  <Badge title={young.cohort} leftIcon={<HiUsers size={16} className="text-indigo-500" />} />
                </div>
                <div className="flex items-center justify-between min-h-[32px] mb-2">
                  <div className="text-sm">Nouvelle cohorte :</div>
                  <Badge title={cohort?.value} leftIcon={<HiUsers size={16} className="text-indigo-500" />} />
                </div>
              </div>
            </div>
          ),
          actions: [
            { title: "Annuler", isCancel: true, onClick: onClose },
            { title: "Valider", onClick: () => setState("hts-cni") },
          ],
        });
      case "hts-cni":
        return setStep({
          ...step,
          content: (
            <div className="text-gray-900">
              <div className="flex items-center justify-between my-4 text-green-600">
                <HiCheckCircle size={24} className="shrink-0 mr-6 text-green-500" />
                <p className="flex-1 text-lg text-left">
                  Le changement de cohorte de&nbsp;
                  <span className="font-medium">
                    {young.firstName} <span className="uppercase">{young.lastName}</span>
                  </span>
                  &nbsp;a été pris en compte, veuillez lui envoyer un message en précisant un motif si besoin.
                </p>
              </div>
              {!young.cniFiles?.length && !young.files?.cniFiles?.length && (
                <div className="flex items-center justify-between my-4 text-red-600">
                  <HiExclamationCircle size={24} className="shrink-0 mr-6 text-red-500" />
                  <p className="flex-1 text-lg text-left">
                    {Array.isArray(young.cniFiles) && young.cniFiles.length > 0
                      ? "Pensez à vérifier la validité de sa CNI pour ce nouveau séjour !"
                      : "Il doit ajouter sa CNI pour ce nouveau séjour !"}
                  </p>
                </div>
              )}
              <div className="my-6 p-8 bg-gray-50">
                <p className="text-base -mx-4">
                  Bonjour&nbsp;
                  <span className="font-medium">
                    {young.firstName} <span className="uppercase">{young.lastName}</span>
                  </span>
                  , votre changement de séjour pour le Service National Universel a bien été pris en compte. Vous êtes maintenant positionné(e) sur le séjour de{" "}
                  <span className="font-medium">{cohort?.value}</span>.
                  {!young.cniFiles?.length && !young.files?.cniFiles?.length && " Veuillez ajouter votre CNI dans votre compte."}
                </p>
                <textarea
                  className="my-6 px-[10px] py-[6px] w-full min-h-[88px] rounded-md border-[1px] border-gray-300 bg-white"
                  placeholder="Ajouter un message"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}></textarea>
                <p className="text-base font-medium">Cordialement, les équipes du SNU.</p>
              </div>
            </div>
          ),
          actions: [
            { title: "Annuler", isCancel: true, onClick: onClose },
            {
              title: "Envoyer",
              disabled: !emailMessage,
              loading: isSaving,
              onClick: async () => {
                try {
                  if (!emailMessage) return toastr.error("Veuillez indiquer un message", "");
                  setIsSaving(true);
                  await api.put(`/referent/young/${young._id}/change-cohort`, {
                    source: YOUNG_SOURCE.VOLONTAIRE,
                    cohort: cohort?.value,
                    message: emailMessage,
                    cohortChangeReason: motif?.label,
                  });
                  // if (young.status === YOUNG_STATUS.VALIDATED && fillingRateMet) await api.put(`/referent/young/${young._id}`, { status: YOUNG_STATUS.WAITING_LIST });
                  // if (young.status === YOUNG_STATUS.WAITING_LIST && !fillingRateMet) await api.put(`/referent/young/${young._id}`, { status: YOUNG_STATUS.VALIDATED });
                  await onChange();
                  toastr.success("Cohorte modifiée avec succès", "");
                } catch (error) {
                  capture(error);
                  toastr.error(error.message, "");
                } finally {
                  setIsSaving(false);
                }
              },
            },
          ],
        });
      // CLE
      case "cle-etablissement":
        return setStep({
          icon: <ProfilePic icon={({ size, className }) => <HiUsers size={size} className={className + " text-pink-500"} />} />,
          title: "Changement vers cohorte CLE",
          content: (
            <div className="text-gray-900">
              <p className="text-lg">
                Veuillez renseigner l’établissement de la nouvelle cohorte de&nbsp;
                <span className="font-medium">
                  {young.firstName} <span className="uppercase">{young.lastName}</span>
                </span>
                .
              </p>
              <Select
                isAsync
                className="my-6 text-left"
                placeholder="Rechercher un établissement"
                loadOptions={(q) => searchEtablissement(user, q)}
                closeMenuOnSelect
                isClearable={true}
                noOptionsMessage={"Aucun établissement ne correspond à cette recherche"}
                value={etablissement ? { label: etablissement.name, value: "" } : null}
                onChange={({ etablissement }) => setEtablissement(etablissement)}
              />
            </div>
          ),
          actions: [
            { title: "Annuler", isCancel: true, onClick: onClose },
            {
              title: "Valider",
              disabled: !etablissement,
              onClick: async () => {
                if (!etablissement) return toastr.error("Veuillez sélectionner un établissement", "");
                setState("cle-classe");
                getClasses(etablissement._id).then((classes) => setClasses(classes));
              },
            },
          ],
        });
      case "cle-classe":
        return setStep({
          ...step,
          content: (
            <div className="text-gray-900">
              <p className="text-lg">
                Veuillez choisir la classe de la nouvelle cohorte de&nbsp;
                <span className="font-medium">
                  {young.firstName} <span className="uppercase">{young.lastName}</span>
                </span>
                .
              </p>
              <Select
                className="my-6 text-left"
                placeholder="Classe"
                options={classes as any} // FIXME: use _id as value
                closeMenuOnSelect
                isClearable={true}
                value={classe ? { label: classe.label, value: "" } : null}
                onChange={({ classe }) => setClasse(classe)}
              />
            </div>
          ),
          actions: [
            { title: "Annuler", isCancel: true, onClick: onClose },
            {
              title: "Valider",
              disabled: !classe,
              onClick: () => {
                if (young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE) {
                  return setState("cle-attestation");
                }
                setState("cle-confirmation");
              },
            },
          ],
        });
      case "cle-attestation":
        return setStep({
          ...step,
          content: (
            <div className="text-gray-900">
              <p className="text-lg text-red-500 mb-3">
                Attention : l’attestation de la Phase 1 validée (HTS) de{" "}
                <span className="font-medium">
                  {young.firstName} <span className="uppercase">{young.lastName}</span>
                </span>{" "}
                ne sera plus accessible après ce changement de cohorte ! Veuillez vérifier ces informations afin que cette attestation lui soit envoyée par email&nbsp;:
              </p>
              <div className="text-left">
                <div className="flex space-x-3 mb-3">
                  <InputText name="firstName" className="flex-1" label="Prénom" value={young.firstName} />
                  <InputText name="lastName" className="flex-1" label="Nom" value={young.lastName} />
                </div>
                <InputText name="email" className="mb-3" label="Adresse email" value={young.email} disabled />
                <p className="mb-3">
                  Si cette adresse email n’est pas correcte,{" "}
                  <span className="underline text-blue-500 cursor-pointer" onClick={onClose}>
                    veuillez la modifier sur le profil du volontaire
                  </span>
                  .
                </p>
                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-md">
                  <UploadedFileIcon width={64} height={64} />
                  <div className="flex-1 font-medium mx-2">Attestation Phase 1 validée (HTS)</div>
                  <Button title="Télécharger" type="wired" onClick={downloadAttestation} />
                </div>
              </div>
            </div>
          ),
          actions: [
            { title: "Annuler", isCancel: true, onClick: onClose },
            {
              title: "Valider",
              onClick: () => setState("cle-confirmation"),
            },
          ],
        });
      case "cle-confirmation":
        return setStep({
          ...step,
          content: (
            <div className="text-gray-900">
              <p className="text-lg">
                Veuillez confirmer les informations de la nouvelle cohorte de &nbsp;
                <span className="font-medium">
                  {young.firstName} <span className="uppercase">{young.lastName}</span>
                </span>
                .
              </p>
              <div className="my-6">
                <div className="flex items-center justify-between min-h-[32px] mb-2">
                  <div className="text-sm">Ancienne cohorte :</div>
                  <Badge title={young.cohort} leftIcon={<HiUsers size={16} className="text-indigo-500" />} />
                </div>
                <div className="flex items-center justify-between min-h-[32px] mb-2">
                  <div className="text-sm">Nouvelle cohorte :</div>
                  <Badge title={classe?.cohort} leftIcon={<HiUsers size={16} className="text-pink-500" />} />
                </div>
                <div className="flex items-center justify-between min-h-[32px] mb-2">
                  <div className="text-sm">Établissement :</div>
                  <div className="font-medium">{etablissement?.name}</div>
                </div>
                <div className="flex items-center justify-between min-h-[32px] mb-2">
                  <div className="text-sm">Classe :</div>
                  <div className="font-medium">{classe?.label}</div>
                </div>
                <div className="flex items-center justify-between min-h-[32px] mb-2">
                  <div className="text-sm">Statut de la classe :</div>
                  <Badge title={translateStatusClasse(classe?.status)} status={classe?.status as any} />
                </div>
                <div className="flex items-center justify-between min-h-[32px] mb-2">
                  <div className="text-sm">Statut de l'élève :</div>
                  <Badge title={translateInscriptionStatus(young.status)} status={young.status} />
                </div>
              </div>
            </div>
          ),
          actions: [
            { title: "Annuler", isCancel: true, onClick: onClose },
            {
              title: "Valider",
              loading: isSaving,
              onClick: async () => {
                try {
                  setIsSaving(true);
                  // ⚠️ It's important to make sure the certificate is properly sent before changing the cohort
                  // Because afterwards, the certificate will no longer be accessible because we override lots of young's data
                  if (young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE) {
                    await api.post(`/young/${young._id}/documents/certificate/1/send-email?switchToCle=true`, {
                      fileName: `${young.firstName} ${young.lastName} - certificate 1.pdf`,
                    });
                  }
                  await api.put(`/referent/young/${young._id}/change-cohort`, {
                    source: YOUNG_SOURCE.CLE,
                    cohort: classe?.cohort,
                    etablissementId: etablissement?._id,
                    classeId: classe?._id,
                  });
                  await onChange();
                  toastr.success("Cohorte modifiée avec succès", "");
                } catch (error) {
                  capture(error);
                  toastr.error(error.message, "");
                } finally {
                  setIsSaving(false);
                }
              },
            },
          ],
        });
      // Type of cohort selection
      default:
        return setStep({
          icon: <ProfilePic icon={({ size, className }) => <IoRepeat size={size} className={className} />} />,
          title: "Changement de cohorte",
          content: (
            <div className="text-gray-900">
              <p className="text-lg">
                Vous allez changer la cohorte actuelle de&nbsp;
                <span className="font-medium">
                  {young.firstName} <span className="uppercase">{young.lastName}</span>
                </span>
                .
                <br />
                Veuillez choisir le type de sa nouvelle cohorte&nbsp;:
              </p>
              <div className="mt-6 gap-2 flex items-center justify-center">
                <Badge mode="editable" title="Hors temps scolaire (HTS)" leftIcon={<HiUsers size={16} className="text-indigo-500" />} onClick={() => setState("hts-cohorts")} />
                <Badge mode="editable" title="Classe engagée (CLE)" leftIcon={<HiUsers size={16} className="text-pink-500" />} onClick={() => setState("cle-etablissement")} />
              </div>
            </div>
          ),
          actions: [{ title: "Annuler", isCancel: true, onClick: onClose }],
        });
    }
  }, [state, motif, isSaving, cohorts, cohort, emailMessage, etablissement, classes, classe]);

  if (!step || !isOpen) return null;

  return (
    <ModalConfirmation isOpen={isOpen} onClose={onClose} className="min-w-[700px] max-w-[700px]" icon={step.icon} title={step.title} text={step.content} actions={step.actions} />
  );
}

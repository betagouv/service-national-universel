import React, { useEffect, useState, useMemo } from "react";
import { IoRepeat } from "react-icons/io5";
import { HiUsers, HiCheckCircle, HiExclamationCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { ROLES, translateStatusClasse, translateInscriptionStatus, YOUNG_SOURCE, STATUS_CLASSE, COHORT_TYPE, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { ProfilePic } from "@snu/ds";
import { Badge, ModalConfirmation, Select, InputText, Button } from "@snu/ds/admin";
import Pencil from "@/assets/icons/Pencil";
import UploadedFileIcon from "@/assets/icons/UploadedFileIcon";
import api from "@/services/api";
import Loader from "@/components/Loader";
import { capture } from "@/sentry";
import downloadPDF from "@/utils/download-pdf";
import SelectCohort from "../../../components/cohorts/SelectCohort";

export function ChangeCohortPen({ young, onChange }) {
  const user = useSelector((state) => state.Auth.user);
  const [changeCohortModal, setChangeCohortModal] = useState(false);
  const [options, setOptions] = useState(null);

  const disabled = ![ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role);

  useEffect(() => {
    if (!young) return undefined;

    (async function getSessions() {
      //When inscription is open for youngs, we don't want to display the cohort to come
      // const isEligibleForCohortToCome = calculateAge(young.birthdateAt, new Date("2023-09-30")) < 18;
      // const cohortToCome = { name: "à venir", isEligible: isEligibleForCohortToCome };
      // if (user.role !== ROLES.ADMIN) {
      //   setOptions(isEligibleForCohortToCome && young.cohort !== "à venir" ? [cohortToCome] : []);
      //   return;
      // }
      const { data } = await api.post(`/cohort-session/eligibility/2023/${young._id}`);
      if (Array.isArray(data)) {
        const cohorts = data.map((c) => ({ name: c.name, goal: c.goalReached, isEligible: c.isEligible, type: c.type })).filter((c) => c.name !== young.cohort);
        // TODO: rajouter un flag hidden pour les cohort non visible
        cohorts.push({ name: "à venir", type: "VOLONTAIRE" });
        setOptions(cohorts);
      } else setOptions([]);
    })();
  }, [young]);

  if (disabled) return null;

  return (
    <>
      <div
        className="mr-[15px] flex cursor-pointer items-center justify-center rounded-[4px] border-[1px] border-[transparent] p-[9px] hover:border-[#E5E7EB]"
        onClick={() => setChangeCohortModal(true)}>
        <Pencil stroke="#66A7F4" className="h-[11px] w-[11px]" />
      </div>
      <ChangeCohortModal isOpen={changeCohortModal} user={user} young={young} cohorts={options} onClose={() => setChangeCohortModal(false)} onChange={onChange} />
    </>
  );
}

function ChangeCohortModal({ isOpen, user, young, cohorts, onClose, onChange }) {
  const [state, setState] = useState("hts-cle");
  const [step, setStep] = useState(undefined);
  const [isSaving, setIsSaving] = useState(false);
  // HTS
  const [motif, setMotif] = useState(undefined);
  const [cohort, setCohort] = useState(undefined);
  const [emailMessage, setEmailMessage] = useState(undefined);
  // CLE
  const [etablissement, setEtablissement] = useState(undefined);
  const [classes, setClasses] = useState(undefined);
  const [classe, setClasse] = useState(undefined);

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

  /*   const getCohortOptions = (cohorts) => {
    let updatedCohorts = cohorts.filter((c) => c.type === COHORT_TYPE.VOLONTAIRE);
    return updatedCohorts.map((cohort) => ({
      value: cohort.name,
      label: (
        <div className="flex flex-nowrap items-center justify-start gap-1.5 p-2.5 w-full">
          <HiUsers size={24} className="mt-0.5 mr-1 min-w-[24px]" color={cohort.name.includes("CLE") ? "#EC4899" : "#6366F1"} />
          <span className="text-gray-500 font-medium whitespace-nowrap">{formatCohortPeriod(cohort, "short")}</span>
          <span className="text-gray-900 font-bold text-ellipsis overflow-hidden whitespace-nowrap">{`${cohort.name} `}</span>
        </div>
      ),
    }));
  }; */

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
                value={motif}
                onChange={setMotif}
              />
              {Array.isArray(cohorts) ? (
                <Select
                  className="text-left"
                  placeholder="Choix de la nouvelle cohorte"
                  options={cohorts
                    ?.filter((c) => c.type === COHORT_TYPE.VOLONTAIRE)
                    .map((c) => ({ ...c, label: `Cohorte ${c.name}${!c.isEligible ? " (non éligible)" : " (éligible)"}`, value: c.name }))}
                  noOptionsMessage={"Aucune cohorte éligible n'est disponible."}
                  closeMenuOnSelect
                  isClearable={true}
                  value={cohort}
                  onChange={setCohort}
                />
              ) : (
                /*                 <Select
                  className="text-left"
                  placeholder="Choix de la nouvelle cohorte"
                  options={getCohortOptions(cohorts)}
                  noOptionsMessage={"Aucune cohorte éligible n'est disponible."}
                  closeMenuOnSelect
                  isClearable={true}
                  value={cohort}
                  onChange={setCohort}
                /> */
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
                  <div className="font-medium">{motif.label}</div>
                </div>
                <div className="flex items-center justify-between min-h-[32px] mb-2">
                  <div className="text-sm">Ancienne cohorte :</div>
                  <Badge title={young.cohort} leftIcon={<HiUsers size={16} className="text-indigo-500" />} />
                </div>
                <div className="flex items-center justify-between min-h-[32px] mb-2">
                  <div className="text-sm">Nouvelle cohorte :</div>
                  <Badge title={cohort.label} leftIcon={<HiUsers size={16} className="text-indigo-500" />} />
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
                  <span className="font-medium">{cohort.name}</span>.{!young.cniFiles?.length && !young.files?.cniFiles?.length && " Veuillez ajouter votre CNI dans votre compte."}
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
                  if (!emailMessage) return toastr.error("Veuillez indiquer un message");
                  setIsSaving(true);
                  await api.put(`/referent/young/${young._id}/change-cohort`, {
                    source: YOUNG_SOURCE.VOLONTAIRE,
                    cohort: cohort.name,
                    message: emailMessage,
                    cohortChangeReason: motif.label,
                  });
                  // if (young.status === YOUNG_STATUS.VALIDATED && fillingRateMet) await api.put(`/referent/young/${young._id}`, { status: YOUNG_STATUS.WAITING_LIST });
                  // if (young.status === YOUNG_STATUS.WAITING_LIST && !fillingRateMet) await api.put(`/referent/young/${young._id}`, { status: YOUNG_STATUS.VALIDATED });
                  await onChange();
                  toastr.success("Cohorte modifiée avec succès");
                } catch (error) {
                  capture(error);
                  toastr.error(error.message);
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
                value={etablissement ? { label: etablissement.name } : null}
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
                if (!etablissement) return toastr.error("Veuillez sélectionner un établissement");
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
                options={classes}
                closeMenuOnSelect
                isClearable={true}
                value={classe ? { label: classe.label } : null}
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
                  <InputText className="flex-1" label="Prénom" value={young.firstName} />
                  <InputText className="flex-1" label="Nom" value={young.lastName} />
                </div>
                <InputText className="mb-3" label="Adresse email" value={young.email} disabled />
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
                  <Badge title={classe.cohort} leftIcon={<HiUsers size={16} className="text-pink-500" />} />
                </div>
                <div className="flex items-center justify-between min-h-[32px] mb-2">
                  <div className="text-sm">Établissement :</div>
                  <div className="font-medium">{etablissement.name}</div>
                </div>
                <div className="flex items-center justify-between min-h-[32px] mb-2">
                  <div className="text-sm">Classe :</div>
                  <div className="font-medium">{classe.label}</div>
                </div>
                <div className="flex items-center justify-between min-h-[32px] mb-2">
                  <div className="text-sm">Statut de la classe :</div>
                  <Badge title={translateStatusClasse(classe.status)} status={classe.status} />
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
                    cohort: classe.cohort,
                    etablissementId: etablissement._id,
                    classeId: classe._id,
                  });
                  await onChange();
                  toastr.success("Cohorte modifiée avec succès");
                } catch (error) {
                  capture(error);
                  toastr.error(error.message);
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

const searchEtablissement = async (user, q) => {
  if (!q) q = "Lycée";

  const query = {
    filters: {
      searchbar: [q],
      region: user.region ? [user.region] : [],
      department: user.department ? user.department : [],
    },
    sort: {
      filed: "name.keyword",
      order: "asc",
    },
    page: 0,
    size: 10,
  };

  const { responses } = await api.post(`/elasticsearch/cle/etablissement/search`, query);
  return responses[0].hits.hits.map((hit) => {
    const label = hit._source.name + (hit._source.city ? ` (${hit._source.city})` : "");
    return { value: hit._source, _id: hit._id, label, etablissement: { ...hit._source, _id: hit._id } };
  });
};

const getClasses = async (etablissementId) => {
  if (!etablissementId) return [];

  const query = {
    filters: {
      etablissementId: [etablissementId],
    },
    page: 0,
    size: 100,
  };

  const { responses } = await api.post(`/elasticsearch/cle/classe/search`, query);
  return responses[0].hits.hits
    .filter((hit) => ![STATUS_CLASSE.DRAFT, STATUS_CLASSE.WITHDRAWN].includes(hit._source.status))
    .map((hit) => {
      const label = `${hit._source.uniqueKeyAndId} - ${hit._source.name ?? "(Nom à renseigner)"}`;
      return { value: hit._source, _id: hit._id, label, classe: { ...hit._source, _id: hit._id, label } };
    });
};

import React, { useState } from "react";
import dayjs from "dayjs";

import { isAfter } from "date-fns";
import { BiLoaderAlt } from "react-icons/bi";
import { MdInfoOutline } from "react-icons/md";
import { toastr } from "react-redux-toastr";
import ReactTooltip from "react-tooltip";
import { COHORT_STATUS, COHORT_TYPE, CohortDto } from "snu-lib";

import api from "@/services/api";

import { capture } from "@/sentry";

import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import DatePickerInput from "@/components/ui/forms/dateForm/DatePickerInput";
import SimpleToggle from "@/components/ui/forms/dateForm/SimpleToggle";
import ToggleDate from "@/components/ui/forms/dateForm/ToggleDate";
import InputText from "@/components/ui/forms/InputText";
import InputTextarea from "@/components/ui/forms/InputTextarea";
import NumberInput from "@/components/ui/forms/NumberInput";

import { CleSettings } from "./components/CleSettings";
import { InformationsConvoyage } from "./components/InformationsConvoyage";
import { ManualInscriptionSettings } from "./phase0/ManualInscriptionSettings";
import { Select } from "@snu/ds/admin";
import CohortGroupSelector from "./components/CohortGroupSelector";

// Define the interface for GeneralTab props
interface GeneralTabProps {
  cohort: CohortDto;
  onCohortChange: React.Dispatch<React.SetStateAction<CohortDto>>;
  readOnly: boolean;
  getCohort: () => void;
  isLoading: boolean;
  onLoadingChange: React.Dispatch<React.SetStateAction<boolean>>;
}

// Use the interface for the props object
export default function GeneralTab({ cohort, onCohortChange, readOnly, getCohort, isLoading, onLoadingChange }: GeneralTabProps) {
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [showSpecificDatesReInscription, setShowSpecificDatesReInscription] = useState(cohort?.reInscriptionStartDate || cohort?.reInscriptionEndDate);

  const statusOptions = [
    { value: COHORT_STATUS.PUBLISHED, label: "Publiée" },
    { value: COHORT_STATUS.ARCHIVED, label: "Archivée" },
  ];

  const onSubmit = async () => {
    try {
      const err = {} as { [key: string]: string };
      if (!cohort!.dateStart) err.dateStart = "La date de début est obligatoire";
      if (!cohort!.dateEnd) err.dateEnd = "La date de fin est obligatoire";
      if (!cohort!.inscriptionStartDate) err.inscriptionStartDate = "La date d'ouverture des inscriptions est obligatoire";
      if (!cohort!.inscriptionEndDate) err.inscriptionEndDate = "La date de fermeture des inscriptions est obligatoire";
      if (!cohort!.instructionEndDate) err.instructionEndDate = "La date de fermeture des inscriptions est obligatoire";
      if (isAfter(new Date(cohort!.reInscriptionStartDate as Date), new Date(cohort!.reInscriptionEndDate as Date)))
        err.reInscriptionStartDate = "La date d'ouverture des réinscriptions est antérieure a la date de cloture.";
      if (isAfter(new Date(cohort!.reInscriptionEndDate as Date), new Date(cohort!.inscriptionEndDate)))
        err.reInscriptionEndDate = "Les dates de cloture de réinscription ne peuvent pas etre postérieures a celles de réinscription.";
      setError(err);
      if (Object.values(err).length > 0) {
        return toastr.warning("Veuillez corriger les erreurs dans le formulaire", "");
      }

      onLoadingChange(true);
      // @ts-ignore
      delete cohort.snuId;
      // format date to be sure it is UTC in backend
      cohort.inscriptionStartDate = dayjs(cohort.inscriptionStartDate).toDate();
      cohort.inscriptionEndDate = dayjs(cohort.inscriptionEndDate).toDate();
      cohort.reInscriptionStartDate = dayjs(cohort.reInscriptionStartDate).toDate();
      cohort.reInscriptionEndDate = dayjs(cohort.reInscriptionEndDate).toDate();
      cohort.instructionEndDate = dayjs(cohort.instructionEndDate).toDate();
      cohort.inscriptionModificationEndDate = dayjs(cohort.inscriptionModificationEndDate).toDate();
      cohort.pdrChoiceLimitDate = dayjs(cohort.pdrChoiceLimitDate).toDate();

      const { ok, code } = await api.put(`/cohort/${encodeURIComponent(cohort!.name)}`, cohort);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la mise à jour de la session", code);
        await getCohort();
        return onLoadingChange(false);
      }
      toastr.success("La session a bien été mise à jour", "");
      await getCohort();
      onLoadingChange(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la mise à jour de la session", "");
      await getCohort();
      onLoadingChange(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-8 rounded-xl bg-white px-8 pb-12 pt-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
        <div className="flex w-full flex-col gap-8">
          <p className="text-lg font-medium leading-5 text-gray-900">Informations générales</p>
          <div className="flex">
            <div className="flex w-[45%] flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs  font-medium text-gray-900">Identification</p>
                  <MdInfoOutline data-tip data-for="identification" className="h-5 w-5 cursor-pointer text-gray-400" />
                  <ReactTooltip id="identification" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md ">
                    <ul className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                      <li>Nom donné à la cohorte.</li>
                      <li>Identifiant technique donné à la cohorte.</li>
                    </ul>
                  </ReactTooltip>
                </div>
                <InputText label="Nom de la cohort" value={cohort.name} disabled readOnly />
                <InputText label="Identifiant" value={cohort.snuId} disabled readOnly />

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-gray-900">Statut</p>
                    <MdInfoOutline data-tip data-for="statut" className="h-5 w-5 cursor-pointer text-gray-400" />
                    <ReactTooltip id="statut" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                      <ul className="w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                        <li>
                          Si la cohorte est <strong>publiée</strong>, les volontaires peuvent s’inscrire si l'inscription est ouverte (voir cadre ci-dessous).
                        </li>
                        <li className="mt-2">
                          Si elle est <strong>archivée</strong>, ils ne peuvent plus poursuivre la phase engagement.
                        </li>
                      </ul>
                    </ReactTooltip>
                  </div>

                  <Select
                    value={statusOptions.find((o) => o.value === cohort.status) || null}
                    options={statusOptions}
                    onChange={(e) => onCohortChange({ ...cohort, status: e.value })}
                    closeMenuOnSelect
                    disabled={isLoading || readOnly}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-gray-900">Groupe de cohorte</p>
                    <MdInfoOutline data-tip data-for="statut" className="h-5 w-5 cursor-pointer text-gray-400" />
                    <ReactTooltip id="statut" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                      <ul className="w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                        <li>Permet de rattacher une cohorte à un groupe afin d'orienter les volontaires lors des changements de séjour.</li>
                        <li className="mt-2">Pour changer de séjour dans un même groupe de cohorte, pas besoin de réinscription.</li>
                        <li className="mt-2">Pour changer vers un séjour du groupe suivant, réinscription obligatoire.</li>
                      </ul>
                    </ReactTooltip>
                  </div>
                  <CohortGroupSelector cohort={cohort} setCohort={onCohortChange} readOnly={readOnly} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs  font-medium text-gray-900">Dates du séjour</p>
                  <MdInfoOutline data-tip data-for="dates_du_séjour" className="h-5 w-5 cursor-pointer text-gray-400" />
                  <ReactTooltip id="dates_du_séjour" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md ">
                    <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">Précision de la date de départ en séjour et de celle de retour.</p>
                  </ReactTooltip>
                </div>
                <div className="flex w-full gap-4">
                  <DatePickerInput
                    mode="single"
                    label="Début"
                    // @ts-ignore
                    value={cohort.dateStart}
                    error={error.dateStart}
                    // @ts-ignore
                    onChange={(e) => onCohortChange({ ...cohort, dateStart: e })}
                    readOnly={readOnly}
                    disabled={isLoading}
                    placeholder={"JJ/MM/AAAA"}
                  />
                  <DatePickerInput
                    mode="single"
                    label="Fin"
                    // @ts-ignore
                    value={cohort.dateEnd}
                    error={error.dateEnd}
                    // @ts-ignore
                    onChange={(e) => onCohortChange({ ...cohort, dateEnd: e })}
                    readOnly={readOnly}
                    disabled={isLoading}
                    placeholder={"JJ/MM/AAAA"}
                  />
                </div>
              </div>
            </div>
            <div className="flex w-[10%] items-center justify-center">
              <div className="h-[90%] w-[1px] border-r-[1px] border-gray-200"></div>
            </div>
            <div className="flex w-[45%] flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs  font-medium text-gray-900">Toolkit d’aide</p>
                  <MdInfoOutline data-tip data-for="toolkit" className="h-5 w-5 cursor-pointer text-gray-400" />
                  <ReactTooltip id="toolkit" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">Liens vers un articles d&apos;aide pour suivre la cohorte.</p>
                  </ReactTooltip>
                </div>
                <InputText
                  placeholder="Indiquez l’URL d’un article de la BDC"
                  disabled={isLoading}
                  readOnly={readOnly}
                  value={cohort.uselessInformation?.toolkit || ""}
                  onChange={(e) => onCohortChange({ ...cohort, uselessInformation: { ...cohort.uselessInformation, toolkit: e.target.value } })}
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs  font-medium text-gray-900">Zones concernées</p>
                  <MdInfoOutline data-tip data-for="zones_concernées" className="h-5 w-5 cursor-pointer text-gray-400" />
                  <ReactTooltip id="zones_concernées" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                      Précision de la ou des zones géographiques ou scolaires concernées par le séjour.
                    </p>
                  </ReactTooltip>
                </div>
                <InputTextarea
                  placeholder="Précisez en quelques mots"
                  disabled={isLoading}
                  readOnly={readOnly}
                  value={cohort?.uselessInformation?.zones || ""}
                  onChange={(e) => onCohortChange({ ...cohort, uselessInformation: { ...cohort.uselessInformation, zones: e.target.value } })}
                  rows={2}
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs  font-medium text-gray-900">Éligibilité</p>
                  <MdInfoOutline data-tip data-for="eligibilité" className="h-5 w-5 cursor-pointer text-gray-400" />
                  <ReactTooltip id="eligibilité" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                      Précision des critères d’éligibilité des volontaires pour le séjour (niveau scolaire).
                    </p>
                  </ReactTooltip>
                </div>
                <InputTextarea
                  placeholder="Précisez en quelques mots"
                  disabled={isLoading}
                  readOnly={readOnly}
                  value={cohort?.uselessInformation?.eligibility || ""}
                  onChange={(e) => onCohortChange({ ...cohort, uselessInformation: { ...cohort.uselessInformation, eligibility: e.target.value } })}
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* TODO implementer parametres sur la plateforme */}
      {/* Inscriptions (phase 0) */}
      <div className="flex flex-col rounded-xl pt-8 pb-12 px-8 bg-white gap-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
        <div className="flex flex-col w-full gap-8">
          <p className="text-gray-900 leading-5 text-lg font-medium">Inscriptions (phase 0)</p>
          <div className="flex">
            <div className="flex flex-col w-[45%] gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-gray-900  text-xs font-medium">Inscriptions</p>
                  <MdInfoOutline data-tip data-for="inscriptions" className="text-gray-400 h-5 w-5 cursor-pointer" />
                  <ReactTooltip id="inscriptions" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <ul className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
                      <li>Ouverture et fermeture de la proposition du séjour sur le formulaire d’inscription.</li>
                      <li>Blocage de l’accès au dossier des dossiers d’inscription “en cours”.</li>
                    </ul>
                  </ReactTooltip>
                </div>
                <DatePickerInput
                  mode="single"
                  isTime
                  label="Ouverture"
                  placeholder="Date et heure"
                  // @ts-ignore
                  value={dayjs(cohort.inscriptionStartDate).local().toDate()}
                  error={error.inscriptionStartDate}
                  // @ts-ignore
                  onChange={(e) => onCohortChange({ ...cohort, inscriptionStartDate: e })}
                  readOnly={readOnly}
                  disabled={isLoading}
                />
                <DatePickerInput
                  mode="single"
                  isTime={true}
                  label="Fermeture"
                  placeholder="Date et heure"
                  // @ts-ignore
                  value={dayjs(cohort.inscriptionEndDate).local().toDate()}
                  // @ts-ignore
                  onChange={(e) => onCohortChange({ ...cohort, inscriptionEndDate: e })}
                  readOnly={readOnly}
                  disabled={isLoading}
                  error={error.inscriptionEndDate}
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-gray-900  text-xs font-medium">Réinscriptions</p>
                </div>
                <SimpleToggle
                  label="Dates spécifiques"
                  disabled={isLoading || readOnly}
                  // @ts-ignore
                  value={showSpecificDatesReInscription}
                  onChange={(v) => {
                    if (v == false) onCohortChange({ ...cohort, reInscriptionEndDate: null, reInscriptionStartDate: null });
                    // @ts-ignore
                    setShowSpecificDatesReInscription(v);
                  }}
                />
                {showSpecificDatesReInscription && (
                  <>
                    <DatePickerInput
                      mode="single"
                      isTime
                      label="Ouverture"
                      placeholder="Date et heure"
                      // @ts-ignore
                      value={dayjs(cohort.reInscriptionStartDate).local().toDate() || dayjs(cohort.inscriptionStartDate).local().toDate()}
                      error={error.reInscriptionStartDate}
                      onChange={(e) => onCohortChange({ ...cohort, reInscriptionStartDate: e })}
                      readOnly={readOnly}
                      disabled={isLoading}
                    />
                    <DatePickerInput
                      mode="single"
                      isTime
                      label="Fermeture"
                      placeholder="Date et heure"
                      // @ts-ignore
                      value={dayjs(cohort.reInscriptionEndDate).local().toDate() || dayjs(cohort.inscriptionEndDate).local().toDate()}
                      error={error.reInscriptionEndDate}
                      onChange={(e) => onCohortChange({ ...cohort, reInscriptionEndDate: e })}
                      readOnly={readOnly}
                      disabled={isLoading || !cohort.inscriptionEndDate}
                    />
                  </>
                )}
              </div>
              <ManualInscriptionSettings cohort={cohort} setCohort={onCohortChange} isLoading={isLoading} readOnly={readOnly} />
            </div>
            <div className="flex w-[10%] justify-center items-center">
              <div className="w-[1px] h-[90%] border-r-[1px] border-gray-200"></div>
            </div>
            <div className="flex flex-col w-[45%] gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-gray-900  text-xs font-medium">Modification de son dossier déposé par un volontaire</p>
                  <MdInfoOutline data-tip data-for="modification_volontaire" className="text-gray-400 h-5 w-5 cursor-pointer" />
                  <ReactTooltip id="modification_volontaire" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <ul className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
                      <li>
                        Fermeture de la possibilité de modifier ou corriger son dossier d’inscription (pour les dossiers {cohort.type === COHORT_TYPE.CLE && "“en cours”"}, “en
                        attente de validation” et “en attente de correction”).
                      </li>
                      {cohort.type !== COHORT_TYPE.CLE && <li>Le bouton d’accès au dossier est masqué sur le compte volontaire et l’URL d’accès au formulaire bloquée.</li>}
                    </ul>
                  </ReactTooltip>
                </div>
                <div className="flex gap-4 w-full">
                  <DatePickerInput
                    mode="single"
                    isTime
                    label="Fermeture"
                    placeholder="Date"
                    // @ts-ignore
                    value={dayjs(cohort.inscriptionModificationEndDate).local().toDate()}
                    // @ts-ignore
                    onChange={(e) => onCohortChange({ ...cohort, inscriptionModificationEndDate: e })}
                    readOnly={readOnly}
                    disabled={isLoading}
                    error={error.inscriptionModificationEndDate}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-gray-900  text-xs font-medium">Instruction</p>
                  <MdInfoOutline data-tip data-for="instruction" className="text-gray-400 h-5 w-5 cursor-pointer" />
                  <ReactTooltip id="instruction" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <ul className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
                      <li> Fermeture de la proposition de séjour pour le changement de séjour.</li>
                      <li>Le lendemain, les dossiers restants “en attente de validation” et “en attente de correction” seront basculés sur un autre séjour via script.</li>
                    </ul>
                  </ReactTooltip>
                </div>
                <div className="flex gap-4 w-full">
                  <DatePickerInput
                    mode="single"
                    isTime
                    label="Fermeture"
                    placeholder="Date"
                    // @ts-ignore
                    value={dayjs(cohort.instructionEndDate).local().toDate()}
                    // @ts-ignore
                    onChange={(e) => onCohortChange({ ...cohort, instructionEndDate: e })}
                    readOnly={readOnly}
                    disabled={isLoading}
                    error={error.instructionEndDate}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TODO implementer parametres sur la plateforme */}
      {/* Préparation des affectations et des transports (phase 1) */}
      <div className="flex flex-col gap-8 rounded-xl bg-white px-8 pb-12 pt-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
        <div className="flex w-full flex-col gap-8">
          <p className="text-lg font-medium leading-5 text-gray-900">Préparation des affectations et des transports (phase 1)</p>
          <div className="flex">
            <div className="flex w-[45%] flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs  font-medium text-gray-900">Remplissage des centres </p>
                  <MdInfoOutline data-tip data-for="remplissage_centres" className="h-5 w-5 cursor-pointer text-gray-400" />
                  <ReactTooltip id="remplissage_centres" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <ul className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                      <li>Ouverture ou fermeture pour les utilisateurs de la possibilité de déclarer un centre sur le séjour.</li>
                      <li>Ouverture et fermeture pour les utilisateurs de la possibilité de modifier le nombre de places ouvertes sur le séjour</li>
                    </ul>
                  </ReactTooltip>
                </div>
                <SimpleToggle
                  label="Référents régionaux"
                  disabled={isLoading || readOnly}
                  value={cohort.sessionEditionOpenForReferentRegion}
                  onChange={() => onCohortChange({ ...cohort, sessionEditionOpenForReferentRegion: !cohort.sessionEditionOpenForReferentRegion })}
                />
                <SimpleToggle
                  label="Référents départementaux"
                  disabled={isLoading || readOnly}
                  value={cohort.sessionEditionOpenForReferentDepartment}
                  onChange={() => onCohortChange({ ...cohort, sessionEditionOpenForReferentDepartment: !cohort.sessionEditionOpenForReferentDepartment })}
                />
                <SimpleToggle
                  label="Transporteurs"
                  disabled={isLoading || readOnly}
                  value={cohort.sessionEditionOpenForTransporter}
                  onChange={() => onCohortChange({ ...cohort, sessionEditionOpenForTransporter: !cohort.sessionEditionOpenForTransporter })}
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs  font-medium text-gray-900">Remplissage des points de rassemblement</p>
                  <MdInfoOutline data-tip data-for="remplissage_PDR" className="h-5 w-5 cursor-pointer text-gray-400" />
                  <ReactTooltip id="remplissage_PDR" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                      Ouverture ou fermerture pour les utilisateurs de la possibilité de déclarer un point de rassemblement sur le séjour.
                    </p>
                  </ReactTooltip>
                </div>
                <SimpleToggle
                  label="Référents régionaux"
                  disabled={isLoading || readOnly}
                  value={cohort.pdrEditionOpenForReferentRegion}
                  onChange={() => onCohortChange({ ...cohort, pdrEditionOpenForReferentRegion: !cohort.pdrEditionOpenForReferentRegion })}
                />
                <SimpleToggle
                  label="Référents départementaux"
                  disabled={isLoading || readOnly}
                  value={cohort.pdrEditionOpenForReferentDepartment}
                  onChange={() => onCohortChange({ ...cohort, pdrEditionOpenForReferentDepartment: !cohort.pdrEditionOpenForReferentDepartment })}
                />
                <SimpleToggle
                  label="Transporteurs"
                  disabled={isLoading || readOnly}
                  value={cohort.pdrEditionOpenForTransporter}
                  onChange={() => onCohortChange({ ...cohort, pdrEditionOpenForTransporter: !cohort.pdrEditionOpenForTransporter })}
                />
              </div>
              <InformationsConvoyage
                disabled={isLoading || readOnly}
                // @ts-ignore
                informationsConvoyageData={cohort?.informationsConvoyage}
                handleChange={(informationsConvoyage) => onCohortChange({ ...cohort, informationsConvoyage: informationsConvoyage })}
              />
            </div>
            <div className="flex w-[10%] items-center justify-center">
              <div className="h-[90%] w-[1px] border-r-[1px] border-gray-200"></div>
            </div>
            <div className="flex w-[45%] flex-col gap-4">
              {cohort.type !== COHORT_TYPE.CLE && (
                <>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Création de groupe et modification du schéma de répartition</p>
                      <MdInfoOutline data-tip data-for="création_groupe" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="création_groupe" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                        <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                          Ouverture ou fermeture pour les utilisateurs de la possibilité de créer et modifier des groupes sur le schéma de répartition.
                        </p>
                      </ReactTooltip>
                    </div>
                    <ToggleDate
                      label="Référents régionaux"
                      disabled={isLoading}
                      readOnly={readOnly}
                      // @ts-ignore
                      value={cohort.repartitionSchemaCreateAndEditGroupAvailability}
                      onChange={() => onCohortChange({ ...cohort, repartitionSchemaCreateAndEditGroupAvailability: !cohort.repartitionSchemaCreateAndEditGroupAvailability })}
                      range={{
                        from: cohort?.uselessInformation?.repartitionSchemaCreateAndEditGroupAvailabilityFrom || undefined,
                        to: cohort?.uselessInformation?.repartitionSchemaCreateAndEditGroupAvailabilityTo || undefined,
                      }}
                      onChangeRange={(range) => {
                        onCohortChange({
                          ...cohort,
                          uselessInformation: {
                            ...cohort.uselessInformation,
                            repartitionSchemaCreateAndEditGroupAvailabilityFrom: range?.from,
                            repartitionSchemaCreateAndEditGroupAvailabilityTo: range?.to,
                          },
                        });
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Accès au schéma de répartition </p>
                      <MdInfoOutline data-tip data-for="acces_schema" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="acces_schema" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                        <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                          Autoriser ou bloquer l’accès à la consultation du schéma de répartition.
                        </p>
                      </ReactTooltip>
                    </div>
                    <SimpleToggle
                      label="Référents régionaux"
                      disabled={isLoading || readOnly}
                      value={cohort.schemaAccessForReferentRegion}
                      onChange={() => onCohortChange({ ...cohort, schemaAccessForReferentRegion: !cohort.schemaAccessForReferentRegion })}
                    />
                    <SimpleToggle
                      label="Référents départementaux"
                      disabled={isLoading || readOnly}
                      value={cohort.schemaAccessForReferentDepartment}
                      onChange={() => onCohortChange({ ...cohort, schemaAccessForReferentDepartment: !cohort.schemaAccessForReferentDepartment })}
                    />
                  </div>
                </>
              )}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs  font-medium text-gray-900">Téléchargement du schéma de répartition</p>
                  <MdInfoOutline data-tip data-for="téléchargement_schema" className="h-5 w-5 cursor-pointer text-gray-400" />
                  <ReactTooltip id="téléchargement_schema" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                      Ouverture ou fermeture pour les utilisateurs de la possibilité de télécharger le schéma de répartition. L’ouverture active les notifications au transporteur
                      lors des modifications sur le schéma de répartition.
                    </p>
                  </ReactTooltip>
                </div>
                <ToggleDate
                  label="Transporteur"
                  disabled={isLoading}
                  readOnly={readOnly}
                  // @ts-ignore
                  value={cohort.repartitionSchemaDownloadAvailability}
                  onChange={() => onCohortChange({ ...cohort, repartitionSchemaDownloadAvailability: !cohort.repartitionSchemaDownloadAvailability })}
                  range={{
                    from: cohort?.uselessInformation?.repartitionSchemaDownloadAvailabilityFrom || undefined,
                    to: cohort?.uselessInformation?.repartitionSchemaDownloadAvailabilityTo || undefined,
                  }}
                  onChangeRange={(range) => {
                    onCohortChange({
                      ...cohort,
                      uselessInformation: {
                        ...cohort.uselessInformation,
                        repartitionSchemaDownloadAvailabilityFrom: range?.from,
                        repartitionSchemaDownloadAvailabilityTo: range?.to,
                      },
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs  font-medium text-gray-900">Modification du plan de transport</p>
                  <MdInfoOutline data-tip data-for="demande_correction" className="h-5 w-5 cursor-pointer text-gray-400" />
                  <ReactTooltip id="demande_correction" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <p className="w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                      Ouverture ou fermeture pour les utilisateurs de la possibilité de modifier le plan de transport au niveau d'une ligne"
                    </p>
                  </ReactTooltip>
                </div>
                <SimpleToggle
                  label="Transporteurs"
                  disabled={isLoading || readOnly}
                  value={cohort.busEditionOpenForTransporter}
                  onChange={() => onCohortChange({ ...cohort, busEditionOpenForTransporter: !cohort.busEditionOpenForTransporter })}
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs  font-medium text-gray-900">Demande de correction sur le plan de transport</p>
                  <MdInfoOutline data-tip data-for="demande_correction" className="h-5 w-5 cursor-pointer text-gray-400" />
                  <ReactTooltip id="demande_correction" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <p className="w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                      Ouverture ou fermeture pour les utilisateurs de la possibilité de demander une correction sur le plan de transport.
                    </p>
                  </ReactTooltip>
                </div>
                <ToggleDate
                  label="Référents régionaux"
                  disabled={isLoading}
                  readOnly={readOnly}
                  // @ts-ignore
                  value={cohort.isTransportPlanCorrectionRequestOpen}
                  onChange={() => onCohortChange({ ...cohort, isTransportPlanCorrectionRequestOpen: !cohort.isTransportPlanCorrectionRequestOpen })}
                  range={{
                    from: cohort?.uselessInformation?.isTransportPlanCorrectionRequestOpenFrom || undefined,
                    to: cohort?.uselessInformation?.isTransportPlanCorrectionRequestOpenTo || undefined,
                  }}
                  onChangeRange={(range) => {
                    onCohortChange({
                      ...cohort,
                      uselessInformation: {
                        ...cohort.uselessInformation,
                        isTransportPlanCorrectionRequestOpenFrom: range?.from,
                        isTransportPlanCorrectionRequestOpenTo: range?.to,
                      },
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Affectation et pointage (phase 1) */}
      <div className="flex flex-col gap-8 rounded-xl bg-white px-8 pb-12 pt-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
        <div className="flex w-full flex-col gap-8">
          <p className="text-lg font-medium leading-5 text-gray-900">Affectation et pointage (phase 1)</p>
          <div className="flex">
            <div className="flex w-[45%] flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs  font-medium text-gray-900">Annonce et visibilité des affectations par les volontaires</p>
                  <MdInfoOutline data-tip data-for="annonce_affectation" className="h-5 w-5 cursor-pointer text-gray-400" />
                  <ReactTooltip id="annonce_affectation" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <ul className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                      <li>Ouverture ou fermeture de la visibilité sur l’affectation par le volontaire sur son compte.</li>
                      <li>Blocage des emails envoyés automatiquement par la plateforme lors de l’affectation manuelle.</li>
                    </ul>
                  </ReactTooltip>
                </div>
                <ToggleDate
                  label="Volontaires"
                  disabled={isLoading}
                  readOnly={readOnly}
                  // @ts-ignore
                  value={cohort.isAssignmentAnnouncementsOpenForYoung}
                  onChange={() => onCohortChange({ ...cohort, isAssignmentAnnouncementsOpenForYoung: !cohort.isAssignmentAnnouncementsOpenForYoung })}
                  range={{
                    from: cohort?.uselessInformation?.isAssignmentAnnouncementsOpenForYoungFrom || undefined,
                    to: cohort?.uselessInformation?.isAssignmentAnnouncementsOpenForYoungTo || undefined,
                  }}
                  onChangeRange={(range) => {
                    onCohortChange({
                      ...cohort,
                      uselessInformation: {
                        ...cohort.uselessInformation,
                        isAssignmentAnnouncementsOpenForYoungFrom: range?.from,
                        isAssignmentAnnouncementsOpenForYoungTo: range?.to,
                      },
                    });
                  }}
                />
              </div>
              <>
                <div className="flex items-center gap-2">
                  <p className="flex flex-1 text-xs  font-medium text-gray-900">
                    Affectation manuelle des volontaires {cohort.type !== COHORT_TYPE.CLE && "et modification de leur affectation et de leur point de rassemblement"}
                  </p>
                  <MdInfoOutline data-tip data-for="affectation_manuelle" className="h-5 w-5 cursor-pointer text-gray-400" />
                  <ReactTooltip id="affectation_manuelle" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <p className="w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                      Ouverture ou fermeture pour les utilisateurs du droit à affecter manuellement des volontaires
                      {cohort.type !== COHORT_TYPE.CLE && "et/ou à modifier leur centre d’affectation ou point de rassemblement."}
                    </p>
                  </ReactTooltip>
                </div>
                <ToggleDate
                  label="Modérateurs"
                  disabled={isLoading}
                  readOnly={readOnly}
                  // @ts-ignore
                  value={cohort.manualAffectionOpenForAdmin}
                  onChange={() =>
                    onCohortChange({
                      ...cohort,
                      manualAffectionOpenForAdmin: !cohort.manualAffectionOpenForAdmin,
                    })
                  }
                  range={{
                    from: cohort?.uselessInformation?.manualAffectionOpenForAdminFrom || undefined,
                    to: cohort?.uselessInformation?.manualAffectionOpenForAdminTo || undefined,
                  }}
                  onChangeRange={(range) => {
                    onCohortChange({
                      ...cohort,
                      uselessInformation: {
                        ...cohort.uselessInformation,
                        manualAffectionOpenForAdminFrom: range?.from,
                        manualAffectionOpenForAdminTo: range?.to,
                      },
                    });
                  }}
                />
                {cohort.type !== COHORT_TYPE.CLE && (
                  <>
                    <ToggleDate
                      label="Référents régionaux"
                      disabled={isLoading}
                      readOnly={readOnly}
                      // @ts-ignore
                      value={cohort.manualAffectionOpenForReferentRegion}
                      onChange={() =>
                        onCohortChange({
                          ...cohort,
                          manualAffectionOpenForReferentRegion: !cohort.manualAffectionOpenForReferentRegion,
                        })
                      }
                      range={{
                        from: cohort?.uselessInformation?.manualAffectionOpenForReferentRegionFrom || undefined,
                        to: cohort?.uselessInformation?.manualAffectionOpenForReferentRegionTo || undefined,
                      }}
                      onChangeRange={(range) => {
                        onCohortChange({
                          ...cohort,
                          uselessInformation: {
                            ...cohort.uselessInformation,
                            manualAffectionOpenForReferentRegionFrom: range?.from,
                            manualAffectionOpenForReferentRegionTo: range?.to,
                          },
                        });
                      }}
                    />
                    <ToggleDate
                      label="Référents départementaux"
                      disabled={isLoading}
                      readOnly={readOnly}
                      // @ts-ignore
                      value={cohort.manualAffectionOpenForReferentDepartment}
                      onChange={() =>
                        onCohortChange({
                          ...cohort,
                          manualAffectionOpenForReferentDepartment: !cohort.manualAffectionOpenForReferentDepartment,
                        })
                      }
                      range={{
                        from: cohort?.uselessInformation?.manualAffectionOpenForReferentDepartmentFrom || undefined,
                        to: cohort?.uselessInformation?.manualAffectionOpenForReferentDepartmentTo || undefined,
                      }}
                      onChangeRange={(range) => {
                        onCohortChange({
                          ...cohort,
                          uselessInformation: {
                            ...cohort.uselessInformation,
                            manualAffectionOpenForReferentDepartmentFrom: range?.from,
                            manualAffectionOpenForReferentDepartmentTo: range?.to,
                          },
                        });
                      }}
                    />

                    <div className="mt-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <p className="text-xs  font-medium text-gray-900">Confirmation du point de rassemblement par les volontaires</p>
                        <MdInfoOutline data-tip data-for="confirmation_PDR" className="h-5 w-5 cursor-pointer text-gray-400" />
                        <ReactTooltip id="confirmation_PDR" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                          <ul className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                            <li>Fin de la possibilité de confirmer le point de rassemblement pour le volontaire sur son compte.</li>
                            <li>
                              Fin de la possibilité pour un utilisateur de choisir l’option “Je laisse [Prénom du volontaire] choisir son point de rassemblement” dans la modale de
                              choix du point de rassemblement.
                            </li>
                            <li>Cela prend effet à 23h59 heure de Paris.</li>
                          </ul>
                        </ReactTooltip>
                      </div>
                      <DatePickerInput
                        mode="single"
                        label="Fin"
                        placeholder={"Date"}
                        disabled={isLoading}
                        readOnly={readOnly}
                        // @ts-ignore
                        value={cohort.pdrChoiceLimitDate}
                        onChange={(value) => onCohortChange({ ...cohort, pdrChoiceLimitDate: value })}
                        error={error.pdrChoiceLimitDate}
                      />
                    </div>
                  </>
                )}
              </>
            </div>
            <div className="flex w-[10%] items-center justify-center">
              <div className="h-[90%] w-[1px] border-r-[1px] border-gray-200"></div>
            </div>
            <div className="flex w-[45%] flex-col gap-4">
              {/* TODO implementer parametres sur la plateforme */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs  font-medium text-gray-900">Disponibilité des listes de transport par centre (envoi par email)</p>
                  <MdInfoOutline data-tip data-for="disponibilité_liste" className="h-5 w-5 cursor-pointer text-gray-400" />
                  <ReactTooltip id="disponibilité_liste" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <ul className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                      <li>
                        Ouverture ou fermeture de l’accès à la liste des volontaires d’un même centre par ligne de transport et par point de rassemblement envoyé par email
                        (activation/désactivation du token).
                      </li>
                      <li>Attention : si les dates sont modifiées après une première activation du token, les token activés ne seront pas mis à jour.</li>
                    </ul>
                  </ReactTooltip>
                </div>
                <ToggleDate
                  label="Tout utilisateur"
                  disabled={isLoading}
                  readOnly={readOnly}
                  // @ts-ignore
                  value={cohort.busListAvailability}
                  onChange={() => onCohortChange({ ...cohort, busListAvailability: !cohort.busListAvailability })}
                  range={{
                    from: cohort?.uselessInformation?.busListAvailabilityFrom || undefined,
                    to: cohort?.uselessInformation?.busListAvailabilityTo || undefined,
                  }}
                  onChangeRange={(range) => {
                    onCohortChange({
                      ...cohort,
                      uselessInformation: {
                        ...cohort.uselessInformation,
                        busListAvailabilityFrom: range?.from,
                        busListAvailabilityTo: range?.to,
                      },
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs  font-medium text-gray-900">Pointage</p>
                  <MdInfoOutline data-tip data-for="pointage" className="h-5 w-5 cursor-pointer text-gray-400" />
                  <ReactTooltip id="pointage" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <p className="w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                      Ouverture ou fermeture pour les utilisateurs de la possibilité de réaliser le pointage des volontaires.
                    </p>
                  </ReactTooltip>
                </div>
                <ToggleDate
                  label="Chefs de centre"
                  disabled={isLoading}
                  readOnly={readOnly}
                  // @ts-ignore
                  value={cohort.youngCheckinForHeadOfCenter}
                  onChange={() => onCohortChange({ ...cohort, youngCheckinForHeadOfCenter: !cohort.youngCheckinForHeadOfCenter })}
                  range={{
                    from: cohort?.uselessInformation?.youngCheckinForHeadOfCenterFrom || undefined,
                    to: cohort?.uselessInformation?.youngCheckinForHeadOfCenterTo || undefined,
                  }}
                  onChangeRange={(range) => {
                    onCohortChange({
                      ...cohort,
                      uselessInformation: {
                        ...cohort.uselessInformation,
                        youngCheckinForHeadOfCenterFrom: range?.from,
                        youngCheckinForHeadOfCenterTo: range?.to,
                      },
                    });
                  }}
                />
                <ToggleDate
                  label="Modérateurs"
                  disabled={isLoading}
                  readOnly={readOnly}
                  // @ts-ignore
                  value={cohort.youngCheckinForAdmin}
                  onChange={() => onCohortChange({ ...cohort, youngCheckinForAdmin: !cohort.youngCheckinForAdmin })}
                  range={{
                    from: cohort?.uselessInformation?.youngCheckinForAdminFrom || undefined,
                    to: cohort?.uselessInformation?.youngCheckinForAdminTo || undefined,
                  }}
                  onChangeRange={(range) => {
                    onCohortChange({
                      ...cohort,
                      uselessInformation: {
                        ...cohort.uselessInformation,
                        youngCheckinForAdminFrom: range?.from,
                        youngCheckinForAdminTo: range?.to,
                      },
                    });
                  }}
                />
                <ToggleDate
                  label="Référents régionaux"
                  disabled={isLoading}
                  readOnly={readOnly}
                  // @ts-ignore
                  value={cohort.youngCheckinForRegionReferent}
                  onChange={() => onCohortChange({ ...cohort, youngCheckinForRegionReferent: !cohort.youngCheckinForRegionReferent })}
                  range={{
                    from: cohort?.uselessInformation?.youngCheckinForRegionReferentFrom || undefined,
                    to: cohort?.uselessInformation?.youngCheckinForRegionReferentTo || undefined,
                  }}
                  onChangeRange={(range) => {
                    onCohortChange({
                      ...cohort,
                      uselessInformation: {
                        ...cohort.uselessInformation,
                        youngCheckinForRegionReferentFrom: range?.from,
                        youngCheckinForRegionReferentTo: range?.to,
                      },
                    });
                  }}
                />
                <ToggleDate
                  label="Référents départementaux"
                  disabled={isLoading}
                  readOnly={readOnly}
                  // @ts-ignore
                  value={cohort.youngCheckinForDepartmentReferent}
                  onChange={() => onCohortChange({ ...cohort, youngCheckinForDepartmentReferent: !cohort.youngCheckinForDepartmentReferent })}
                  range={{
                    from: cohort?.uselessInformation?.youngCheckinForDepartmentReferentFrom || undefined,
                    to: cohort?.uselessInformation?.youngCheckinForDepartmentReferentTo || undefined,
                  }}
                  onChangeRange={(range) => {
                    onCohortChange({
                      ...cohort,
                      uselessInformation: {
                        ...cohort.uselessInformation,
                        youngCheckinForDepartmentReferentFrom: range?.from,
                        youngCheckinForDepartmentReferentTo: range?.to,
                      },
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs  font-medium text-gray-900">Début de validation de la phase 1</p>
                  <MdInfoOutline data-tip data-for="validation_phase" className="h-5 w-5 cursor-pointer text-gray-400" />
                  <ReactTooltip id="validation_phase" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <p className="w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">Par défaut 9e jour après le début du séjour.</p>
                  </ReactTooltip>
                </div>
                {/* @ts-ignore */}
                <NumberInput days={cohort.daysToValidate} label={"Nombre de jour pour validation"} onChange={(e) => onCohortChange({ ...cohort, daysToValidate: e })} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {cohort.type === COHORT_TYPE.CLE && (
        <CleSettings cleSettingsData={cohort} isLoading={isLoading} readOnly={readOnly} onChange={(cleSettingsData) => onCohortChange({ ...cohort, ...cleSettingsData })} />
      )}

      {!readOnly && (
        <div className="flex items-center justify-center gap-3 ">
          <ButtonPrimary disabled={isLoading} className="h-[50px] w-[300px]" onClick={onSubmit}>
            {isLoading && <BiLoaderAlt className="h-4 w-4 animate-spin" />}
            Enregistrer
          </ButtonPrimary>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { MdInfoOutline } from "react-icons/md";
import ReactTooltip from "react-tooltip";
import { Controller, useForm } from "react-hook-form";
import { HiOutlineExclamation } from "react-icons/hi";
import cx from "classnames";

import { COHORT_TYPE, CohortDto, INSCRIPTION_GOAL_LEVELS } from "snu-lib";
import { Button, Container } from "@snu/ds/admin";
import dayjs from "@/utils/dayjs.utils";
import DatePickerInput from "@/components/ui/forms/dateForm/DatePickerInput";
import SimpleToggle from "@/components/ui/forms/dateForm/SimpleToggle";
import { useUpdateCohortInscriptions } from "../../hooks/useCohortUpdate";
import { ManualInscriptionSettings } from "./ManualInscriptionSettings";

export type InscriptionsFormData = Pick<
  CohortDto,
  | "inscriptionStartDate"
  | "inscriptionEndDate"
  | "reInscriptionStartDate"
  | "reInscriptionEndDate"
  | "inscriptionModificationEndDate"
  | "instructionEndDate"
  | "youngHTSBasculeLPDisabled"
  | "objectifLevel"
  | "inscriptionOpenForReferentRegion"
  | "inscriptionOpenForReferentDepartment"
  | "inscriptionOpenForReferentClasse"
  | "inscriptionOpenForAdministrateurCle"
>;

interface InscriptionsProps {
  cohort: CohortDto;
  readOnly: boolean;
}

export default function InfosInscriptions({ cohort, readOnly }: InscriptionsProps) {
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, dirtyFields },
    reset,
  } = useForm<InscriptionsFormData>({
    defaultValues: {
      inscriptionStartDate: cohort.inscriptionStartDate,
      inscriptionEndDate: cohort.inscriptionEndDate,
      reInscriptionStartDate: cohort.reInscriptionStartDate,
      reInscriptionEndDate: cohort.reInscriptionEndDate,
      inscriptionModificationEndDate: cohort.inscriptionModificationEndDate,
      instructionEndDate: cohort.instructionEndDate,
      youngHTSBasculeLPDisabled: cohort.youngHTSBasculeLPDisabled,
      objectifLevel: cohort.objectifLevel,
      inscriptionOpenForReferentRegion: cohort.inscriptionOpenForReferentRegion,
      inscriptionOpenForReferentDepartment: cohort.inscriptionOpenForReferentDepartment,
      inscriptionOpenForReferentClasse: cohort.inscriptionOpenForReferentClasse,
      inscriptionOpenForAdministrateurCle: cohort.inscriptionOpenForAdministrateurCle,
    },
    mode: "onChange",
  });
  const isNotSaved = isDirty && !isSubmitting;
  const [showSpecificDatesReInscription, setShowSpecificDatesReInscription] = useState(!!(cohort.reInscriptionStartDate || cohort.reInscriptionEndDate));
  const updateCohorteInscriptionsMutation = useUpdateCohortInscriptions();

  useEffect(() => {
    if (isDirty) {
      console.log("Form is dirty. Dirty fields:", dirtyFields);
      console.log("Original values:", {
        reInscriptionStartDate: cohort.reInscriptionStartDate,
        reInscriptionEndDate: cohort.reInscriptionEndDate,
      });
      console.log("Current form values:", {
        reInscriptionStartDate: control._formValues.reInscriptionStartDate,
        reInscriptionEndDate: control._formValues.reInscriptionEndDate,
      });
    }
  }, [isDirty, dirtyFields, cohort, control._formValues]);

  const handleOnCancel = () => {
    reset();
    setShowSpecificDatesReInscription(!!(cohort.reInscriptionStartDate || cohort.reInscriptionEndDate));
  };

  const handleConfirmSubmit = (data: InscriptionsFormData) => {
    if (!cohort._id) return;
    updateCohorteInscriptionsMutation.mutate({
      data,
      cohortId: cohort._id,
    });
    reset(data);
  };

  return (
    <Container className={cx({ "outline outline-2 outline-blue-600": isDirty })}>
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
              <Controller
                name="inscriptionStartDate"
                control={control}
                rules={{ required: "Ce champ est requis" }}
                render={({ field }) => (
                  <DatePickerInput
                    mode="single"
                    isTime
                    label="Ouverture"
                    placeholder="Date et heure"
                    // @ts-ignore
                    value={field.value}
                    error={errors.inscriptionStartDate?.message}
                    onChange={(value) => field.onChange(value)}
                    readOnly={readOnly}
                    disabled={isSubmitting}
                  />
                )}
              />
              <Controller
                name="inscriptionEndDate"
                control={control}
                rules={{ required: "Ce champ est requis" }}
                render={({ field }) => (
                  <DatePickerInput
                    mode="single"
                    isTime={true}
                    label="Fermeture"
                    placeholder="Date et heure"
                    // @ts-ignore
                    value={field.value ? dayjs(field.value).local().toDate() : null}
                    onChange={(value) => field.onChange(value)}
                    readOnly={readOnly}
                    disabled={isSubmitting}
                    error={errors.inscriptionEndDate?.message}
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <p className="text-gray-900  text-xs font-medium">Réinscriptions</p>
              </div>

              <SimpleToggle
                label="Dates spécifiques"
                disabled={isSubmitting || readOnly}
                value={!!showSpecificDatesReInscription}
                onChange={(v) => {
                  console.log("Toggle changed to:", v, "Previous state:", showSpecificDatesReInscription);
                  if (v == false) {
                    setValue("reInscriptionStartDate", null, { shouldDirty: true });
                    setValue("reInscriptionEndDate", null, { shouldDirty: true });
                  }
                  setShowSpecificDatesReInscription(v);
                }}
              />

              {showSpecificDatesReInscription && (
                <>
                  <Controller
                    name="reInscriptionStartDate"
                    control={control}
                    render={({ field }) => (
                      <DatePickerInput
                        mode="single"
                        isTime
                        label="Ouverture"
                        placeholder="Date et heure"
                        // @ts-ignore
                        value={field.value ? dayjs(field.value).local().toDate() : null}
                        error={errors.reInscriptionStartDate?.message}
                        onChange={(value) => field.onChange(value)}
                        readOnly={readOnly}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  <Controller
                    name="reInscriptionEndDate"
                    control={control}
                    render={({ field }) => (
                      <DatePickerInput
                        mode="single"
                        isTime
                        label="Fermeture"
                        placeholder="Date et heure"
                        // @ts-ignore
                        value={field.value ? dayjs(field.value).local().toDate() : null}
                        error={errors.reInscriptionEndDate?.message}
                        onChange={(value) => field.onChange(value)}
                        readOnly={readOnly}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </>
              )}
            </div>
            <ManualInscriptionSettings cohort={cohort} control={control} isLoading={isSubmitting} readOnly={readOnly} />
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
                <Controller
                  name="inscriptionModificationEndDate"
                  control={control}
                  rules={{ required: "Ce champ est requis" }}
                  render={({ field }) => (
                    <DatePickerInput
                      mode="single"
                      isTime
                      label="Fermeture"
                      placeholder="Date"
                      // @ts-ignore
                      value={field.value ? dayjs(field.value).local().toDate() : null}
                      onChange={(value) => field.onChange(value)}
                      readOnly={readOnly}
                      disabled={isSubmitting}
                      error={errors.inscriptionModificationEndDate?.message}
                    />
                  )}
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
                <Controller
                  name="instructionEndDate"
                  control={control}
                  rules={{ required: "Ce champ est requis" }}
                  render={({ field }) => (
                    <DatePickerInput
                      mode="single"
                      isTime
                      label="Fermeture"
                      placeholder="Date"
                      // @ts-ignore
                      value={field.value ? dayjs(field.value).local().toDate() : null}
                      onChange={(value) => field.onChange(value)}
                      readOnly={readOnly}
                      disabled={isSubmitting}
                      error={errors.instructionEndDate?.message}
                    />
                  )}
                />
              </div>
              {cohort.type !== COHORT_TYPE.CLE && (
                <Controller
                  name="youngHTSBasculeLPDisabled"
                  control={control}
                  render={({ field }) => (
                    <SimpleToggle
                      label="Bascule manuelle de LC vers LP pour les référents regionaux après fermeture de l'instruction"
                      disabled={isSubmitting || readOnly}
                      value={!field.value}
                      onChange={(value) => field.onChange(!value)}
                    />
                  )}
                />
              )}
            </div>
            {cohort.type !== COHORT_TYPE.CLE && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-gray-900 text-xs font-medium">Objectifs</p>
                  <MdInfoOutline data-tip data-for="objectifs" className="text-gray-400 h-5 w-5 cursor-pointer" />
                  <ReactTooltip id="objectifs" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                    <p className="w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                      La définition d'objectifs régionaux permet de dépasser les quotas actuels en matière de traitement de dossiers LP au niveau départemental
                    </p>
                  </ReactTooltip>
                </div>
                <div className="rounded-lg bg-gray-100 p-3">
                  <div className="flex flex-col gap-4">
                    <Controller
                      name="objectifLevel"
                      control={control}
                      render={({ field }) => (
                        <>
                          <div className="flex items-center gap-4">
                            <input
                              type="radio"
                              id="departemental"
                              {...field}
                              value={INSCRIPTION_GOAL_LEVELS.DEPARTEMENTAL}
                              checked={field.value === INSCRIPTION_GOAL_LEVELS.DEPARTEMENTAL}
                              disabled={isSubmitting || readOnly}
                              className="h-4 w-4 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <label htmlFor="departemental" className="m-0 text-sm text-gray-700 cursor-pointer">
                              au niveau départemental
                            </label>
                          </div>
                          <div className="flex gap-4 items-center">
                            <input
                              type="radio"
                              id="regional"
                              {...field}
                              value={INSCRIPTION_GOAL_LEVELS.REGIONAL}
                              checked={field.value === INSCRIPTION_GOAL_LEVELS.REGIONAL}
                              disabled={isSubmitting || readOnly}
                              className="h-4 w-4 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <label htmlFor="regional" className="m-0 text-sm text-gray-700 cursor-pointer">
                              au niveau régional
                            </label>
                          </div>
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <hr className="border-t border-gray-200 mt-4" />
      <div className="flex justify-end mt-4 gap-2">
        {isNotSaved && (
          <div className="flex items-center gap-2 text-gray-500">
            <HiOutlineExclamation className="w-5 h-5" />
            <span>Non enregistrée</span>
          </div>
        )}
        {isDirty ? <Button title="Annuler" type="secondary" className="flex justify-center" onClick={handleOnCancel} disabled={isSubmitting} /> : null}
        <Button
          disabled={isSubmitting || !isDirty}
          type="wired"
          className="flex items-center gap-2 px-6 py-2 rounded-md"
          title="Enregistrer"
          onClick={handleSubmit(handleConfirmSubmit)}
        />
      </div>
    </Container>
  );
}

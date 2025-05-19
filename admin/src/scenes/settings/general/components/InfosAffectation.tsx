import React from "react";
import { MdInfoOutline } from "react-icons/md";
import ReactTooltip from "react-tooltip";
import { Controller, useForm } from "react-hook-form";
import { HiOutlineExclamation } from "react-icons/hi";

import { COHORT_TYPE, CohortDto } from "snu-lib";
import NumberInput from "@/components/ui/forms/NumberInput";
import ToggleDate from "@/components/ui/forms/dateForm/ToggleDate";
import { Button, Container } from "@snu/ds/admin";
import DatePickerInput from "@/components/ui/forms/dateForm/DatePickerInput";
import { useUpdateCohortAffectation } from "../hooks/useCohortUpdate";

export type AffectationsFormData = Pick<
  CohortDto,
  | "isAssignmentAnnouncementsOpenForYoung"
  | "manualAffectionOpenForAdmin"
  | "manualAffectionOpenForReferentRegion"
  | "manualAffectionOpenForReferentDepartment"
  | "pdrChoiceLimitDate"
  | "busListAvailability"
  | "youngCheckinForHeadOfCenter"
  | "youngCheckinForAdmin"
  | "youngCheckinForRegionReferent"
  | "youngCheckinForDepartmentReferent"
  | "daysToValidate"
  | "uselessInformation"
>;

interface AffectationsProps {
  cohort: CohortDto;
  readOnly: boolean;
}

export default function InfosAffectations({ cohort, readOnly }: AffectationsProps) {
  const {
    control,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, dirtyFields },
    reset,
  } = useForm<AffectationsFormData>({
    defaultValues: {
      isAssignmentAnnouncementsOpenForYoung: cohort.isAssignmentAnnouncementsOpenForYoung,
      manualAffectionOpenForAdmin: cohort.manualAffectionOpenForAdmin,
      manualAffectionOpenForReferentRegion: cohort.manualAffectionOpenForReferentRegion,
      manualAffectionOpenForReferentDepartment: cohort.manualAffectionOpenForReferentDepartment,
      pdrChoiceLimitDate: cohort.pdrChoiceLimitDate,
      busListAvailability: cohort.busListAvailability,
      youngCheckinForHeadOfCenter: cohort.youngCheckinForHeadOfCenter,
      youngCheckinForAdmin: cohort.youngCheckinForAdmin,
      youngCheckinForRegionReferent: cohort.youngCheckinForRegionReferent,
      youngCheckinForDepartmentReferent: cohort.youngCheckinForDepartmentReferent,
      daysToValidate: cohort.daysToValidate,
      uselessInformation: {
        isAssignmentAnnouncementsOpenForYoungFrom: cohort.uselessInformation?.isAssignmentAnnouncementsOpenForYoungFrom,
        isAssignmentAnnouncementsOpenForYoungTo: cohort.uselessInformation?.isAssignmentAnnouncementsOpenForYoungTo,
        manualAffectionOpenForAdminFrom: cohort.uselessInformation?.manualAffectionOpenForAdminFrom,
        manualAffectionOpenForAdminTo: cohort.uselessInformation?.manualAffectionOpenForAdminTo,
        manualAffectionOpenForReferentRegionFrom: cohort.uselessInformation?.manualAffectionOpenForReferentRegionFrom,
        manualAffectionOpenForReferentRegionTo: cohort.uselessInformation?.manualAffectionOpenForReferentRegionTo,
        manualAffectionOpenForReferentDepartmentFrom: cohort.uselessInformation?.manualAffectionOpenForReferentDepartmentFrom,
        manualAffectionOpenForReferentDepartmentTo: cohort.uselessInformation?.manualAffectionOpenForReferentDepartmentTo,
        busListAvailabilityFrom: cohort.uselessInformation?.busListAvailabilityFrom,
        busListAvailabilityTo: cohort.uselessInformation?.busListAvailabilityTo,
        youngCheckinForHeadOfCenterFrom: cohort.uselessInformation?.youngCheckinForHeadOfCenterFrom,
        youngCheckinForHeadOfCenterTo: cohort.uselessInformation?.youngCheckinForHeadOfCenterTo,
        youngCheckinForAdminFrom: cohort.uselessInformation?.youngCheckinForAdminFrom,
        youngCheckinForAdminTo: cohort.uselessInformation?.youngCheckinForAdminTo,
        youngCheckinForRegionReferentFrom: cohort.uselessInformation?.youngCheckinForRegionReferentFrom,
        youngCheckinForRegionReferentTo: cohort.uselessInformation?.youngCheckinForRegionReferentTo,
        youngCheckinForDepartmentReferentFrom: cohort.uselessInformation?.youngCheckinForDepartmentReferentFrom,
        youngCheckinForDepartmentReferentTo: cohort.uselessInformation?.youngCheckinForDepartmentReferentTo,
      },
    },
    mode: "onChange",
  });
  const isNotSaved = isDirty && !isSubmitting;
  const updateCohorteAffectationsMutation = useUpdateCohortAffectation();

  const handleOnCancel = () => {
    reset();
  };

  const handleConfirmSubmit = (data: AffectationsFormData) => {
    if (!cohort._id) return;
    updateCohorteAffectationsMutation.mutate({
      data,
      cohortId: cohort._id,
    });
    reset(data);
  };

  return (
    <Container className={`${isDirty && "outline outline-2 outline-blue-600"}`}>
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
              <Controller
                name="isAssignmentAnnouncementsOpenForYoung"
                control={control}
                render={({ field }) => (
                  <ToggleDate
                    label="Volontaires"
                    disabled={isSubmitting}
                    readOnly={readOnly}
                    value={!!field.value}
                    onChange={(value) => field.onChange(value)}
                    range={{
                      from: watch("uselessInformation.isAssignmentAnnouncementsOpenForYoungFrom") || undefined,
                      to: watch("uselessInformation.isAssignmentAnnouncementsOpenForYoungTo") || undefined,
                    }}
                    onChangeRange={(range) => {
                      setValue("uselessInformation.isAssignmentAnnouncementsOpenForYoungFrom", range.from, { shouldDirty: true });
                      setValue("uselessInformation.isAssignmentAnnouncementsOpenForYoungTo", range.to, { shouldDirty: true });
                    }}
                  />
                )}
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
              <Controller
                name="manualAffectionOpenForAdmin"
                control={control}
                render={({ field }) => (
                  <ToggleDate
                    label="Modérateurs"
                    disabled={isSubmitting}
                    readOnly={readOnly}
                    value={!!field.value}
                    onChange={(value) => field.onChange(value)}
                    range={{
                      from: watch("uselessInformation.manualAffectionOpenForAdminFrom") || undefined,
                      to: watch("uselessInformation.manualAffectionOpenForAdminTo") || undefined,
                    }}
                    onChangeRange={(range) => {
                      setValue("uselessInformation.manualAffectionOpenForAdminFrom", range.from, { shouldDirty: true });
                      setValue("uselessInformation.manualAffectionOpenForAdminTo", range.to, { shouldDirty: true });
                    }}
                  />
                )}
              />
              {cohort.type !== COHORT_TYPE.CLE && (
                <>
                  <Controller
                    name="manualAffectionOpenForReferentRegion"
                    control={control}
                    render={({ field }) => (
                      <ToggleDate
                        label="Référents régionaux"
                        disabled={isSubmitting}
                        readOnly={readOnly}
                        value={!!field.value}
                        onChange={(value) => field.onChange(value)}
                        range={{
                          from: watch("uselessInformation.manualAffectionOpenForReferentRegionFrom") || undefined,
                          to: watch("uselessInformation.manualAffectionOpenForReferentRegionTo") || undefined,
                        }}
                        onChangeRange={(range) => {
                          setValue("uselessInformation.manualAffectionOpenForReferentRegionFrom", range.from, { shouldDirty: true });
                          setValue("uselessInformation.manualAffectionOpenForReferentRegionTo", range.to, { shouldDirty: true });
                        }}
                      />
                    )}
                  />
                  <Controller
                    name="manualAffectionOpenForReferentDepartment"
                    control={control}
                    render={({ field }) => (
                      <ToggleDate
                        label="Référents départementaux"
                        disabled={isSubmitting}
                        readOnly={readOnly}
                        value={!!field.value}
                        onChange={(value) => field.onChange(value)}
                        range={{
                          from: watch("uselessInformation.manualAffectionOpenForReferentDepartmentFrom") || undefined,
                          to: watch("uselessInformation.manualAffectionOpenForReferentDepartmentTo") || undefined,
                        }}
                        onChangeRange={(range) => {
                          setValue("uselessInformation.manualAffectionOpenForReferentDepartmentFrom", range.from, { shouldDirty: true });
                          setValue("uselessInformation.manualAffectionOpenForReferentDepartmentTo", range.to, { shouldDirty: true });
                        }}
                      />
                    )}
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
                    <Controller
                      name="pdrChoiceLimitDate"
                      control={control}
                      render={({ field }) => (
                        <DatePickerInput
                          mode="single"
                          label="Fin"
                          placeholder={"Date"}
                          disabled={isSubmitting}
                          readOnly={readOnly}
                          // @ts-ignore
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          error={errors.pdrChoiceLimitDate?.message}
                        />
                      )}
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
              <Controller
                name="busListAvailability"
                control={control}
                render={({ field }) => (
                  <ToggleDate
                    label="Tout utilisateur"
                    disabled={isSubmitting}
                    readOnly={readOnly}
                    value={!!field.value}
                    onChange={(value) => field.onChange(value)}
                    range={{
                      from: watch("uselessInformation.busListAvailabilityFrom") || undefined,
                      to: watch("uselessInformation.busListAvailabilityTo") || undefined,
                    }}
                    onChangeRange={(range) => {
                      setValue("uselessInformation.busListAvailabilityFrom", range.from, { shouldDirty: true });
                      setValue("uselessInformation.busListAvailabilityFrom", range.to, { shouldDirty: true });
                    }}
                  />
                )}
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
              <Controller
                name="youngCheckinForHeadOfCenter"
                control={control}
                render={({ field }) => (
                  <ToggleDate
                    label="Chefs de centre et leurs équipes"
                    tooltipText="Donne également accès au pointage aux chefs de centre adjoint et aux référents sanitaires."
                    disabled={isSubmitting}
                    readOnly={readOnly}
                    value={!!field.value}
                    onChange={(value) => field.onChange(value)}
                    range={{
                      from: watch("uselessInformation.youngCheckinForHeadOfCenterFrom") || undefined,
                      to: watch("uselessInformation.youngCheckinForHeadOfCenterTo") || undefined,
                    }}
                    onChangeRange={(range) => {
                      setValue("uselessInformation.youngCheckinForHeadOfCenterFrom", range.from, { shouldDirty: true });
                      setValue("uselessInformation.youngCheckinForHeadOfCenterTo", range.to, { shouldDirty: true });
                    }}
                  />
                )}
              />
              <Controller
                name="youngCheckinForAdmin"
                control={control}
                render={({ field }) => (
                  <ToggleDate
                    label="Modérateurs"
                    disabled={isSubmitting}
                    readOnly={readOnly}
                    value={!!field.value}
                    onChange={(value) => field.onChange(value)}
                    range={{
                      from: watch("uselessInformation.youngCheckinForAdminFrom") || undefined,
                      to: watch("uselessInformation.youngCheckinForAdminTo") || undefined,
                    }}
                    onChangeRange={(range) => {
                      setValue("uselessInformation.youngCheckinForAdminFrom", range.from, { shouldDirty: true });
                      setValue("uselessInformation.youngCheckinForAdminTo", range.to, { shouldDirty: true });
                    }}
                  />
                )}
              />
              <Controller
                name="youngCheckinForRegionReferent"
                control={control}
                render={({ field }) => (
                  <ToggleDate
                    label="Référents régionaux"
                    disabled={isSubmitting}
                    readOnly={readOnly}
                    value={!!field.value}
                    onChange={(value) => field.onChange(value)}
                    range={{
                      from: watch("uselessInformation.youngCheckinForRegionReferentFrom") || undefined,
                      to: watch("uselessInformation.youngCheckinForRegionReferentTo") || undefined,
                    }}
                    onChangeRange={(range) => {
                      setValue("uselessInformation.youngCheckinForRegionReferentFrom", range.from, { shouldDirty: true });
                      setValue("uselessInformation.youngCheckinForRegionReferentTo", range.to, { shouldDirty: true });
                    }}
                  />
                )}
              />
              <Controller
                name="youngCheckinForDepartmentReferent"
                control={control}
                render={({ field }) => (
                  <ToggleDate
                    label="Référents départementaux"
                    disabled={isSubmitting}
                    readOnly={readOnly}
                    value={!!field.value}
                    onChange={(value) => field.onChange(value)}
                    range={{
                      from: watch("uselessInformation.youngCheckinForDepartmentReferentFrom") || undefined,
                      to: watch("uselessInformation.youngCheckinForDepartmentReferentTo") || undefined,
                    }}
                    onChangeRange={(range) => {
                      setValue("uselessInformation.youngCheckinForDepartmentReferentFrom", range.from, { shouldDirty: true });
                      setValue("uselessInformation.youngCheckinForDepartmentReferentTo", range.to, { shouldDirty: true });
                    }}
                  />
                )}
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
              <Controller
                name="daysToValidate"
                control={control}
                //@ts-ignore
                render={({ field }) => <NumberInput days={field.value} label={"Nombre de jour pour validation"} onChange={(value) => field.onChange(value)} />}
              />
            </div>
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

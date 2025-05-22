import React from "react";
import { MdInfoOutline } from "react-icons/md";
import { HiOutlineExclamation } from "react-icons/hi";
import ReactTooltip from "react-tooltip";
import { Controller, useForm } from "react-hook-form";
import cx from "classnames";

import { COHORT_TYPE, COHORT_STATUS, CohortDto } from "snu-lib";
import InputText from "@/components/ui/forms/InputText";
import { Select, Tooltip, Button, Container } from "@snu/ds/admin";
import DatePickerInput from "@/components/ui/forms/dateForm/DatePickerInput";
import SimpleToggle from "@/components/ui/forms/dateForm/SimpleToggle";
import CohortGroupSelector from "./CohortGroupSelector";
import { useUpdateCohortGeneral } from "../../hooks/useCohortUpdate";

export type InfosGeneralesFormData = Pick<CohortDto, "dateStart" | "dateEnd" | "status" | "cohortGroupId" | "uselessInformation"> & {
  specificSnuIdCohort?: CohortDto["specificSnuIdCohort"];
};

interface InfosGeneralesProps {
  cohort: CohortDto;
  readOnly: boolean;
}

export default function InfosGenerales({ cohort, readOnly }: InfosGeneralesProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<InfosGeneralesFormData>({
    defaultValues: {
      dateStart: cohort.dateStart,
      dateEnd: cohort.dateEnd,
      status: cohort.status,
      cohortGroupId: cohort.cohortGroupId,
      specificSnuIdCohort: cohort.specificSnuIdCohort,
      uselessInformation: {
        toolkit: cohort.uselessInformation?.toolkit,
        zones: cohort.uselessInformation?.zones,
        eligibility: cohort.uselessInformation?.eligibility,
      },
    },
    mode: "onChange",
  });
  const isNotSaved = isDirty && !isSubmitting;
  const updateCohortGeneralMutation = useUpdateCohortGeneral();

  const handleOnCancel = () => {
    reset();
  };

  const handleConfirmSubmit = (data: InfosGeneralesFormData) => {
    if (!cohort._id) return;
    updateCohortGeneralMutation.mutate({
      data,
      cohortId: cohort._id,
    });
    reset(data);
  };

  const statusOptions = [
    { value: COHORT_STATUS.PUBLISHED, label: "Publiée" },
    { value: COHORT_STATUS.ARCHIVED, label: "Archivée" },
  ];

  return (
    <Container className={cx({ "outline outline-2 outline-blue-600": isDirty })}>
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
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Ce champ est requis" }}
                  render={({ field }) => (
                    <>
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
                        value={statusOptions.find((o) => o.value === field.value) || null}
                        options={statusOptions}
                        onChange={(option) => field.onChange(option.value)}
                        closeMenuOnSelect
                        disabled={isSubmitting || readOnly}
                      />
                    </>
                  )}
                />
              </div>
              <Controller
                name="cohortGroupId"
                control={control}
                render={({ field }) => (
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
                    <CohortGroupSelector group={field.value} cohort={cohort} onChange={(value) => field.onChange(value)} readOnly={readOnly} />
                  </div>
                )}
              />
              {cohort.type === COHORT_TYPE.CLE && (
                <Controller
                  name="specificSnuIdCohort"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900  text-xs font-medium">Traitement spécifique lié au SI SNU</p>
                        <Tooltip
                          title={`Le bouton doit être activé pour que les centres concernés soient rattachés correctement à cette
                            cohorte spécifique lors de l’import du fichier des centres de sessions.
                            Cette fonctionnalité est à utiliser uniquement pour les séjours CLE spécifiques aux DROM COM`}>
                          <MdInfoOutline size={20} className="text-gray-400" />
                        </Tooltip>
                      </div>
                      <SimpleToggle label="Cohorte spécifique DROM-COM" disabled={isSubmitting || readOnly} value={field.value} onChange={(value) => field.onChange(value)} />
                    </div>
                  )}
                />
              )}
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
                <Controller
                  name="dateStart"
                  control={control}
                  rules={{ required: "Ce champ est requis" }}
                  render={({ field }) => (
                    <DatePickerInput
                      mode="single"
                      label="Début"
                      // @ts-ignore
                      value={field.value}
                      error={errors.dateStart?.message}
                      onChange={(value) => field.onChange(value)}
                      readOnly={readOnly}
                      disabled={isSubmitting}
                      placeholder={"JJ/MM/AAAA"}
                    />
                  )}
                />
                <Controller
                  name="dateEnd"
                  control={control}
                  rules={{ required: "Ce champ est requis" }}
                  render={({ field }) => (
                    <DatePickerInput
                      mode="single"
                      label="Fin"
                      // @ts-ignore
                      value={field.value}
                      error={errors.dateEnd?.message}
                      onChange={(value) => field.onChange(value)}
                      readOnly={readOnly}
                      disabled={isSubmitting}
                      placeholder={"JJ/MM/AAAA"}
                    />
                  )}
                />
              </div>
            </div>
          </div>
          <div className="flex w-[10%] items-center justify-center">
            <div className="h-[90%] w-[1px] border-r-[1px] border-gray-200"></div>
          </div>
          <div className="flex w-[45%] flex-col gap-4">
            <Controller
              name="uselessInformation.toolkit"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs  font-medium text-gray-900">Toolkit d’aide</p>
                    <MdInfoOutline data-tip data-for="toolkit" className="h-5 w-5 cursor-pointer text-gray-400" />
                    <ReactTooltip id="toolkit" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                      <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">Liens vers un articles d&apos;aide pour suivre la cohorte.</p>
                    </ReactTooltip>
                  </div>
                  <input
                    {...field}
                    type="text"
                    placeholder="Indiquez l’URL d’un article de la BDC"
                    className={`w-full p-2 border rounded focus:!border-blue-500 focus:!border-2`}
                  />
                </div>
              )}
            />
            <Controller
              name="uselessInformation.zones"
              control={control}
              render={({ field }) => (
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
                  <textarea {...field} placeholder="Précisez en quelques mots" className={`w-full p-2 border rounded focus:!border-blue-500 focus:!border-2`} />
                </div>
              )}
            />
            <Controller
              name="uselessInformation.eligibility"
              control={control}
              render={({ field }) => (
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
                  <textarea {...field} placeholder="Précisez en quelques mots" className={`w-full p-2 border rounded focus:!border-blue-500 focus:!border-2`} />
                </div>
              )}
            />
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

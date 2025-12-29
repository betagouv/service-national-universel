import React from "react";
import { MdInfoOutline } from "react-icons/md";
import ReactTooltip from "react-tooltip";
import { Controller, useForm } from "react-hook-form";
import cx from "classnames";

import { COHORT_TYPE, CohortDto } from "snu-lib";
import { Container } from "@snu/ds/admin";
import SimpleToggle from "@/components/ui/forms/dateForm/SimpleToggle";
import ToggleDate from "@/components/ui/forms/dateForm/ToggleDate";
import { InformationsConvoyage } from "./InformationsConvoyage";

export type PreparationFormData = Pick<
  CohortDto,
  | "sessionEditionOpenForReferentRegion"
  | "sessionEditionOpenForReferentDepartment"
  | "sessionEditionOpenForTransporter"
  | "pdrEditionOpenForReferentRegion"
  | "pdrEditionOpenForReferentDepartment"
  | "pdrEditionOpenForTransporter"
  | "repartitionSchemaCreateAndEditGroupAvailability"
  | "schemaAccessForReferentRegion"
  | "schemaAccessForReferentDepartment"
  | "busEditionOpenForTransporter"
  | "informationsConvoyage"
  | "uselessInformation"
  | "repartitionSchemaDownloadAvailability"
  | "isTransportPlanCorrectionRequestOpen"
>;

interface PreparationProps {
  cohort: CohortDto;
  readOnly: boolean;
}
export default function InfosPreparation({ cohort, readOnly }: PreparationProps) {
  const {
    control,
    setValue,
    watch,
    formState: { isDirty, isSubmitting },
    reset,
  } = useForm<PreparationFormData>({
    defaultValues: {
      sessionEditionOpenForReferentRegion: cohort.sessionEditionOpenForReferentRegion,
      sessionEditionOpenForReferentDepartment: cohort.sessionEditionOpenForReferentDepartment,
      sessionEditionOpenForTransporter: cohort.sessionEditionOpenForTransporter,
      pdrEditionOpenForReferentRegion: cohort.pdrEditionOpenForReferentRegion,
      pdrEditionOpenForReferentDepartment: cohort.pdrEditionOpenForReferentDepartment,
      pdrEditionOpenForTransporter: cohort.pdrEditionOpenForTransporter,
      repartitionSchemaCreateAndEditGroupAvailability: cohort.repartitionSchemaCreateAndEditGroupAvailability,
      schemaAccessForReferentRegion: cohort.schemaAccessForReferentRegion,
      schemaAccessForReferentDepartment: cohort.schemaAccessForReferentDepartment,
      busEditionOpenForTransporter: cohort.busEditionOpenForTransporter,
      informationsConvoyage: {
        editionOpenForReferentRegion: cohort.informationsConvoyage?.editionOpenForReferentRegion,
        editionOpenForReferentDepartment: cohort.informationsConvoyage?.editionOpenForReferentDepartment,
        editionOpenForHeadOfCenter: cohort.informationsConvoyage?.editionOpenForHeadOfCenter,
      },
      uselessInformation: {
        repartitionSchemaCreateAndEditGroupAvailabilityFrom: cohort.uselessInformation?.repartitionSchemaCreateAndEditGroupAvailabilityFrom,
        repartitionSchemaCreateAndEditGroupAvailabilityTo: cohort.uselessInformation?.repartitionSchemaCreateAndEditGroupAvailabilityTo,
        repartitionSchemaDownloadAvailabilityFrom: cohort.uselessInformation?.repartitionSchemaDownloadAvailabilityFrom,
        repartitionSchemaDownloadAvailabilityTo: cohort.uselessInformation?.repartitionSchemaDownloadAvailabilityTo,
        isTransportPlanCorrectionRequestOpenFrom: cohort.uselessInformation?.isTransportPlanCorrectionRequestOpenFrom,
        isTransportPlanCorrectionRequestOpenTo: cohort.uselessInformation?.isTransportPlanCorrectionRequestOpenTo,
      },
      repartitionSchemaDownloadAvailability: cohort.repartitionSchemaDownloadAvailability,
      isTransportPlanCorrectionRequestOpen: cohort.isTransportPlanCorrectionRequestOpen,
    },
    mode: "onChange",
  });
  return (
    <Container className={cx({ "outline outline-2 outline-blue-600": isDirty })}>
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
              <Controller
                name="sessionEditionOpenForReferentRegion"
                control={control}
                render={({ field }) => (
                  <SimpleToggle label="Référents régionaux" disabled={isSubmitting || readOnly} value={!!field.value} onChange={(value) => field.onChange(value)} />
                )}
              />
              <Controller
                name="sessionEditionOpenForReferentDepartment"
                control={control}
                render={({ field }) => (
                  <SimpleToggle label="Référents départementaux" disabled={isSubmitting || readOnly} value={!!field.value} onChange={(value) => field.onChange(value)} />
                )}
              />
              <Controller
                name="sessionEditionOpenForTransporter"
                control={control}
                render={({ field }) => <SimpleToggle label="Transporteurs" disabled={isSubmitting || readOnly} value={!!field.value} onChange={(value) => field.onChange(value)} />}
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
              <Controller
                name="pdrEditionOpenForReferentRegion"
                control={control}
                render={({ field }) => (
                  <SimpleToggle label="Référents régionaux" disabled={isSubmitting || readOnly} value={!!field.value} onChange={(value) => field.onChange(value)} />
                )}
              />
              <Controller
                name="pdrEditionOpenForReferentDepartment"
                control={control}
                render={({ field }) => (
                  <SimpleToggle label="Référents départementaux" disabled={isSubmitting || readOnly} value={!!field.value} onChange={(value) => field.onChange(value)} />
                )}
              />
              <Controller
                name="pdrEditionOpenForTransporter"
                control={control}
                render={({ field }) => <SimpleToggle label="Transporteurs" disabled={isSubmitting || readOnly} value={!!field.value} onChange={(value) => field.onChange(value)} />}
              />
            </div>
            <InformationsConvoyage disabled={isSubmitting || readOnly} control={control} />
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
                  <Controller
                    name="repartitionSchemaCreateAndEditGroupAvailability"
                    control={control}
                    render={({ field }) => (
                      <ToggleDate
                        label="Référents régionaux"
                        disabled={isSubmitting}
                        readOnly={readOnly}
                        value={!!field.value}
                        onChange={(value) => field.onChange(value)}
                        range={{
                          from: watch("uselessInformation.repartitionSchemaCreateAndEditGroupAvailabilityFrom") || undefined,
                          to: watch("uselessInformation.repartitionSchemaCreateAndEditGroupAvailabilityTo") || undefined,
                        }}
                        onChangeRange={(range) => {
                          setValue("uselessInformation.repartitionSchemaCreateAndEditGroupAvailabilityFrom", range.from, { shouldDirty: true });
                          setValue("uselessInformation.repartitionSchemaCreateAndEditGroupAvailabilityTo", range.to, { shouldDirty: true });
                        }}
                      />
                    )}
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
                  <Controller
                    name="schemaAccessForReferentRegion"
                    control={control}
                    render={({ field }) => (
                      <SimpleToggle label="Référents régionaux" disabled={isSubmitting || readOnly} value={!!field.value} onChange={(value) => field.onChange(value)} />
                    )}
                  />
                  <Controller
                    name="schemaAccessForReferentDepartment"
                    control={control}
                    render={({ field }) => (
                      <SimpleToggle label="Référents départementaux" disabled={isSubmitting || readOnly} value={!!field.value} onChange={(value) => field.onChange(value)} />
                    )}
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
              <Controller
                name="repartitionSchemaDownloadAvailability"
                control={control}
                render={({ field }) => (
                  <ToggleDate
                    label="Transporteur"
                    disabled={isSubmitting}
                    readOnly={readOnly}
                    value={!!field.value}
                    onChange={(value) => field.onChange(value)}
                    range={{
                      from: watch("uselessInformation.repartitionSchemaDownloadAvailabilityFrom") || undefined,
                      to: watch("uselessInformation.repartitionSchemaDownloadAvailabilityTo") || undefined,
                    }}
                    onChangeRange={(range) => {
                      setValue("uselessInformation.repartitionSchemaDownloadAvailabilityFrom", range.from, { shouldDirty: true });
                      setValue("uselessInformation.repartitionSchemaDownloadAvailabilityTo", range.to, { shouldDirty: true });
                    }}
                  />
                )}
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
              <Controller
                name="busEditionOpenForTransporter"
                control={control}
                render={({ field }) => <SimpleToggle label="Transporteurs" disabled={isSubmitting || readOnly} value={!!field.value} onChange={(value) => field.onChange(value)} />}
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
              <Controller
                name="isTransportPlanCorrectionRequestOpen"
                control={control}
                render={({ field }) => (
                  <ToggleDate
                    label="Référents régionaux"
                    disabled={isSubmitting}
                    readOnly={readOnly}
                    value={!!field.value}
                    onChange={(value) => field.onChange(value)}
                    range={{
                      from: watch("uselessInformation.isTransportPlanCorrectionRequestOpenFrom") || undefined,
                      to: watch("uselessInformation.isTransportPlanCorrectionRequestOpenTo") || undefined,
                    }}
                    onChangeRange={(range) => {
                      setValue("uselessInformation.isTransportPlanCorrectionRequestOpenFrom", range.from, { shouldDirty: true });
                      setValue("uselessInformation.isTransportPlanCorrectionRequestOpenTo", range.to, { shouldDirty: true });
                    }}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

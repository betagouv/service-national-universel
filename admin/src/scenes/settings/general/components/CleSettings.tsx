import React from "react";
import { HiOutlineExclamation } from "react-icons/hi";
import { Controller, useForm } from "react-hook-form";
import { Container, Button } from "@snu/ds/admin";
import { CohortDto } from "snu-lib";
import ToggleDate from "@/components/ui/forms/dateForm/ToggleDate";
import { useUpdateCohortCle } from "@/scenes/settings/general/hooks/useCohortUpdate";

export type SettingCleFormData = Pick<
  CohortDto,
  | "cleUpdateCohortForReferentRegion"
  | "cleUpdateCohortForReferentRegionDate"
  | "cleUpdateCohortForReferentDepartment"
  | "cleUpdateCohortForReferentDepartmentDate"
  | "cleDisplayCohortsForAdminCLE"
  | "cleDisplayCohortsForAdminCLEDate"
  | "cleDisplayCohortsForReferentClasse"
  | "cleDisplayCohortsForReferentClasseDate"
  | "cleUpdateCentersForReferentRegion"
  | "cleUpdateCentersForReferentRegionDate"
  | "cleUpdateCentersForReferentDepartment"
  | "cleUpdateCentersForReferentDepartmentDate"
  | "cleDisplayCentersForAdminCLE"
  | "cleDisplayCentersForAdminCLEDate"
  | "cleDisplayCentersForReferentClasse"
  | "cleDisplayCentersForReferentClasseDate"
  | "cleDisplayPDRForAdminCLE"
  | "cleDisplayPDRForAdminCLEDate"
  | "cleDisplayPDRForReferentClasse"
  | "cleDisplayPDRForReferentClasseDate"
>;

type CleSettingsProps = {
  cohort: CohortDto;
  readOnly: boolean;
};

export const CleSettings = ({ cohort, readOnly }: CleSettingsProps) => {
  const {
    control,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, dirtyFields },
    reset,
  } = useForm<SettingCleFormData>({
    defaultValues: {
      cleUpdateCohortForReferentRegion: cohort.cleUpdateCohortForReferentRegion,
      cleUpdateCohortForReferentRegionDate: {
        from: cohort.cleUpdateCohortForReferentRegionDate?.from,
        to: cohort.cleUpdateCohortForReferentRegionDate?.to,
      },
      cleUpdateCohortForReferentDepartment: cohort.cleUpdateCohortForReferentDepartment,
      cleUpdateCohortForReferentDepartmentDate: {
        from: cohort.cleUpdateCohortForReferentDepartmentDate?.from,
        to: cohort.cleUpdateCohortForReferentDepartmentDate?.to,
      },
      cleDisplayCohortsForAdminCLE: cohort.cleDisplayCohortsForAdminCLE,
      cleDisplayCohortsForAdminCLEDate: {
        from: cohort.cleDisplayCohortsForAdminCLEDate?.from,
        to: cohort.cleDisplayCohortsForAdminCLEDate?.to,
      },
      cleDisplayCohortsForReferentClasse: cohort.cleDisplayCohortsForReferentClasse,
      cleDisplayCohortsForReferentClasseDate: {
        from: cohort.cleDisplayCohortsForReferentClasseDate?.from,
        to: cohort.cleDisplayCohortsForReferentClasseDate?.to,
      },
      cleUpdateCentersForReferentRegion: cohort.cleUpdateCentersForReferentRegion,
      cleUpdateCentersForReferentRegionDate: {
        from: cohort.cleUpdateCentersForReferentRegionDate?.from,
        to: cohort.cleUpdateCentersForReferentRegionDate?.to,
      },
      cleUpdateCentersForReferentDepartment: cohort.cleUpdateCentersForReferentDepartment,
      cleUpdateCentersForReferentDepartmentDate: {
        from: cohort.cleUpdateCentersForReferentDepartmentDate?.from,
        to: cohort.cleUpdateCentersForReferentDepartmentDate?.to,
      },
      cleDisplayCentersForAdminCLE: cohort.cleDisplayCentersForAdminCLE,
      cleDisplayCentersForAdminCLEDate: {
        from: cohort.cleDisplayCentersForAdminCLEDate?.from,
        to: cohort.cleDisplayCentersForAdminCLEDate?.to,
      },
      cleDisplayCentersForReferentClasse: cohort.cleDisplayCentersForReferentClasse,
      cleDisplayCentersForReferentClasseDate: {
        from: cohort.cleDisplayCentersForReferentClasseDate?.from,
        to: cohort.cleDisplayCentersForReferentClasseDate?.to,
      },
      cleDisplayPDRForAdminCLE: cohort.cleDisplayPDRForAdminCLE,
      cleDisplayPDRForAdminCLEDate: {
        from: cohort.cleDisplayPDRForAdminCLEDate?.from,
        to: cohort.cleDisplayPDRForAdminCLEDate?.to,
      },
      cleDisplayPDRForReferentClasse: cohort.cleDisplayPDRForReferentClasse,
      cleDisplayPDRForReferentClasseDate: {
        from: cohort.cleDisplayPDRForReferentClasseDate?.from,
        to: cohort.cleDisplayPDRForReferentClasseDate?.to,
      },
    },
    mode: "onChange",
  });
  const isNotSaved = isDirty && !isSubmitting;
  const updateCohorteCleMutation = useUpdateCohortCle();

  const handleOnCancel = () => {
    reset();
  };

  const handleConfirmSubmit = (data: SettingCleFormData) => {
    if (!cohort._id) return;
    updateCohorteCleMutation.mutate({
      data,
      cohortId: cohort._id,
    });
    reset(data);
  };
  return (
    <Container title="Classes engagées">
      <div className="flex w-full">
        <div className="flex w-[45%] flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="text-xs  font-medium text-gray-900">Modification des cohortes </p>
            </div>
            <Controller
              name="cleUpdateCohortForReferentRegion"
              control={control}
              render={({ field }) => (
                <ToggleDate
                  label="Référents régionaux"
                  disabled={isSubmitting}
                  readOnly={readOnly}
                  value={!!field.value}
                  onChange={(value) => field.onChange(value)}
                  range={{
                    from: watch("cleUpdateCohortForReferentRegionDate.from") || null,
                    to: watch("cleUpdateCohortForReferentRegionDate.to") || null,
                  }}
                  onChangeRange={(range) => {
                    setValue(
                      "cleUpdateCohortForReferentRegionDate",
                      {
                        from: range.from ? new Date(range.from).toISOString() : null,
                        to: range.to ? new Date(range.to).toISOString() : null,
                      },
                      { shouldDirty: true },
                    );
                  }}
                />
              )}
            />
            <Controller
              name="cleUpdateCohortForReferentDepartment"
              control={control}
              render={({ field }) => (
                <ToggleDate
                  label="Référents départementaux"
                  disabled={isSubmitting}
                  readOnly={readOnly}
                  value={!!field.value}
                  onChange={(value) => field.onChange(value)}
                  range={{
                    from: watch("cleUpdateCohortForReferentDepartmentDate.from") || null,
                    to: watch("cleUpdateCohortForReferentDepartmentDate.to") || null,
                  }}
                  onChangeRange={(range) => {
                    setValue(
                      "cleUpdateCohortForReferentDepartmentDate",
                      {
                        from: range.from ? new Date(range.from).toISOString() : null,
                        to: range.to ? new Date(range.to).toISOString() : null,
                      },
                      { shouldDirty: true },
                    );
                  }}
                />
              )}
            />
          </div>
          <div className="mt-2 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="text-xs  font-medium text-gray-900">Affichage des cohortes </p>
            </div>
            <Controller
              name="cleDisplayCohortsForAdminCLE"
              control={control}
              render={({ field }) => (
                <ToggleDate
                  label="Admin CLE"
                  disabled={isSubmitting}
                  readOnly={readOnly}
                  value={!!field.value}
                  onChange={(value) => field.onChange(value)}
                  range={{
                    from: watch("cleDisplayCohortsForAdminCLEDate.from") || null,
                    to: watch("cleDisplayCohortsForAdminCLEDate.to") || null,
                  }}
                  onChangeRange={(range) => {
                    setValue(
                      "cleDisplayCohortsForAdminCLEDate",
                      {
                        from: range.from ? new Date(range.from).toISOString() : null,
                        to: range.to ? new Date(range.to).toISOString() : null,
                      },
                      { shouldDirty: true },
                    );
                  }}
                />
              )}
            />
            <Controller
              name="cleDisplayCohortsForReferentClasse"
              control={control}
              render={({ field }) => (
                <ToggleDate
                  label="Référents de classe"
                  disabled={isSubmitting}
                  readOnly={readOnly}
                  value={!!field.value}
                  onChange={(value) => field.onChange(value)}
                  range={{
                    from: watch("cleDisplayCohortsForReferentClasseDate.from") || null,
                    to: watch("cleDisplayCohortsForReferentClasseDate.to") || null,
                  }}
                  onChangeRange={(range) => {
                    setValue(
                      "cleDisplayCohortsForReferentClasseDate",
                      {
                        from: range.from ? new Date(range.from).toISOString() : null,
                        to: range.to ? new Date(range.to).toISOString() : null,
                      },
                      { shouldDirty: true },
                    );
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className="flex w-[10%] items-center justify-center">
          <div className="h-[90%] w-[1px] border-r-[1px] border-gray-200"></div>
        </div>
        <div className="flex w-[45%] flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <p className="text-xs  font-medium text-gray-900">Modification des centres </p>
              </div>
              <Controller
                name="cleUpdateCentersForReferentRegion"
                control={control}
                render={({ field }) => (
                  <ToggleDate
                    label="Référent régionaux"
                    disabled={isSubmitting}
                    readOnly={readOnly}
                    value={!!field.value}
                    onChange={(value) => field.onChange(value)}
                    range={{
                      from: watch("cleUpdateCentersForReferentRegionDate.from") || null,
                      to: watch("cleUpdateCentersForReferentRegionDate.to") || null,
                    }}
                    onChangeRange={(range) => {
                      setValue(
                        "cleUpdateCentersForReferentRegionDate",
                        {
                          from: range.from ? new Date(range.from).toISOString() : null,
                          to: range.to ? new Date(range.to).toISOString() : null,
                        },
                        { shouldDirty: true },
                      );
                    }}
                  />
                )}
              />
              <Controller
                name="cleUpdateCentersForReferentDepartment"
                control={control}
                render={({ field }) => (
                  <ToggleDate
                    label="Référents départementaux"
                    disabled={isSubmitting}
                    readOnly={readOnly}
                    value={!!field.value}
                    onChange={(value) => field.onChange(value)}
                    range={{
                      from: watch("cleUpdateCentersForReferentDepartmentDate.from") || null,
                      to: watch("cleUpdateCentersForReferentDepartmentDate.to") || null,
                    }}
                    onChangeRange={(range) => {
                      setValue(
                        "cleUpdateCentersForReferentDepartmentDate",
                        {
                          from: range.from ? new Date(range.from).toISOString() : null,
                          to: range.to ? new Date(range.to).toISOString() : null,
                        },
                        { shouldDirty: true },
                      );
                    }}
                  />
                )}
              />
            </div>
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <p className="text-xs  font-medium text-gray-900">Affichage des centres </p>
              </div>
              <Controller
                name="cleDisplayCentersForAdminCLE"
                control={control}
                render={({ field }) => (
                  <ToggleDate
                    label="Admin CLE"
                    disabled={isSubmitting}
                    readOnly={readOnly}
                    value={!!field.value}
                    onChange={(value) => field.onChange(value)}
                    range={{
                      from: watch("cleDisplayCentersForAdminCLEDate.from") || null,
                      to: watch("cleDisplayCentersForAdminCLEDate.to") || null,
                    }}
                    onChangeRange={(range) => {
                      setValue(
                        "cleDisplayCentersForAdminCLEDate",
                        {
                          from: range.from ? new Date(range.from).toISOString() : null,
                          to: range.to ? new Date(range.to).toISOString() : null,
                        },
                        { shouldDirty: true },
                      );
                    }}
                  />
                )}
              />
              <Controller
                name="cleDisplayCentersForReferentClasse"
                control={control}
                render={({ field }) => (
                  <ToggleDate
                    label="Référents de classe"
                    disabled={isSubmitting}
                    readOnly={readOnly}
                    value={!!field.value}
                    onChange={(value) => field.onChange(value)}
                    range={{
                      from: watch("cleDisplayCentersForReferentClasseDate.from") || null,
                      to: watch("cleDisplayCentersForReferentClasseDate.to") || null,
                    }}
                    onChangeRange={(range) => {
                      setValue(
                        "cleDisplayCentersForReferentClasseDate",
                        {
                          from: range.from ? new Date(range.from).toISOString() : null,
                          to: range.to ? new Date(range.to).toISOString() : null,
                        },
                        { shouldDirty: true },
                      );
                    }}
                  />
                )}
              />
            </div>
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <p className="text-xs  font-medium text-gray-900">Affichage des points de rassemblement </p>
              </div>
              <Controller
                name="cleDisplayPDRForAdminCLE"
                control={control}
                render={({ field }) => (
                  <ToggleDate
                    label="Admin CLE"
                    disabled={isSubmitting}
                    readOnly={readOnly}
                    value={!!field.value}
                    onChange={(value) => field.onChange(value)}
                    range={{
                      from: watch("cleDisplayPDRForAdminCLEDate.from") || null,
                      to: watch("cleDisplayPDRForAdminCLEDate.to") || null,
                    }}
                    onChangeRange={(range) => {
                      setValue(
                        "cleDisplayPDRForAdminCLEDate",
                        {
                          from: range.from ? new Date(range.from).toISOString() : null,
                          to: range.to ? new Date(range.to).toISOString() : null,
                        },
                        { shouldDirty: true },
                      );
                    }}
                  />
                )}
              />
              <Controller
                name="cleDisplayPDRForReferentClasse"
                control={control}
                render={({ field }) => (
                  <ToggleDate
                    label="Référents de classe"
                    disabled={isSubmitting}
                    readOnly={readOnly}
                    value={!!field.value}
                    onChange={(value) => field.onChange(value)}
                    range={{
                      from: watch("cleDisplayPDRForReferentClasseDate.from") || null,
                      to: watch("cleDisplayPDRForReferentClasseDate.to") || null,
                    }}
                    onChangeRange={(range) => {
                      setValue(
                        "cleDisplayPDRForReferentClasseDate",
                        {
                          from: range.from ? new Date(range.from).toISOString() : null,
                          to: range.to ? new Date(range.to).toISOString() : null,
                        },
                        { shouldDirty: true },
                      );
                    }}
                  />
                )}
              />
            </div>
          </div>
          <hr className="border-t border-gray-200" />
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
        </div>
      </div>
    </Container>
  );
};

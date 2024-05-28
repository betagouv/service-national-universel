import SimpleToggle from "@/components/ui/forms/dateForm/SimpleToggle";
import React from "react";
import { Container } from "@snu/ds/admin";
import { CohortDto } from "snu-lib/src/dto";
import ToggleDate from "@/components/ui/forms/dateForm/ToggleDate";

type CleSettingsData = Partial<CohortDto>;

type CleSettingsProps = {
  cleSettingsData?: CleSettingsData;
  isLoading: boolean;
  readOnly: boolean;
  handleChange: (data: CleSettingsData) => void;
};

export const CleSettings = ({ cleSettingsData, isLoading, readOnly, handleChange }: CleSettingsProps) => {
  const onChange = (data: Partial<CleSettingsData>) => {
    handleChange({ ...cleSettingsData, ...data });
  };

  return (
    <Container title="Classes engagées">
      <div className="flex w-full">
        <div className="flex w-[45%] flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="text-xs  font-medium text-gray-900">Modification des cohortes </p>
            </div>
            <ToggleDate
              label="Référents régionaux"
              disabled={isLoading}
              readOnly={readOnly}
              value={!!cleSettingsData?.cleUpdateCohortForReferentRegion}
              onChange={() => onChange({ cleUpdateCohortForReferentRegion: !cleSettingsData?.cleUpdateCohortForReferentRegion })}
              range={{
                from: cleSettingsData?.cleUpdateCohortForReferentRegionDate?.from?.toString() || null,
                to: cleSettingsData?.cleUpdateCohortForReferentRegionDate?.to?.toString() || null,
              }}
              onChangeRange={(range) => {
                handleChange({
                  cleUpdateCohortForReferentRegionDate: {
                    from: range.from ? new Date(range.from) : null,
                    to: range.to ? new Date(range.to) : null,
                  },
                });
              }}
            />
            <ToggleDate
              label="Référents départementaux"
              disabled={isLoading}
              readOnly={readOnly}
              value={!!cleSettingsData?.cleUpdateCohortForReferentDepartment}
              onChange={() => onChange({ cleUpdateCohortForReferentDepartment: !cleSettingsData?.cleUpdateCohortForReferentDepartment })}
              range={{
                from: cleSettingsData?.cleUpdateCohortForReferentDepartmentDate?.from?.toString() || null,
                to: cleSettingsData?.cleUpdateCohortForReferentDepartmentDate?.to?.toString() || null,
              }}
              onChangeRange={(range) => {
                handleChange({
                  cleUpdateCohortForReferentDepartmentDate: {
                    from: range.from ? new Date(range.from) : null,
                    to: range.to ? new Date(range.to) : null,
                  },
                });
              }}
            />
          </div>
          <div className="mt-2 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="text-xs  font-medium text-gray-900">Affichage des cohortes </p>
            </div>
            <ToggleDate
              label="Admin CLE"
              disabled={isLoading}
              readOnly={readOnly}
              value={!!cleSettingsData?.cleDisplayCohortsForAdminCLE}
              onChange={() => onChange({ cleDisplayCohortsForAdminCLE: !cleSettingsData?.cleDisplayCohortsForAdminCLE })}
              range={{
                from: cleSettingsData?.cleDisplayCohortsForAdminCLEDate?.from?.toString() || null,
                to: cleSettingsData?.cleDisplayCohortsForAdminCLEDate?.to?.toString() || null,
              }}
              onChangeRange={(range) => {
                handleChange({
                  cleDisplayCohortsForAdminCLEDate: {
                    from: range.from ? new Date(range.from) : null,
                    to: range.to ? new Date(range.to) : null,
                  },
                });
              }}
            />
            <ToggleDate
              label="Référents de classe"
              disabled={isLoading}
              readOnly={readOnly}
              value={!!cleSettingsData?.cleDisplayCohortsForReferentClasse}
              onChange={() => onChange({ cleDisplayCohortsForReferentClasse: !cleSettingsData?.cleDisplayCohortsForReferentClasse })}
              range={{
                from: cleSettingsData?.cleDisplayCohortsForReferentClasseDate?.from?.toString() || null,
                to: cleSettingsData?.cleDisplayCohortsForReferentClasseDate?.to?.toString() || null,
              }}
              onChangeRange={(range) => {
                handleChange({
                  cleDisplayCohortsForReferentClasseDate: {
                    from: range.from ? new Date(range.from) : null,
                    to: range.to ? new Date(range.to) : null,
                  },
                });
              }}
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
              <ToggleDate
                label="Référent régionaux"
                disabled={isLoading}
                readOnly={readOnly}
                value={!!cleSettingsData?.cleUpdateCentersForReferentRegion}
                onChange={() => onChange({ cleUpdateCentersForReferentRegion: !cleSettingsData?.cleUpdateCentersForReferentRegion })}
                range={{
                  from: cleSettingsData?.cleUpdateCentersForReferentRegionDate?.from?.toString() || null,
                  to: cleSettingsData?.cleUpdateCentersForReferentRegionDate?.to?.toString() || null,
                }}
                onChangeRange={(range) => {
                  handleChange({
                    cleUpdateCentersForReferentRegionDate: {
                      from: range.from ? new Date(range.from) : null,
                      to: range.to ? new Date(range.to) : null,
                    },
                  });
                }}
              />
              <ToggleDate
                label="Référent départementaux"
                disabled={isLoading}
                readOnly={readOnly}
                value={!!cleSettingsData?.cleUpdateCentersForReferentDepartment}
                onChange={() => onChange({ cleUpdateCentersForReferentDepartment: !cleSettingsData?.cleUpdateCentersForReferentDepartment })}
                range={{
                  from: cleSettingsData?.cleUpdateCentersForReferentDepartmentDate?.from?.toString() || null,
                  to: cleSettingsData?.cleUpdateCentersForReferentDepartmentDate?.to?.toString() || null,
                }}
                onChangeRange={(range) => {
                  handleChange({
                    cleUpdateCentersForReferentDepartmentDate: {
                      from: range.from ? new Date(range.from) : null,
                      to: range.to ? new Date(range.to) : null,
                    },
                  });
                }}
              />
            </div>
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <p className="text-xs  font-medium text-gray-900">Affichage des centres </p>
              </div>
              <ToggleDate
                label="Admin CLE"
                disabled={isLoading}
                readOnly={readOnly}
                value={!!cleSettingsData?.cleDisplayCentersForAdminCLE}
                onChange={() => onChange({ cleDisplayCentersForAdminCLE: !cleSettingsData?.cleDisplayCentersForAdminCLE })}
                range={{
                  from: cleSettingsData?.cleDisplayCentersForAdminCLEDate?.from?.toString() || null,
                  to: cleSettingsData?.cleDisplayCentersForAdminCLEDate?.to?.toString() || null,
                }}
                onChangeRange={(range) => {
                  handleChange({
                    cleDisplayCentersForAdminCLEDate: {
                      from: range.from ? new Date(range.from) : null,
                      to: range.to ? new Date(range.to) : null,
                    },
                  });
                }}
              />
              <ToggleDate
                label="Référents de classe"
                disabled={isLoading}
                readOnly={readOnly}
                value={!!cleSettingsData?.cleDisplayCentersForReferentClasse}
                onChange={() => onChange({ cleDisplayCentersForReferentClasse: !cleSettingsData?.cleDisplayCentersForReferentClasse })}
                range={{
                  from: cleSettingsData?.cleDisplayCentersForReferentClasseDate?.from?.toString() || null,
                  to: cleSettingsData?.cleDisplayCentersForReferentClasseDate?.to?.toString() || null,
                }}
                onChangeRange={(range) => {
                  handleChange({
                    cleDisplayCentersForReferentClasseDate: {
                      from: range.from ? new Date(range.from) : null,
                      to: range.to ? new Date(range.to) : null,
                    },
                  });
                }}
              />
            </div>
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <p className="text-xs  font-medium text-gray-900">Affichage des points de rassemblement </p>
              </div>
              <ToggleDate
                label="Admin CLE"
                disabled={isLoading}
                readOnly={readOnly}
                value={!!cleSettingsData?.cleDisplayPDRForAdminCLE}
                onChange={() => onChange({ cleDisplayPDRForAdminCLE: !cleSettingsData?.cleDisplayPDRForAdminCLE })}
                range={{
                  from: cleSettingsData?.cleDisplayPDRForAdminCLEDate?.from?.toString() || null,
                  to: cleSettingsData?.cleDisplayPDRForAdminCLEDate?.to?.toString() || null,
                }}
                onChangeRange={(range) => {
                  handleChange({
                    cleDisplayPDRForAdminCLEDate: {
                      from: range.from ? new Date(range.from) : null,
                      to: range.to ? new Date(range.to) : null,
                    },
                  });
                }}
              />
              <ToggleDate
                label="Référents de classe"
                disabled={isLoading}
                readOnly={readOnly}
                value={!!cleSettingsData?.cleDisplayPDRForReferentClasse}
                onChange={() => onChange({ cleDisplayPDRForReferentClasse: !cleSettingsData?.cleDisplayPDRForReferentClasse })}
                range={{
                  from: cleSettingsData?.cleDisplayPDRForReferentClasseDate?.from?.toString() || null,
                  to: cleSettingsData?.cleDisplayPDRForReferentClasseDate?.to?.toString() || null,
                }}
                onChangeRange={(range) => {
                  handleChange({
                    cleDisplayPDRForReferentClasseDate: {
                      from: range.from ? new Date(range.from) : null,
                      to: range.to ? new Date(range.to) : null,
                    },
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

import React from "react";
import { Container } from "@snu/ds/admin";
import { CohortDto } from "snu-lib/src/dto";
import ToggleDate from "@/components/ui/forms/dateForm/ToggleDate";

type CleSettingsData = Partial<CohortDto>;

type CleSettingsProps = {
  cleSettingsData?: CleSettingsData;
  isLoading: boolean;
  readOnly: boolean;
  onChange: (data: CleSettingsData) => void;
};

export const CleSettings = ({ cleSettingsData, isLoading, readOnly, onChange }: CleSettingsProps) => {
  const handleChange = (data: Partial<CleSettingsData>) => {
    onChange({ ...cleSettingsData, ...data });
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
              onChange={() => handleChange({ cleUpdateCohortForReferentRegion: !cleSettingsData?.cleUpdateCohortForReferentRegion })}
              range={{
                from: cleSettingsData?.cleUpdateCohortForReferentRegionDate?.from || null,
                to: cleSettingsData?.cleUpdateCohortForReferentRegionDate?.to || null,
              }}
              onChangeRange={(range) => {
                handleChange({
                  cleUpdateCohortForReferentRegionDate: {
                    from: range.from ? new Date(range.from).toISOString() : null,
                    to: range.to ? new Date(range.to).toISOString() : null,
                  },
                });
              }}
            />
            <ToggleDate
              label="Référents départementaux"
              disabled={isLoading}
              readOnly={readOnly}
              value={!!cleSettingsData?.cleUpdateCohortForReferentDepartment}
              onChange={() => handleChange({ cleUpdateCohortForReferentDepartment: !cleSettingsData?.cleUpdateCohortForReferentDepartment })}
              range={{
                from: cleSettingsData?.cleUpdateCohortForReferentDepartmentDate?.from || null,
                to: cleSettingsData?.cleUpdateCohortForReferentDepartmentDate?.to || null,
              }}
              onChangeRange={(range) => {
                handleChange({
                  cleUpdateCohortForReferentDepartmentDate: {
                    from: range.from ? new Date(range.from).toISOString() : null,
                    to: range.to ? new Date(range.to).toISOString() : null,
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
              onChange={() => handleChange({ cleDisplayCohortsForAdminCLE: !cleSettingsData?.cleDisplayCohortsForAdminCLE })}
              range={{
                from: cleSettingsData?.cleDisplayCohortsForAdminCLEDate?.from || null,
                to: cleSettingsData?.cleDisplayCohortsForAdminCLEDate?.to || null,
              }}
              onChangeRange={(range) => {
                handleChange({
                  cleDisplayCohortsForAdminCLEDate: {
                    from: range.from ? new Date(range.from).toISOString() : null,
                    to: range.to ? new Date(range.to).toISOString() : null,
                  },
                });
              }}
            />
            <ToggleDate
              label="Référents de classe"
              disabled={isLoading}
              readOnly={readOnly}
              value={!!cleSettingsData?.cleDisplayCohortsForReferentClasse}
              onChange={() => handleChange({ cleDisplayCohortsForReferentClasse: !cleSettingsData?.cleDisplayCohortsForReferentClasse })}
              range={{
                from: cleSettingsData?.cleDisplayCohortsForReferentClasseDate?.from || null,
                to: cleSettingsData?.cleDisplayCohortsForReferentClasseDate?.to || null,
              }}
              onChangeRange={(range) => {
                handleChange({
                  cleDisplayCohortsForReferentClasseDate: {
                    from: range.from ? new Date(range.from).toISOString() : null,
                    to: range.to ? new Date(range.to).toISOString() : null,
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
                onChange={() => handleChange({ cleUpdateCentersForReferentRegion: !cleSettingsData?.cleUpdateCentersForReferentRegion })}
                range={{
                  from: cleSettingsData?.cleUpdateCentersForReferentRegionDate?.from || null,
                  to: cleSettingsData?.cleUpdateCentersForReferentRegionDate?.to || null,
                }}
                onChangeRange={(range) => {
                  handleChange({
                    cleUpdateCentersForReferentRegionDate: {
                      from: range.from ? new Date(range.from).toISOString() : null,
                      to: range.to ? new Date(range.to).toISOString() : null,
                    },
                  });
                }}
              />
              <ToggleDate
                label="Référent départementaux"
                disabled={isLoading}
                readOnly={readOnly}
                value={!!cleSettingsData?.cleUpdateCentersForReferentDepartment}
                onChange={() => handleChange({ cleUpdateCentersForReferentDepartment: !cleSettingsData?.cleUpdateCentersForReferentDepartment })}
                range={{
                  from: cleSettingsData?.cleUpdateCentersForReferentDepartmentDate?.from || null,
                  to: cleSettingsData?.cleUpdateCentersForReferentDepartmentDate?.to || null,
                }}
                onChangeRange={(range) => {
                  handleChange({
                    cleUpdateCentersForReferentDepartmentDate: {
                      from: range.from ? new Date(range.from).toISOString() : null,
                      to: range.to ? new Date(range.to).toISOString() : null,
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
                onChange={() => handleChange({ cleDisplayCentersForAdminCLE: !cleSettingsData?.cleDisplayCentersForAdminCLE })}
                range={{
                  from: cleSettingsData?.cleDisplayCentersForAdminCLEDate?.from || null,
                  to: cleSettingsData?.cleDisplayCentersForAdminCLEDate?.to || null,
                }}
                onChangeRange={(range) => {
                  handleChange({
                    cleDisplayCentersForAdminCLEDate: {
                      from: range.from ? new Date(range.from).toISOString() : null,
                      to: range.to ? new Date(range.to).toISOString() : null,
                    },
                  });
                }}
              />
              <ToggleDate
                label="Référents de classe"
                disabled={isLoading}
                readOnly={readOnly}
                value={!!cleSettingsData?.cleDisplayCentersForReferentClasse}
                onChange={() => handleChange({ cleDisplayCentersForReferentClasse: !cleSettingsData?.cleDisplayCentersForReferentClasse })}
                range={{
                  from: cleSettingsData?.cleDisplayCentersForReferentClasseDate?.from || null,
                  to: cleSettingsData?.cleDisplayCentersForReferentClasseDate?.to || null,
                }}
                onChangeRange={(range) => {
                  handleChange({
                    cleDisplayCentersForReferentClasseDate: {
                      from: range.from ? new Date(range.from).toISOString() : null,
                      to: range.to ? new Date(range.to).toISOString() : null,
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
                onChange={() => handleChange({ cleDisplayPDRForAdminCLE: !cleSettingsData?.cleDisplayPDRForAdminCLE })}
                range={{
                  from: cleSettingsData?.cleDisplayPDRForAdminCLEDate?.from || null,
                  to: cleSettingsData?.cleDisplayPDRForAdminCLEDate?.to || null,
                }}
                onChangeRange={(range) => {
                  handleChange({
                    cleDisplayPDRForAdminCLEDate: {
                      from: range.from ? new Date(range.from).toISOString() : null,
                      to: range.to ? new Date(range.to).toISOString() : null,
                    },
                  });
                }}
              />
              <ToggleDate
                label="Référents de classe"
                disabled={isLoading}
                readOnly={readOnly}
                value={!!cleSettingsData?.cleDisplayPDRForReferentClasse}
                onChange={() => handleChange({ cleDisplayPDRForReferentClasse: !cleSettingsData?.cleDisplayPDRForReferentClasse })}
                range={{
                  from: cleSettingsData?.cleDisplayPDRForReferentClasseDate?.from || null,
                  to: cleSettingsData?.cleDisplayPDRForReferentClasseDate?.to || null,
                }}
                onChangeRange={(range) => {
                  handleChange({
                    cleDisplayPDRForReferentClasseDate: {
                      from: range.from ? new Date(range.from).toISOString() : null,
                      to: range.to ? new Date(range.to).toISOString() : null,
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

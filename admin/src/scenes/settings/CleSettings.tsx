import SimpleToggle from "@/components/ui/forms/dateForm/SimpleToggle";
import React from "react";
import { Container } from "@snu/ds/admin";
import { CohortDto } from "snu-lib/src/dto";

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
            <SimpleToggle
              label="Référent régionaux"
              disabled={isLoading || readOnly}
              value={cleSettingsData?.cleUpdateCohortForReferentRegion}
              onChange={() =>
                onChange({
                  cleUpdateCohortForReferentRegion: !cleSettingsData?.cleUpdateCohortForReferentRegion,
                })
              }
            />
          </div>
          <div className="mt-2 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="text-xs  font-medium text-gray-900">Affichage des cohortes </p>
            </div>
            <SimpleToggle
              label="Admin CLE"
              disabled={isLoading || readOnly}
              value={cleSettingsData?.cleDisplayCohortsForAdminCLE}
              onChange={() =>
                onChange({
                  cleDisplayCohortsForAdminCLE: !cleSettingsData?.cleDisplayCohortsForAdminCLE,
                })
              }
            />
            <SimpleToggle
              label="Référents de classe"
              disabled={isLoading || readOnly}
              value={cleSettingsData?.cleDisplayCohortsForReferentClasse}
              onChange={() =>
                onChange({
                  cleDisplayCohortsForReferentClasse: !cleSettingsData?.cleDisplayCohortsForReferentClasse,
                })
              }
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
              <SimpleToggle
                label="Référent régionaux"
                disabled={isLoading || readOnly}
                value={cleSettingsData?.cleUpdateCentersForReferentRegion}
                onChange={() =>
                  onChange({
                    cleUpdateCentersForReferentRegion: !cleSettingsData?.cleUpdateCentersForReferentRegion,
                  })
                }
              />
            </div>
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <p className="text-xs  font-medium text-gray-900">Affichage des centres </p>
              </div>
              <SimpleToggle
                label="Admin CLE"
                disabled={isLoading || readOnly}
                value={cleSettingsData?.cleDisplayCentersForAdminCLE}
                onChange={() =>
                  onChange({
                    cleDisplayCentersForAdminCLE: !cleSettingsData?.cleDisplayCentersForAdminCLE,
                  })
                }
              />
              <SimpleToggle
                label="Référents de classe"
                disabled={isLoading || readOnly}
                value={cleSettingsData?.cleDisplayCentersForReferentClasse}
                onChange={() =>
                  onChange({
                    cleDisplayCentersForReferentClasse: !cleSettingsData?.cleDisplayCentersForReferentClasse,
                  })
                }
              />
            </div>
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <p className="text-xs  font-medium text-gray-900">Affichage des points de rassemblement </p>
              </div>
              <SimpleToggle
                label="Admin CLE"
                disabled={isLoading || readOnly}
                value={cleSettingsData?.cleDisplayPDRForAdminCLE}
                onChange={() =>
                  onChange({
                    cleDisplayPDRForAdminCLE: !cleSettingsData?.cleDisplayPDRForAdminCLE,
                  })
                }
              />
              <SimpleToggle
                label="Référents de classe"
                disabled={isLoading || readOnly}
                value={cleSettingsData?.cleDisplayPDRForReferentClasse}
                onChange={() =>
                  onChange({
                    cleDisplayPDRForReferentClasse: !cleSettingsData?.cleDisplayPDRForReferentClasse,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

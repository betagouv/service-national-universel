import React from "react";
import { Badge, Tooltip } from "@snu/ds/admin";
import { CampagneEnvoi, EnvoiCampagneStatut, formatDateFRTimezoneUTC, formatLongDateFR } from "snu-lib";

interface CampagneEnvoiStatusProps {
  envois?: CampagneEnvoi[];
  campagneId?: string;
}

export const CampagneEnvoiStatus = ({ envois, campagneId }: CampagneEnvoiStatusProps) => {
  const completedEnvois = envois?.filter((envoi) => envoi.statut === EnvoiCampagneStatut.TERMINE) || [];
  const sortedEnvois = [...completedEnvois].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstEnvoi = sortedEnvois[0];
  const remainingEnvois = sortedEnvois.slice(1);

  return (
    <div className="flex-1">
      <div className="flex-1 flex flex-row gap-4">
        <div>{firstEnvoi && <Badge title={`Envoyée le ${formatDateFRTimezoneUTC(firstEnvoi.date)}`} status={"VALIDATED"} />}</div>
        <div>
          {remainingEnvois.length > 0 && (
            <div className="text-sm text-gray-500">
              <span>{remainingEnvois.length} relances</span>
              <div className="flex items-center gap-1">
                {remainingEnvois.map((envoi, index, array) => (
                  <React.Fragment key={`${campagneId ?? "id"}-${envoi.date}`}>
                    <span>
                      <Tooltip id={`id-envoi-campagne-${campagneId}-${index}`} title={`Envoyée le ${formatLongDateFR(envoi.date)}`}>
                        {formatDateFRTimezoneUTC(envoi.date)}
                      </Tooltip>
                    </span>
                    {index < array.length - 1 && <span>•</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from "react";

import { Label } from "@snu/ds/admin";
import { translate } from "snu-lib";
import { COHORTS_WITH_JDM_COUNT, formatDateFR } from "@/utils";

// Consultation seule : le pointage (présence à l'arrivée, JDM, départ anticipé) a été supprimé.
const Phase1PresenceFormBlock = ({ young = null, values = null }) => {
  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
        <Label title="Présence" name="presence" />
        <div className="mb-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
          <p>
            <span className="text-gray-500">À l'arrivée : </span>
            {translate(values.cohesionStayPresence)}
          </p>
          {COHORTS_WITH_JDM_COUNT.includes(young?.cohort) && (
            <p>
              <span className="text-gray-500">JDM : </span>
              {translate(values.presenceJDM)}
            </p>
          )}
        </div>
      </div>
      {values.departSejourAt && (
        <div className="mb-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
          <p>
            <span className="text-gray-500">Départ le : </span>
            {formatDateFR(values.departSejourAt)}
          </p>
          <p>
            <span className="text-gray-500">Motif : </span>
            {young.departSejourMotif}
          </p>
          {young.departSejourMotifComment && (
            <p>
              <span className="text-gray-500">Commentaire : </span>
              {young.departSejourMotifComment}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Phase1PresenceFormBlock;

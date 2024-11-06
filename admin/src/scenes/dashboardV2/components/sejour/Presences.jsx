import React from "react";
import FullDoughnut from "../graphs/FullDoughnut";
import OccupationBarVertical from "./OccupationBarVertical";
import { getNewLink } from "../../../../utils";
import queryString from "query-string";
import { ROLES, COHORTS_WITH_JDM_COUNT } from "snu-lib";

export default function Presences({ presence, JDM, depart, departTotal, departMotif, filter, role, sessionId, centerId, cohortHeadCenter = null }) {
  const departPercentage = departTotal ? depart?.true / departTotal : 0;
  const base = role === ROLES.HEAD_CENTER ? `/centre/${centerId}/${sessionId}/tableau-de-pointage` : "/volontaire";
  return (
    <div className="flex flex-col gap-10 rounded-lg bg-white px-6 pt-8 pb-16 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
      <p className="text-base font-bold leading-5 text-gray-900">La présence en chiffres</p>
      <div className="flex justify-evenly">
        <FullDoughnut
          title="Présence à l'arrivée"
          legendSide="bottom"
          labels={["Oui", "Non", "Non renseigné"]}
          values={[presence?.true || 0, presence?.false || 0, presence?.NR || 0]}
          maxLegends={3}
          tooltipsPercent={true}
          legendUrls={[
            getNewLink({ base: base, filter, filtersUrl: [queryString.stringify({ cohesionStayPresence: "true" })] }, "session"),
            getNewLink({ base: base, filter, filtersUrl: [queryString.stringify({ cohesionStayPresence: "false" })] }, "session"),
            getNewLink({ base: base, filter, filtersUrl: [queryString.stringify({ cohesionStayPresence: "N/A" })] }, "session"),
          ]}
        />
        {COHORTS_WITH_JDM_COUNT.includes(cohortHeadCenter) ||
          (cohortHeadCenter === null && (
            <>
              <div className="flex items-center justify-center">
                <div className="h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
              </div>
              <FullDoughnut
                title="Présence à la JDM"
                legendSide="bottom"
                labels={["Oui", "Non", "Non renseigné"]}
                values={[JDM?.true || 0, JDM?.false || 0, JDM?.NR || 0]}
                maxLegends={3}
                tooltipsPercent={true}
                legendUrls={[
                  getNewLink({ base: base, filter, filtersUrl: [queryString.stringify({ presenceJDM: "true" })] }, "session"),
                  getNewLink({ base: base, filter, filtersUrl: [queryString.stringify({ presenceJDM: "false" })] }, "session"),
                  getNewLink({ base: base, filter, filtersUrl: [queryString.stringify({ presenceJDM: "N/A" })] }, "session"),
                ]}
              />
            </>
          ))}
        <div className="flex items-center justify-center">
          <div className="h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
        </div>
        <OccupationBarVertical
          percentage={departPercentage}
          nbDepart={depart?.true}
          departMotif={departMotif}
          filter={filter}
          role={role}
          sessionId={sessionId}
          centerId={centerId}
        />
      </div>
    </div>
  );
}

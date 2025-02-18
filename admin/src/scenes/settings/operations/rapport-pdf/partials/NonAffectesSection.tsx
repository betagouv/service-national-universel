import React, { Fragment } from "react";
import { AffectationRoutes } from "snu-lib";

export default function DetailNonAffectes({ analytics }: { analytics: AffectationRoutes["GetSimulationAnalytics"]["response"] }) {
  return (
    <section className="break-after-page p-8">
      <h2 className="text-xl mb-8">Informations concernant les non affectés :</h2>
      <ul className="mb-2">
        <li>
          {analytics.summary.find((line) => line.includes("jeunes probablement hors zones"))}
          <div className="ml-4">{analytics.summary.find((line) => line.includes("départements hors zones"))}</div>
        </li>
        <li>{analytics.summary.find((line) => line.includes("pas de ligne disponible"))}</li>
        <li>{analytics.summary.find((line) => line.includes("pas de centre disponible"))}</li>
        <li>{analytics.summary.find((line) => line.includes("problèmes de places"))}</li>
      </ul>
      {analytics.jeunesProblemeDePlaces?.map((jeune) => (
        <Fragment key={jeune.id}>
          <div className="ml-8">
            {jeune.id} - {jeune.departement} :
          </div>
          <div className="ml-12 mb-2">{jeune.detail}</div>
        </Fragment>
      ))}
    </section>
  );
}

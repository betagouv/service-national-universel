import { Plot } from "@snu/ds";
import React from "react";
import { AffectationRoutes, formatStringLongDate } from "snu-lib";

export default function SummarySection({ analytics }: { analytics: AffectationRoutes["GetSimulationAnalytics"]["response"] }) {
  const iterationCostList = analytics.iterationCostList || [analytics.selectedCost];
  return (
    <section className="break-after-page p-8">
      <h1 className="text-3xl font-bold text-center mb-4">Rapport d'affectations aléatoires</h1>
      <p className="text-xl text-center mb-16">{formatStringLongDate(analytics?.createdAt)}</p>
      <div className="mb-2">Statuts des jeunes :</div>
      <ul className="ml-4 mb-4">
        <li>Affectés : {analytics?.jeunesNouvellementAffected}</li>
        <li>En attente d'affectation : {analytics?.jeuneAttenteAffectation}</li>
      </ul>
      <p className="mb-4">Itérations : </p>
      <div className="flex justify-center">
        <Plot xLabel="Itérations" yLabel="Erreur" selected={analytics.selectedCost} points={iterationCostList.map((cout, index) => ({ x: index, y: cout }))} />
      </div>
    </section>
  );
}

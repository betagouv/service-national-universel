import React from "react";

import { AffectationRoutes } from "snu-lib";
import { GRAPH_COLORS, Sunburst } from "@snu/ds";

type valueof<T> = T[keyof T];
type Centre = valueof<AffectationRoutes["GetSimulationAnalytics"]["response"]["regions"]>[0];

export default function DetailLigneDeBus({ centre }: { centre: Centre }) {
  if (centre.lignesDeBus.length === 0) {
    return "Le centre n'a pas de ligne de bus associée.";
  }
  return (
    <div>
      <h2 className="text-lg mb-6">Détail remplissage de(s) ligne(s) :</h2>
      <div className="flex gap-2">
        {centre.lignesDeBus.map((ligne) => (
          <div key={ligne.numeroLigne} className="flex flex-col items-center">
            <label>{ligne.numeroLigne}</label>
            <Sunburst
              width={250}
              height={200}
              data={{
                name: ligne.numeroLigne,
                children: [
                  {
                    color: ligne.placesOccupees === 0 ? "red" : GRAPH_COLORS.red,
                    textColor: "white",
                    label: String(ligne.placesRestances),
                    name: "Restantes",
                    children: [
                      {
                        label: String(ligne.nonAffectesMemeDepartement),
                        name: String(ligne.nonAffectesMemeDepartement),
                        value: ligne.placesRestances || 0,
                        color: ligne.nonAffectesMemeDepartement > 0 ? GRAPH_COLORS.red3 : GRAPH_COLORS.green3,
                        textColor: ligne.nonAffectesMemeDepartement > 0 ? GRAPH_COLORS.red : "black",
                      },
                    ],
                  },
                  {
                    color: GRAPH_COLORS.green,
                    name: "Prises",
                    label: String(ligne.placesOccupees),
                    value: ligne.placesOccupees || 0,
                  },
                ],
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

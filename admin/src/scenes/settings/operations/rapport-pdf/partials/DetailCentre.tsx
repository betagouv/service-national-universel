import React from "react";

import { AffectationRoutes } from "snu-lib";
import { Pie, Sunburst, GRAPH_COLORS } from "@snu/ds";

type valueof<T> = T[keyof T];
type Centre = valueof<AffectationRoutes["GetSimulationAnalytics"]["response"]["regions"]>[0];

export default function DetailCentre({ centre }: { centre: Centre }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">
        {centre.nom} : {centre.departement} {centre.ville} {centre.codePostal}
      </h2>
      {!centre.placesTotal && "Le centre n'a pas de places définies"}
      <div className="flex flex-col items-center">
        {!!centre.placesTotal && (
          <div className="flex">
            {!!centre.placesTotal && (
              <Pie
                width={290}
                height={200}
                isPourcent
                data={[
                  {
                    color: centre.placesOccupees === 0 ? "red" : GRAPH_COLORS.red,
                    label: "Restantes",
                    value: (centre.placesRestantes || 0) / centre.placesTotal,
                  },
                  {
                    color: GRAPH_COLORS.green,
                    label: "Prises",
                    value: (centre.placesOccupees || 0) / centre.placesTotal,
                  },
                ]}
              />
            )}
            {centre.tauxGarcon !== null && centre.tauxFille !== null && (
              <Pie
                width={320}
                height={200}
                isPourcent
                data={[
                  {
                    color: centre.placesOccupees === 0 ? "red" : GRAPH_COLORS.green2,
                    label: "Garçon",
                    value: centre.tauxGarcon,
                  },
                  {
                    color: centre.placesOccupees === 0 ? "red" : GRAPH_COLORS.red2,
                    label: "Filles",
                    value: centre.tauxFille,
                  },
                ]}
              />
            )}
            {centre.tauxQVP !== null && (
              <Pie
                width={290}
                height={200}
                isPourcent
                data={[
                  {
                    color: centre.placesOccupees === 0 ? "red" : GRAPH_COLORS.green2,
                    label: "QVP+",
                    value: centre.tauxQVP,
                  },
                  {
                    color: centre.placesOccupees === 0 ? "red" : GRAPH_COLORS.red2,
                    label: "QVP-",
                    value: 1 - centre.tauxQVP,
                  },
                ]}
              />
            )}
            {centre.tauxPSH !== null && (
              <Pie
                width={290}
                height={200}
                isPourcent
                data={[
                  {
                    color: centre.placesOccupees === 0 ? "red" : GRAPH_COLORS.green2,
                    label: "PSH+",
                    value: centre.tauxPSH,
                  },
                  {
                    color: centre.placesOccupees === 0 ? "red" : GRAPH_COLORS.red2,
                    label: "PSH-",
                    value: 1 - centre.tauxPSH,
                  },
                ]}
              />
            )}
          </div>
        )}
      </div>
      {!!centre.placesTotal && (
        <>
          <h3 className="text-lg mb-6">Détail remplissage du centre : </h3>
          <div className="flex flex-col items-center">
            <div>{centre.id}</div>
            <Sunburst
              width={500}
              height={500}
              data={{
                name: centre.id,
                children: [
                  {
                    name: "Restantes",
                    value: centre.placesRestantes || 0,
                    color: centre.placesOccupees === 0 ? "red" : GRAPH_COLORS.red,
                  },
                  {
                    name: "Prises",
                    color: centre.placesOccupees === 0 ? "red" : GRAPH_COLORS.green,
                    children: centre.lignesDeBus.map((ligne, index) => ({
                      name: ligne.numeroLigne,
                      value: ligne.placesOccupees || 0,
                      index,
                    })),
                  },
                ],
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

import { BasicRoute, RouteResponseBodyV2 } from "../../..";

export interface GetSimulationAnalytics extends BasicRoute {
  method: "GET";
  path: "/affectation/simulation/hts/{id}/analytics";
  params: { id: string };
  response: RouteResponseBodyV2<{
    sessionId: string;
    createdAt: string;
    selectedCost: number;
    iterationCostList: number[];
    jeuneAttenteAffectation: number;
    jeunesDejaAffected: number;
    jeunesNouvellementAffected: number;
    summary: string[];
    jeunesProblemeDePlaces: Array<{
      id: string;
      departement: string;
      detail: string;
    }>;
    regions: Record<
      string,
      Array<{
        id: string;
        nom: string;
        departement: string;
        codePostal: string;
        ville: string;
        placesTotal: number | null;
        placesOccupees: number | null;
        placesRestantes: number | null;
        tauxRemplissage: number | null;
        tauxFille: number | null;
        tauxGarcon: number | null;
        tauxPSH: number | null;
        tauxQVP: number | null;
        sejourId: string;
        lignesDeBus: Array<{
          numeroLigne: string;
          placesOccupees: number;
          placesRestances: number;
          nonAffectesMemeDepartement: number;
        }>;
      }>
    >;
  }>;
}

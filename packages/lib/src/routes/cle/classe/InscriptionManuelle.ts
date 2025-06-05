import { BasicRoute, RouteResponseBodyV2 } from "../..";

export interface InscriptionManuelleRoute extends BasicRoute {
  method: "POST";
  path: "/classe/{id}/inscription-manuelle";
  params: {
    id: string;
  };
  payload: {
    prenom: string;
    nom: string;
    dateDeNaissance: string;
    sexe: string;
  };
  response: RouteResponseBodyV2<{
    id: string;
  }>;
}

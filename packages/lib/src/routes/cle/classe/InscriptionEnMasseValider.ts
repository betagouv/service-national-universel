import { BasicRoute, RouteResponseBodyV2 } from "../..";

export interface InscriptionEnMasseValiderRoute extends BasicRoute {
  method: "POST";
  path: "/classe/{id}/inscription-en-masse/valider";
  params: {
    id: string;
  };
  file: File;
  payload: {
    mapping: Record<string, string> | null;
  };
  response: RouteResponseBodyV2<{
    isValid: boolean;
    errors: Array<{
      column: string;
      line?: number;
      code: string;
      message?: string;
    }>;
  }>;
}

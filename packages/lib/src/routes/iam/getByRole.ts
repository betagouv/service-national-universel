import { BasicRoute, RouteResponseBodyV2 } from "..";
import { ReferentForListDto } from "../../dto";
import { ROLES } from "../../roles";

export interface GetByRoleRoute extends BasicRoute {
  method: "GET";
  path: "/referent";
  query: {
    /**
     * Seuls les référents de classe sont listables : autoriser un autre rôle ferait de cette
     * route un annuaire national des référents (identité + email).
     */
    role: typeof ROLES.REFERENT_CLASSE;
    search?: string;
    /** Obligatoire : c'est le périmètre de la requête, vérifié côté API contre l'appelant. */
    etablissementId: string;
  };
  response: RouteResponseBodyV2<ReferentForListDto[]>;
}

import { YoungType } from "../../mongoSchema";
import { BasicRoute, RouteResponseBodyV2 } from "../..";
import { YoungDto } from "../../dto/youngDto";

export interface ChangeYoungSessionRoute extends BasicRoute {
  method: "PUT";
  path: "/phase1/{youngId}/change-session";
  params: {
    youngId: string;
  };
  payload: Pick<YoungType, "cohortId" | "source" | "cohortChangeReason" | "cohortDetailedChangeReason" | "etablissementId" | "classeId">;
  response: RouteResponseBodyV2<YoungDto>;
}

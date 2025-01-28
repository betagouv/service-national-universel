import { YoungType } from "../../mongoSchema";
import { BasicRoute, RouteResponseBody } from "../..";

export interface UpdateYoungRoute extends BasicRoute {
  method: "PUT";
  path: "/young/{id}";
  params: {
    id: string;
  };
  payload: Pick<YoungType, "cohortId" | "source" | "cohortChangeReason" | "cohortDetailedChangeReason" | "etablissementId" | "classeId">;
  response: RouteResponseBody<YoungType>;
}

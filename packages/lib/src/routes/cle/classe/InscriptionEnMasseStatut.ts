import { BasicRoute, RouteResponseBodyV2 } from "../..";
import { TaskStatus } from "../../../constants/task";

export interface InscriptionEnMasseStatutRoute extends BasicRoute {
  method: "GET";
  path: "/classe/{id}/inscription-en-masse";
  params: {
    id: string;
  };
  response: RouteResponseBodyV2<{
    status: TaskStatus | "NONE";
    statusDate: string;
    lastCompletedAt: string;
  }>;
}

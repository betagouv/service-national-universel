import { TaskDto } from "../../../dto/taskDto";
import { BasicRoute, RouteResponseBodyV2 } from "../..";

export interface InscriptionEnMasseImporterRoute extends BasicRoute {
  method: "POST";
  path: "/classe/{id}/inscription-en-masse/importer";
  params: {
    id: string;
  };
  payload: {
    mapping: Record<string, string> | null;
    fileKey: string;
  };
  // TODO: type
  response: RouteResponseBodyV2<TaskDto<any, any>>;
}

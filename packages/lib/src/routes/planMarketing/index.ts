import { BasicRoute, CampagneJeuneType, DestinataireListeDiffusion, RouteResponseBodyV2 } from "../..";
import { CreateDistributionListBrevoRoute } from "./createDistributionList";
import { ImportContactsBrevoRoute } from "./importContacts";

export interface CampagnePayload {
  _id: string;
  campagneGeneriqueId?: string;
  nom: string;
  objet: string;
  contexte?: string;
  templateId: number;
  listeDiffusionId: string;
  generic: boolean;
  destinataires: DestinataireListeDiffusion[];
  type: CampagneJeuneType;
}

export type CreateCampagnePayload = Omit<CampagnePayload, "id">;
export interface CampagneResponse extends CampagnePayload {
  createdAt: string;
  updatedAt: string;
}

interface GetPlanMarketingRoute extends BasicRoute {
  method: "GET";
  path: "/campagne/{id}";
  params: {
    id: string;
  };
  response: RouteResponseBodyV2<CampagneResponse>;
}

interface CreatePlanMarketingRoute extends BasicRoute {
  method: "POST";
  path: "/campagne";
  payload: CreateCampagnePayload;
  response: RouteResponseBodyV2<CampagneResponse>;
}

interface UpdatePlanMarketingRoute extends BasicRoute {
  method: "PUT";
  path: "/campagne/{id}";
  params: {
    id: string;
  };
  payload: CampagnePayload;
  response: RouteResponseBodyV2<CampagneResponse>;
}

interface SearchPlanMarketingRoute extends BasicRoute {
  method: "GET";
  path: "/campagne";
  query?: {
    generic?: boolean;
    sort?: "ASC" | "DESC";
  };
  response: RouteResponseBodyV2<CampagneResponse[]>;
}

interface GetAllCampagnesRoute extends BasicRoute {
  method: "GET";
  path: "/campagne/all";
  query?: {
    sort?: "ASC" | "DESC";
  };
  response: RouteResponseBodyV2<CampagneResponse[]>;
}

export type PlanMarketingRoutes = {
  GetPlanMarketingRoute: GetPlanMarketingRoute;
  CreatePlanMarketingRoute: CreatePlanMarketingRoute;
  UpdatePlanMarketingRoute: UpdatePlanMarketingRoute;
  SearchPlanMarketingRoute: SearchPlanMarketingRoute;
  ImportContacts: ImportContactsBrevoRoute;
  CreateDistributionList: CreateDistributionListBrevoRoute;
  GetAllCampagnes: GetAllCampagnesRoute;
};

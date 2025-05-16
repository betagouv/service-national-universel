import { BasicRoute, CampagneEnvoi, CampagneJeuneType, DestinataireListeDiffusion, Programmation, RouteResponseBodyV2 } from "../..";
import { CreateDistributionListBrevoRoute } from "./createDistributionList";
import { ImportContactsBrevoRoute } from "./importContacts";
import { ListeDiffusionRoutes } from "./listeDiffusion";

// Types de base pour les campagnes
interface CampagneBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface CampagneComplete extends CampagneBase {
  nom: string;
  objet: string;
  contexte?: string;
  templateId: number;
  listeDiffusionId: string;
  destinataires: DestinataireListeDiffusion[];
  type: CampagneJeuneType;
  envois?: CampagneEnvoi[];
  isProgrammationActive: boolean;
  programmations?: Programmation[];
  isArchived?: boolean;
}

// Types pour les campagnes génériques
export interface CampagneGeneriquePayload extends CampagneComplete {
  generic: boolean;
}

// Types pour les campagnes spécifiques
interface CampagneSpecifiqueBase extends CampagneBase {
  generic: false;
  cohortId: string;
}

export interface CampagneSpecifiqueWithoutRefPayload extends CampagneComplete, CampagneSpecifiqueBase {}

export interface CampagneSpecifiqueWithRefPayload extends CampagneSpecifiqueBase {
  campagneGeneriqueId: string;
}

export type CampagnePayload = CampagneGeneriquePayload | CampagneSpecifiqueWithoutRefPayload | CampagneSpecifiqueWithRefPayload;

type OmitBaseFields<T> = Omit<T, keyof CampagneBase>;
export type CreateCampagneGeneriquePayload = OmitBaseFields<CampagneGeneriquePayload>;
export type CreateCampagneSpecifiqueWithoutRefPayload = OmitBaseFields<CampagneSpecifiqueWithoutRefPayload>;
export type CreateCampagneSpecifiqueWithRefPayload = OmitBaseFields<CampagneSpecifiqueWithRefPayload>;
export type CreateCampagnePayload = CreateCampagneGeneriquePayload | CreateCampagneSpecifiqueWithoutRefPayload | CreateCampagneSpecifiqueWithRefPayload;

export type CampagneModelWithNomSession = CampagneGeneriquePayload & { nomSession: string };
export type CampagneResponse = CampagneComplete &
  CampagneSpecifiqueWithRefPayload & {
    createdAt: string;
    updatedAt: string;
  };

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
    cohortId?: string;
    isArchived?: boolean;
  };
  response: RouteResponseBodyV2<CampagneResponse[]>;
}

interface EnvoyerPlanMarketingRoute extends BasicRoute {
  method: "POST";
  path: "/campagne/{id}/envoyer";
  response: RouteResponseBodyV2<void>;
  payload: {
    isProgrammationActive?: boolean;
  };
}

interface ToggleArchivagePlanMarketingRoute extends BasicRoute {
  method: "POST";
  path: "/campagne/{id}/toggle-archivage";
  params: {
    id: string;
  };
  response: RouteResponseBodyV2<CampagneResponse>;
}

interface GetCampagneSpecifiquesByCampagneGeneriqueIdRoute extends BasicRoute {
  method: "GET";
  path: "/campagne/{id}/campagnes-specifiques";
  params: {
    id: string;
  };
  response: RouteResponseBodyV2<CampagneModelWithNomSession[]>;
}

export type PlanMarketingRoutes = {
  GetPlanMarketingRoute: GetPlanMarketingRoute;
  CreatePlanMarketingRoute: CreatePlanMarketingRoute;
  UpdatePlanMarketingRoute: UpdatePlanMarketingRoute;
  SearchPlanMarketingRoute: SearchPlanMarketingRoute;
  ImportContacts: ImportContactsBrevoRoute;
  CreateDistributionList: CreateDistributionListBrevoRoute;
  ListeDiffusionRoutes: ListeDiffusionRoutes;
  EnvoyerPlanMarketingRoute: EnvoyerPlanMarketingRoute;
  ToggleArchivagePlanMarketingRoute: ToggleArchivagePlanMarketingRoute;
  GetCampagneSpecifiquesByCampagneGeneriqueIdRoute: GetCampagneSpecifiquesByCampagneGeneriqueIdRoute;
};

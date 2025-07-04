import { ListeDiffusionEnum, ListeDiffusionFiltres } from "../..";
import { BasicRoute, RouteResponseBodyV2 } from "..";

export interface ListeDiffusionPayload {
  id: string;
  nom: string;
  type: ListeDiffusionEnum;
  filters: ListeDiffusionFiltres;
  isArchived?: boolean;
}

export interface CreateListeDiffusionPayload extends Omit<ListeDiffusionPayload, "id"> {}

export interface ListeDiffusionResponse extends ListeDiffusionPayload {
  createdAt: string;
  updatedAt: string;
}

export interface CreateListeDiffusionRoute extends BasicRoute {
  method: "POST";
  path: "/liste-diffusion";
  payload: CreateListeDiffusionPayload;
  response: RouteResponseBodyV2<ListeDiffusionResponse>;
}

export interface GetListeDiffusionRoute extends BasicRoute {
  method: "GET";
  path: "/liste-diffusion/{id}";
  params: {
    id: string;
  };
  response: RouteResponseBodyV2<ListeDiffusionResponse[]>;
}

export interface UpdateListeDiffusionRoute extends BasicRoute {
  method: "PUT";
  path: "/liste-diffusion/{id}";
  params: {
    id: string;
  };
  payload: ListeDiffusionPayload;
  response: RouteResponseBodyV2<ListeDiffusionResponse>;
}

export interface SearchListeDiffusionRoute extends BasicRoute {
  method: "GET";
  path: "/liste-diffusion";
  query?: {
    sort?: "ASC" | "DESC";
    isArchived?: boolean;
  };
  response: RouteResponseBodyV2<ListeDiffusionResponse[]>;
}

export interface ToggleArchivageListeDiffusionRoute extends BasicRoute {
  method: "POST";
  path: "/liste-diffusion/{id}/toggle-archivage";
  params: {
    id: string;
  };
  response: RouteResponseBodyV2<ListeDiffusionResponse>;
}

export type ListeDiffusionRoutes = {
  CreateListeDiffusionRoute: CreateListeDiffusionRoute;
  GetListeDiffusionRoute: GetListeDiffusionRoute;
  UpdateListeDiffusionRoute: UpdateListeDiffusionRoute;
  SearchListeDiffusionRoute: SearchListeDiffusionRoute;
  ToggleArchivageListeDiffusionRoute: ToggleArchivageListeDiffusionRoute;
};

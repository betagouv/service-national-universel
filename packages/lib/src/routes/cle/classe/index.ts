import { GetClasseRoute, GetClasseRouteSchema } from "./get";
import { CreateClasseRoute, CreateClasseRouteSchema } from "./create";

export const ClassesRoutesSchema = {
  Get: GetClasseRouteSchema,
  Create: CreateClasseRouteSchema,
};

export type ClassesRoutes = {
  Get: GetClasseRoute;
  Create: CreateClasseRoute;
  // GetOne: GetOneClasseRoute,
  // Update: UpdateClasseRoute,
  // Delete: DeleteClasseRoute,
};

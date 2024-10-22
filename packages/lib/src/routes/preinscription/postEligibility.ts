import { BasicRoute, RouteResponseBody } from "..";
import { CohortType } from "../../mongoSchema";

export interface PostEligibilityRoute extends BasicRoute {
  method: "POST";
  path: "/preinscription/eligibilite";
  payload: {
    schoolDepartment?: string;
    department: string;
    region: string;
    schoolRegion?: string;
    birthdateAt: Date;
    grade: string;
    status: string;
    zip?: string;
    isReInscription: boolean;
  };
  response: RouteResponseBody<
    Array<
      Pick<CohortType, "_id" | "name" | "type" | "event" | "dateStart" | "dateEnd"> & {
        numberOfCandidates?: number;
        numberOfValidated?: number;
        goal?: number;
        goalReached?: boolean;
        isFull?: boolean;
        isEligible?: boolean;
      }
    >
  >;
}

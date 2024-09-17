import { BasicRoute, RouteResponseBody } from "..";
import { CohortType } from "../../mongoSchema";

export interface GetEligibilityRoute extends BasicRoute {
  method: "POST";
  path: "/cohort-session/eligibility/2023/{id}";
  params: { id?: string };
  payload?: {
    schoolDepartment?: string;
    department: string;
    region: string;
    schoolRegion?: string;
    birthdateAt: Date;
    grade: string;
    status: string;
    zip?: string;
  };
  query?: {
    getAllSessions?: boolean;
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

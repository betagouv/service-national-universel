import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { ClasseDepartementGuard } from "../classe/guard/ClasseDepartement.guard";
import { ClasseGuardService } from "../classe/guard/ClasseGuard.service";
import { ClasseRegionGuard } from "../classe/guard/ClasseRegion.guard";
import { AnyGuard } from "@admin/infra/iam/guard/Any.guard";
import { ReferentDepartementalGuard } from "@admin/infra/iam/guard/ReferentDepartemental.guard";
import { ReferentRegionalGuard } from "@admin/infra/iam/guard/ReferentRegional.guard";
import { ResponsableGuard } from "@admin/infra/iam/guard/Responsable.guard";
import { SupervisorGuard } from "@admin/infra/iam/guard/Superviseur.guard";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";

export const guardProviders = [
    ClasseGuardService,
    ClasseRegionGuard,
    ClasseDepartementGuard,
    SuperAdminGuard,
    ReferentDepartementalGuard,
    ReferentRegionalGuard,
    ResponsableGuard,
    SupervisorGuard,
    AdminGuard,
    AnyGuard,
];

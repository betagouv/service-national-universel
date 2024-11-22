import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { ClasseAdminCleGuard } from "../classe/guard/ClasseAdminCle.guard";
import { ClasseDepartementGuard } from "../classe/guard/ClasseDepartement.guard";
import { ClasseGuardService } from "../classe/guard/ClasseGuard.service";
import { ClasseRegionGuard } from "../classe/guard/ClasseRegion.guard";

export const guardProviders = [
    ClasseGuardService,
    ClasseAdminCleGuard,
    ClasseRegionGuard,
    ClasseDepartementGuard,
    SuperAdminGuard,
];

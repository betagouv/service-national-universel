import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { JeuneReferentGuard } from "../guard/JeuneReferent.guard";
import { JeuneGuardService } from "../guard/JeuneGuard.service";
import { JeuneDepartementGuard } from "../guard/JeuneDepartement.guard";
import { JeuneRegionGuard } from "../guard/JeuneRegion.guard";
import { AnyGuard } from "@admin/infra/iam/guard/Any.guard";
import { ReferentDepartementalGuard } from "@admin/infra/iam/guard/ReferentDepartemental.guard";
import { ReferentRegionalGuard } from "@admin/infra/iam/guard/ReferentRegional.guard";

export const guardProviders = [
    JeuneReferentGuard,
    JeuneGuardService,
    JeuneDepartementGuard,
    JeuneRegionGuard,
    SuperAdminGuard,
    ReferentDepartementalGuard,
    ReferentRegionalGuard,
    AnyGuard,
];

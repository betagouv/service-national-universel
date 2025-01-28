import { JeuneReferentGuard } from "../guard/JeuneReferent.guard";
import { JeuneGuardService } from "../guard/JeuneGuard.service";
import { JeuneDepartementGuard } from "../guard/JeuneDepartement.guard";
import { JeuneRegionGuard } from "../guard/JeuneRegion.guard";

export const guardProviders = [JeuneReferentGuard, JeuneGuardService, JeuneDepartementGuard, JeuneRegionGuard];

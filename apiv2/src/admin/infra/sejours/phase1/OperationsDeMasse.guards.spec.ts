import { GUARDS_METADATA } from "@nestjs/common/constants";

import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";

import { AffectationController } from "./affectation/api/Affectation.controller";
import { DesistementController } from "./desistement/api/Desistement.controller";
import { BasculeJeuneValidesController } from "./inscription/api/BasculeJeuneValides.controller";
import { BasculeJeuneNonValidesController } from "./inscription/api/BasculeJeuneNonValides.controller";

const guardsOf = (controller: any, method: string) =>
    Reflect.getMetadata(GUARDS_METADATA, controller.prototype[method]) || [];

// FM18 : l'admin réserve les opérations de masse sur une cohorte au super admin, mais apiv2
// acceptait leur validation de tout ADMIN. La simulation reste ouverte aux admins.
describe("Opérations de masse sur une cohorte — gardes", () => {
    it.each([
        [AffectationController, "validerSimulationHTS"],
        [AffectationController, "validerSimulationHTSDromCom"],
        [AffectationController, "validerSimulationCLE"],
        [AffectationController, "validerSimulationCLEDromCom"],
        [DesistementController, "validerionDesister"],
        [BasculeJeuneValidesController, "basuleJeunesValidesValider"],
        [BasculeJeuneNonValidesController, "basuleJeunesNonValidesValider"],
    ])("%p.%s est réservée au super admin", (controller, method) => {
        expect(guardsOf(controller, method)).toEqual([SuperAdminGuard]);
    });

    it("la simulation HTS DROM-COM exige au moins le rôle admin", () => {
        expect(guardsOf(AffectationController, "simulateHtsDromCom")).toEqual([AdminGuard]);
    });
});

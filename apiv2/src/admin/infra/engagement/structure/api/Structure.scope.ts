import { ROLES } from "snu-lib";

import { ReferentModel } from "@admin/core/iam/Referent.model";

export type StructureScopeUser = Partial<Pick<ReferentModel, "role" | "structureId" | "departement" | "region">>;

// Mirrors buildStructureContext (api/src/controllers/elasticsearch/structure.ts) and the v1
// STRUCTURE permission policies: admin sees everything, referent_region/department are scoped
// to their perimeter, responsible/supervisor are scoped to their own structure (and its network).
// Returns:
//   - null      -> no restriction (admin)
//   - undefined -> forbidden (role without a usable perimeter)
//   - object    -> Mongo filter to apply
export function buildStructureScopeFilter(user: StructureScopeUser): Record<string, unknown> | null | undefined {
    switch (user.role) {
        case ROLES.ADMIN:
            return null;
        case ROLES.REFERENT_REGION:
            return user.region ? { region: user.region } : undefined;
        case ROLES.REFERENT_DEPARTMENT: {
            const departements = (user.departement ?? []).filter(Boolean);
            return departements.length ? { department: { $in: departements } } : undefined;
        }
        case ROLES.RESPONSIBLE:
        case ROLES.SUPERVISOR:
            return user.structureId ? { $or: [{ _id: user.structureId }, { networkId: user.structureId }] } : undefined;
        default:
            return undefined;
    }
}

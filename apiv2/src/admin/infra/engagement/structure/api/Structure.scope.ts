import { getPolicyMongoFilter, PERMISSION_ACTIONS, PERMISSION_RESOURCES, PermissionDto } from "snu-lib";

import { ReferentModel } from "@admin/core/iam/Referent.model";

export type StructureScopeUser = Pick<Partial<ReferentModel>, "region" | "departement" | "structureId"> & {
    acl?: PermissionDto[];
};

// Computes the Mongo filter to apply to the `structure` collection for the current user, driven
// by the STRUCTURE READ policies loaded onto req.user.acl (same DB-driven ACL used by the v1
// GET /structure route, see api/src/controllers/structure.ts). Gives responsibles/supervisors
// their own structure plus its network's structures (children), referent_region/department their
// perimeter, admin no restriction.
// Returns:
//   - null      -> no restriction (e.g. a FULL permission without a policy)
//   - undefined -> forbidden (no usable perimeter)
//   - object    -> Mongo filter to apply
export function buildStructureScopeFilter(user: StructureScopeUser): Record<string, unknown> | null | undefined {
    // Adapter: ACL policies name referent fields with the snu-lib/UserDto schema spelling
    // (`department`), while apiv2's ReferentModel spells the field `departement`. Map every
    // referent field a STRUCTURE policy may read (see the seed migration
    // api/migrations/20250624122150-seed-responsable-permissions.js): region, department,
    // structureId.
    const policyUser = { ...user, department: user.departement };
    return getPolicyMongoFilter({ user: policyUser as any, resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.READ });
}

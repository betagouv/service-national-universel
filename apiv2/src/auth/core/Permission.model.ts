import { PERMISSION_ACTIONS_LIST } from "snu-lib";

export type PermissionModel = {
    id: string;
    code: string;
    roles: string[];
    ressource: string;
    action: (typeof PERMISSION_ACTIONS_LIST)[number];
    policy?: PermissionPolicy[];
    titre: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
};

type PermissionPolicy = {
    where: PermissionPolicyWhere[];
    blacklist: string[];
    whitelist: string[];
};

type PermissionPolicyWhere = {
    field: string;
    value?: string;
    source?: string;
};

export type CreatePermissionModel = Omit<PermissionModel, "id" | "createdAt" | "updatedAt">;

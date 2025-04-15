export type RoleModel = {
    id: string;
    code: string;
    parent?: string;
    titre: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
};

export type CreateRoleModel = Omit<RoleModel, "id" | "createdAt" | "updatedAt">;

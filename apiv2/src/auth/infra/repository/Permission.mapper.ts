import { PermissionType } from "snu-lib";
import { PermissionDocument } from "../provider/Permission.provider";
import { PermissionModel } from "@auth/core/Permission.model";

export class PermissionMapper {
    static toModels(permissionDocuments: PermissionDocument[]): PermissionModel[] {
        return permissionDocuments.map((permissionDocument) => this.toModel(permissionDocument));
    }

    static toModel(permissionDocument: PermissionDocument): PermissionModel {
        return {
            id: permissionDocument._id.toString(),
            code: permissionDocument.code,
            roles: permissionDocument.roles,
            ressource: permissionDocument.ressource,
            action: permissionDocument.action,
            policy: permissionDocument.policy,
            titre: permissionDocument.titre,
            description: permissionDocument.description,
            createdAt: permissionDocument.createdAt,
            updatedAt: permissionDocument.updatedAt,
            deletedAt: permissionDocument.deletedAt,
        };
    }

    static toEntity(permissionModel: PermissionModel): Omit<PermissionType, "createdAt" | "updatedAt"> {
        return {
            _id: permissionModel.id,
            code: permissionModel.code,
            roles: permissionModel.roles,
            ressource: permissionModel.ressource,
            action: permissionModel.action,
            policy: permissionModel.policy || [],
            titre: permissionModel.titre,
            description: permissionModel.description || "",
            deletedAt: permissionModel.deletedAt,
        };
    }
}

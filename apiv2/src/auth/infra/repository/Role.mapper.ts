import { RoleModel } from "src/auth/core/Role.model";
import { RoleDocument } from "../provider/Role.provider";
import { RoleType } from "snu-lib";

export class RoleMapper {
    static toModels(roleDocuments: RoleDocument[]): RoleModel[] {
        return roleDocuments.map((roleDocument) => this.toModel(roleDocument));
    }

    static toModel(roleDocument: RoleDocument): RoleModel {
        return {
            id: roleDocument._id.toString(),
            code: roleDocument.code,
            parent: roleDocument.parent,
            titre: roleDocument.titre,
            description: roleDocument.description,
            createdAt: roleDocument.createdAt,
            updatedAt: roleDocument.updatedAt,
            deletedAt: roleDocument.deletedAt,
        };
    }

    static toEntity(roleModel: RoleModel): Omit<RoleType, "createdAt" | "updatedAt"> {
        return {
            _id: roleModel.id,
            code: roleModel.code,
            parent: roleModel.parent,
            titre: roleModel.titre,
            description: roleModel.description,
            deletedAt: roleModel.deletedAt,
        };
    }
}

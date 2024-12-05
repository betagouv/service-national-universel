import { ReferentModel } from "@admin/core/iam/Referent.model";

export interface ReferentSyncDto extends ReferentModel {
    operation: OperationType;
}

export enum OperationType {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
}

import { Request } from "express";

import { PermissionDto } from "snu-lib";

import { ReferentModel } from "@admin/core/iam/Referent.model";

export interface CustomRequest extends Request {
    user: Partial<ReferentModel> & { acl: PermissionDto[] };
    correlationId: string;
    token: string;
    classe: any;
}

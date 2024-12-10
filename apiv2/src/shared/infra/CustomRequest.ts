import { Request } from "express";
import { ReferentModel } from "@admin/core/iam/Referent.model";

export interface CustomRequest extends Request {
    user: Partial<ReferentModel>;
    correlationId: string;
    token: string;
    classe: any;
}

import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { PatchSchema, PatchType } from "snu-lib";
import { ReferentName } from "../../../iam/provider/ReferentMongo.provider";
import { JeuneName } from "../../../sejours/jeune/provider/JeuneMongo.provider";
import { SessionName } from "../../../sejours/phase1/session/provider/SessionMongo.provider";
import { ClasseName } from "../../../sejours/cle/classe/provider/ClasseMongo.provider";

export type PatchDocument = HydratedDocument<PatchType>;
export const PatchName = "patche";
export const PATCH_MONGOOSE_ENTITY = "PATCH_MONGOOSE_ENTITY";

const PatchSchemaRef = new mongoose.Schema(PatchSchema);

const collectionWithPatches = [JeuneName, ReferentName, ClasseName, SessionName];

export const patchesMongoProviders = collectionWithPatches.map((collectionName) => ({
    provide: `${collectionName}_${PATCH_MONGOOSE_ENTITY}`,
    useFactory: (connection: Connection) => connection.model(`${collectionName}_${PatchName}`, PatchSchemaRef),
    inject: [DATABASE_CONNECTION],
}));

export enum HistoryType {
    JEUNE = "jeune",
    REFERENT = "referent",
    CLASSE = "classe",
    SESSION = "session",
}

export const mapHistory = (history: HistoryType) => {
    switch (history) {
        case HistoryType.JEUNE:
            return `${JeuneName}_${PATCH_MONGOOSE_ENTITY}`;
        case HistoryType.REFERENT:
            return `${ReferentName}_${PATCH_MONGOOSE_ENTITY}`;
        case HistoryType.CLASSE:
            return `${ClasseName}_${PATCH_MONGOOSE_ENTITY}`;
        case HistoryType.SESSION:
            return `${SessionName}_${PATCH_MONGOOSE_ENTITY}`;
    }
};

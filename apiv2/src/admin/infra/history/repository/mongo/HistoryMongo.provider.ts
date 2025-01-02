import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { PatchOperationSchema, PatchSchema, PatchType, PatchUserSchema } from "snu-lib";

import { HistoryType } from "@admin/core/history/History";

import { ReferentName } from "../../../iam/provider/ReferentMongo.provider";
import { JeuneName } from "../../../sejours/jeune/provider/JeuneMongo.provider";
import { SessionName } from "../../../sejours/phase1/session/provider/SessionMongo.provider";
import { ClasseName } from "../../../sejours/cle/classe/provider/ClasseMongo.provider";
import { SejourName } from "../../../sejours/phase1/sejour/provider/SejourMongo.provider";
import { LigneDeBusName } from "@admin/infra/sejours/phase1/ligneDeBus/provider/LigneDeBusMongo.provider";
import { PlanDeTransportName } from "@admin/infra/sejours/phase1/planDeTransport/provider/PlanDeTransportMongo.provider";

export type HistoryDocument = HydratedDocument<PatchType>;
const PatchName = "patche";
const PATCH_MONGOOSE_ENTITY = "PATCH_MONGOOSE_ENTITY";

const PatchSchemaRef = new mongoose.Schema({
    ...PatchSchema,
    user: {
        ...PatchSchema.user,
        type: new mongoose.Schema(PatchUserSchema),
    },
    ops: {
        ...PatchSchema.ops,
        type: [new mongoose.Schema(PatchOperationSchema)],
    },
});

const collectionWithPatches = [
    JeuneName,
    ReferentName,
    ClasseName,
    SessionName,
    SejourName,
    LigneDeBusName,
    PlanDeTransportName,
];

export const historyMongoProviders = collectionWithPatches.map((collectionName) => ({
    provide: `${collectionName}_${PATCH_MONGOOSE_ENTITY}`,
    useFactory: (connection: Connection) => connection.model(`${collectionName}_${PatchName}`, PatchSchemaRef),
    inject: [DATABASE_CONNECTION],
}));

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
        case HistoryType.SEJOUR:
            return `${SejourName}_${PATCH_MONGOOSE_ENTITY}`;
        case HistoryType.LIGNEDEBUS:
            return `${LigneDeBusName}_${PATCH_MONGOOSE_ENTITY}`;
        case HistoryType.PLANDETRANSPORT:
            return `${PlanDeTransportName}_${PATCH_MONGOOSE_ENTITY}`;
    }
};

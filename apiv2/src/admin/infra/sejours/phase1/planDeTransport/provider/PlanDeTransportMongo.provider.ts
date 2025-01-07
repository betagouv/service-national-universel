import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import patchHistory from "mongoose-patch-history";

import {
    PlanTransportSchema,
    PlanTransportType,
    ModificationBusSchema,
    PointDeRassemblementSchema,
    PlanTransportPointDeRassemblementEnrichedSchema,
} from "snu-lib";

export type PlanDeTransportDocument = HydratedDocument<PlanTransportType>;
export const PlanDeTransportName = "plandetransport";
export const PLANDETRANSPORT_MONGOOSE_ENTITY = "PLANDETRANSPORT_MONGOOSE_ENTITY";

const PlanDeTransportSchemaRef = new mongoose.Schema({
    ...PlanTransportSchema,
    modificationBuses: {
        ...PlanTransportSchema["modificationBuses"],
        type: [new mongoose.Schema(ModificationBusSchema)],
    },
    pointDeRassemblements: {
        ...PlanTransportSchema["pointDeRassemblements"],
        type: [
            new mongoose.Schema({ ...PointDeRassemblementSchema, ...PlanTransportPointDeRassemblementEnrichedSchema }),
        ],
    },
});

PlanDeTransportSchemaRef.pre("save", function (next, params) {
    //@ts-ignore
    // TODO : add typing
    this._user = params?.fromUser;
    this.updatedAt = new Date();
    next();
});

export const PLANDETRANSPORT_PATCHHISTORY_OPTIONS = {
    name: `${PlanDeTransportName}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: PlanDeTransportName },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: ["/updatedAt"],
};

PlanDeTransportSchemaRef.plugin(patchHistory, {
    mongoose,
    ...PLANDETRANSPORT_PATCHHISTORY_OPTIONS,
});

export const planDeTransportMongoProviders = [
    {
        provide: PLANDETRANSPORT_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(PlanDeTransportName, PlanDeTransportSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];

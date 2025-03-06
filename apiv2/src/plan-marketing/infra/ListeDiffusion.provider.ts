import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { ListeDiffusionSchema, ListeDiffusionType } from "snu-lib";

export type ListeDiffusionDocument = HydratedDocument<ListeDiffusionType>;
export const ListeDiffusionName = "listeDiffusion";
export const LISTE_DIFFUSION_MONGOOSE_ENTITY = "LISTE_DIFFUSION_MONGOOSE_ENTITY";

const ListeDiffusionSchemaRef = new mongoose.Schema(ListeDiffusionSchema);

ListeDiffusionSchemaRef.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

export const listeDiffusionMongoProviders = [
    {
        provide: LISTE_DIFFUSION_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(ListeDiffusionName, ListeDiffusionSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];

import mongoose, { InferSchemaType, Schema } from "mongoose";
import { InterfaceExtended, PermissionSchema, RoleSchema } from "snu-lib";
import { DocumentExtended } from "./types";

const MODEL_NAME = "Role";

const schema = new Schema(
  {
    ...RoleSchema,
    permissions: {
      ...RoleSchema.permissions,
      type: [new Schema(PermissionSchema)],
    },
  },
  { timestamps: true },
);

type RoleType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type RoleDocument<T = {}> = DocumentExtended<RoleType & T>;

export const RoleModel = mongoose.model<RoleDocument>(MODEL_NAME, schema);

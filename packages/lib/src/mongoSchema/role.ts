import { InferSchemaType, Schema } from "mongoose";
import { InterfaceExtended } from "src";

export const ConditionSchema = {
  modelName: {
    type: String,
    required: true,
    documentation: {
      description: "Nom du modèle",
    },
  },
  fieldName: {
    type: String,
    required: true,
    documentation: {
      description: "Nom du champ",
    },
  },
  type: {
    type: String,
    enum: ["boolean", "startDate", "endDate"],
    required: true,
    documentation: {
      description: "Opérateur de comparaison",
    },
  },
};

export const PermissionSchema = {
  name: {
    type: String,
    required: true,
  },
  conditions: {
    type: [ConditionSchema],
    documentation: {
      description: "Conditions d'application de la permission",
    },
  },
};

export const RoleSchema = {
  name: {
    type: String,
    required: true,
    unique: true,
    documentation: {
      description: "Nom du rôle",
    },
  },
  description: {
    type: String,
    documentation: {
      description: "Description du rôle",
    },
  },
  permissions: {
    type: [PermissionSchema],
    documentation: {
      description: "Permissions associées au rôle",
    },
  },
};

const schema = new Schema({ ...RoleSchema, permissions: [PermissionSchema] }, { timestamps: true });
const permissionSchemaInstance = new Schema(PermissionSchema);
const conditionSchemaInstance = new Schema(ConditionSchema);
export type RoleType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type PermissionType = InterfaceExtended<InferSchemaType<typeof permissionSchemaInstance>>;
export type ConditionType = InterfaceExtended<InferSchemaType<typeof conditionSchemaInstance>>;

import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from "../..";
import { PERMISSION_ACTIONS_LIST } from "../../permissions";

export const PermissionPolicyWhereSchema = {
  field: {
    type: String,
    required: true,
    documentation: {
      description: "Resourse field (permission ressource) to filter on (ex: 'departement')",
    },
  },
  value: {
    type: String,
    optional: true,
    documentation: {
      description: "Static value of the field to filter on (ex: 'Loire-Atlantique')",
    },
  },
  source: {
    type: String,
    optional: true,
    documentation: {
      description: "Dynamic field of referent to filter on (ex: '_id')",
    },
  },
};

export const PermissionPolicySchema = {
  code: {
    type: String,
    optional: true,
    documentation: {
      description: "Code for custom rule",
    },
  },
  where: {
    type: [PermissionPolicyWhereSchema],
    documentation: {
      description: "Where clause for the policy (ex: { field: 'referentEtablissementIds', source: '_id' })",
    },
  },
  blacklist: {
    type: [String],
    optional: true,
    default: [],
    documentation: {
      description: "List of ressources to exclude from the policy (ex: { blackList: ['Provence-Alpes-Côte d'Azur'] }",
    },
  },
  whitelist: {
    type: [String],
    optional: true,
    default: [],
    documentation: {
      description: "List of ressources to include in the policy (ex: { whiteList: ['Loire-Atlantique'] }",
    },
  },
  // TODO: add $in column
};

export const PermissionSchema = {
  code: {
    type: String,
    required: true,
    unique: true,
    documentation: {
      description: "Identifiant de la permission (ex: 'CentresListAll')",
    },
  },
  roles: {
    type: [String],
    required: true,
    documentation: {
      description: "Liste des codes rôles où cette permission s'applique",
    },
  },
  ressource: {
    type: String,
    required: true,
    documentation: {
      description: "Ressource of the permission (ex: 'young') or script (ex: 'AFFECTER_HTS')",
    },
  },
  action: {
    type: String,
    required: true,
    enum: PERMISSION_ACTIONS_LIST,
    documentation: {
      description: "Action of the permission (ex: 'update')",
    },
  },
  policy: {
    type: [PermissionPolicySchema],
    optional: true,
    documentation: {
      description: "Policy for a specific ressource or a script",
    },
  },
  titre: {
    type: String,
    required: true,
    documentation: {
      description: "Titre de la permission (ex: Lister l’intégralité des centres)",
    },
  },
  description: {
    type: String,
    optional: true,
    documentation: {
      description: "Décrit l’utilisation de la permission (ex : La liste de l’intégralité des centres, y compris les centres archivés) ",
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
};

const schema = new Schema(PermissionSchema);
export type PermissionType = InterfaceExtended<InferSchemaType<typeof schema>>;

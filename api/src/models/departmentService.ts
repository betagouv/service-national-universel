import config from "config";
import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import mongooseElastic from "@selego/mongoose-elastic";

import esClient from "../es";
import anonymize from "../anonymization/departmentService";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "./types";

const MODELNAME = "departmentservice";

const schema = new Schema({
  contacts: {
    type: [
      {
        cohort: {
          type: String,
          documentation: "cohorte concerné par le service",
        },
        cohortId: {
          type: String,
          documentation: {
            description: "Id de la cohorte",
          },
        },
        contactName: {
          type: String,
          documentation: {
            description: "Nom du contact au sein du service",
          },
        },
        contactPhone: {
          type: String,
          documentation: {
            description: "Téléphone du contact au sein du service",
          },
        },
        contactMail: {
          type: String,
          documentation: {
            description: "Mail du contact au sein du service",
          },
        },
      },
    ],
  },
  department: {
    type: String,
    documentation: {
      description: "Nom du département",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Nom de la région (peut être déduit du département)",
    },
  },
  directionName: {
    type: String,
    documentation: {
      description: "Nom de la direction",
    },
  },
  serviceName: {
    type: String,
    documentation: {
      description: "Nom du service",
    },
  },
  serviceNumber: {
    type: String,
    documentation: {
      description: "Numero du bureau",
    },
  },
  address: {
    type: String,
    documentation: {
      description: "Adresse",
    },
  },
  complementAddress: {
    type: String,
    documentation: {
      description: "Adresse",
    },
  },
  zip: {
    type: String,
    documentation: {
      description: "Code postal",
    },
  },
  city: {
    type: String,
    documentation: {
      description: "Ville",
    },
  },
  description: {
    type: String,
    documentation: {
      description: "Information comlpémentaire",
    },
  },
  contactName: {
    type: String,
    documentation: {
      description: "Nom du contact au sein du service",
    },
  },
  contactPhone: {
    type: String,
    documentation: {
      description: "Téléphone du contact au sein du service",
    },
  },
  contactMail: {
    type: String,
    documentation: {
      description: "Mail du contact au sein du service",
    },
  },

  representantEtat: {
    type: {
      firstName: {
        type: String,
        documentation: {
          description: "Prénom du représentant de l'état",
        },
      },
      lastName: {
        type: String,
        documentation: {
          description: "Nom du représentant de l'état",
        },
      },
      mobile: {
        type: String,
        documentation: {
          description: "Téléphone du représentant de l'état",
        },
      },
      email: {
        type: String,
        documentation: {
          description: "Mail du représentant de l'état",
        },
      },
      role: {
        type: String,
        documentation: {
          description: "Rôle du représentant de l'état",
        },
      },
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

schema.methods.anonymise = function () {
  return anonymize(this);
};

schema.virtual("fromUser").set<SchemaExtended>(function (fromUser: UserSaved) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  this.fromUser = params?.fromUser;
  this.updatedAt = new Date();
  next();
});

schema.plugin(patchHistory, {
  mongoose,
  name: `${MODELNAME}Patches`,
  trackOriginalValue: true,
  includes: {
    modelName: { type: String, required: true, default: MODELNAME },
    user: { type: Object, required: false, from: "_user" },
  },
  excludes: ["/updatedAt"],
});

if (config.get("ENABLE_MONGOOSE_ELASTIC")) {
  schema.plugin(mongooseElastic(esClient), MODELNAME);
}

export type DepartmentServiceType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type DepartmentServiceDocument<T = {}> = DocumentExtended<DepartmentServiceType & T>;
type SchemaExtended = DepartmentServiceDocument & UserExtension;

export const DepartmentServiceModel = mongoose.model<DepartmentServiceDocument>(MODELNAME, schema);

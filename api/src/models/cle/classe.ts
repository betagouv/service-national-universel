import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import mongooseElastic from "@selego/mongoose-elastic";
import { STATUS_CLASSE_LIST, STATUS_PHASE1_CLASSE_LIST, CLE_FILIERE_LIST, CLE_GRADE_LIST, CLE_COLORATION_LIST, TYPE_CLASSE_LIST, ReferentCreatedBy } from "snu-lib";

import esClient from "../../es";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "../types";
import { EtablissementDocument } from "./etablissement";
import { ReferentDocument } from "../referent";
import { CohesionCenterDocument } from "../cohesionCenter";
import { SessionPhase1Document } from "../sessionPhase1";
import { PointDeRassemblementDocument } from "../PlanDeTransport/pointDeRassemblement";
import { LigneBusDocument } from "../PlanDeTransport/ligneBus";
import { CohortDocument } from "../cohort";

const MODELNAME = "classe";

const classeMetadataSchema = {
  createdBy: {
    type: String,
    enum: ReferentCreatedBy,
    documentation: {
      description: "Par quel workflow a été créé la classe",
    },
  },
  numeroDossierDS: {
    type: Number,
    documentation: {
      description: "Numéro de dossier Démarche Simplifiée si la classe a été importé",
    },
  },
};

const schema = new Schema({
  etablissementId: {
    type: String,
    required: true,
    documentation: {
      description: "ID de l'établissement",
    },
  },

  referentClasseIds: {
    type: [String],
    required: true,
    documentation: {
      description: "ID du référent de classe",
    },
  },

  cohort: {
    type: String,
    documentation: {
      description: "Cohorte de la classe",
    },
  },

  uniqueKey: {
    type: String,
    required: true,
    documentation: {
      description: "Clé unique de la classe (UAI_DATE_*)",
    },
  },

  uniqueId: {
    type: String,
    documentation: {
      description: "ID unique de la classe (*_XXXX)",
    },
  },

  uniqueKeyAndId: {
    type: String,
    required: true,
    documentation: {
      description: "Key_ID unique de la classe (UAI_DATE_XXXX)",
    },
  },

  name: {
    type: String,
    documentation: {
      description: "Nom de la classe",
    },
  },

  coloration: {
    type: String,
    enum: CLE_COLORATION_LIST,
    documentation: {
      description: "Couleur de la classe",
    },
  },

  estimatedSeats: {
    type: Number,
    required: true,
    documentation: {
      description: "Nombre de places estimées de la classe, provient de DS, non modifiable par l'utilisateur",
    },
  },

  totalSeats: {
    type: Number,
    required: true,
    documentation: {
      description: "Nombre de places total de la classe, modifiable par l'utilisateur",
    },
  },

  seatsTaken: {
    type: Number,
    default: 0,
    documentation: {
      description: "Nombre de places prises de la classe = nombre d'élèves statut validé",
    },
  },

  filiere: {
    type: String,
    enum: CLE_FILIERE_LIST,
    documentation: {
      description: "Filière de la classe",
    },
  },

  grade: {
    //legacy
    type: String,
    enum: CLE_GRADE_LIST,
    documentation: {
      description: "Niveau de la classe",
    },
  },

  grades: {
    type: [String],
    enum: CLE_GRADE_LIST,
    documentation: {
      description: "Niveau de la classe",
    },
  },

  cohesionCenterId: {
    type: String,
    documentation: {
      description: "ID du centre de cohésion",
    },
  },

  sessionId: {
    type: String,
    documentation: {
      description: "ID de la session",
    },
  },

  ligneId: {
    type: String,
    documentation: {
      description: "ID de la ligne de bus",
    },
  },

  pointDeRassemblementId: {
    type: String,
    documentation: {
      description: "ID du point de rassemblement",
    },
  },

  status: {
    type: String,
    required: true,
    enum: STATUS_CLASSE_LIST,
    documentation: {
      description: "Statut de la classe",
    },
  },

  statusPhase1: {
    type: String,
    required: true,
    enum: STATUS_PHASE1_CLASSE_LIST,
    documentation: {
      description: "Statut de la classe pour la phase 1",
    },
  },

  department: {
    type: String,
    required: true,
    documentation: {
      description: "Département de la classe",
    },
  },

  region: {
    type: String,
    required: true,
    documentation: {
      description: "Région de la classe",
    },
  },

  academy: {
    type: String,
    required: true,
    documentation: {
      description: "Académie de la classe",
    },
  },

  schoolYear: {
    type: String,
    required: true,
    documentation: {
      description: "Année scolaire de la classe",
    },
  },

  comments: {
    type: String,
    default: "",
    documentation: {
      description: "Commentaires de la classe",
    },
  },

  trimester: {
    type: String,
    enum: ["T1", "T2", "T3"],
    documentation: {
      description: "Trimestre de préférence pour partir en séjour",
    },
  },

  type: {
    type: String,
    enum: TYPE_CLASSE_LIST,
    documentation: {
      description: "Type de la classe, une classe complète ou une groupe d'élèves",
    },
  },

  metadata: {
    type: classeMetadataSchema,
    default: {},
    documentation: {
      description: "Métadonnées d'un référent",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
});

schema.virtual("etablissement", {
  ref: "etablissement",
  localField: "etablissementId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("referents", {
  ref: "referent",
  localField: "referentClasseIds",
  foreignField: "_id",
});

schema.virtual("cohesionCenter", {
  ref: "cohesioncenter",
  localField: "cohesionCenterId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("session", {
  ref: "sessionphase1",
  localField: "sessionId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("pointDeRassemblement", {
  ref: "pointderassemblement",
  localField: "pointDeRassemblementId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("ligne", {
  ref: "lignebuses",
  localField: "ligneId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("cohortData", {
  ref: "cohort",
  localField: "cohort",
  foreignField: "name",
  justOne: true,
});

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  if (user) {
    const { _id, role, department, region, email, firstName, lastName, model } = user;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

schema.set("toObject", { virtuals: true });
schema.set("toJSON", { virtuals: true });

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  this.user = params?.fromUser;
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

schema.plugin(mongooseElastic(esClient), MODELNAME);

export type ClasseType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type ClasseDocument<T = {}> = DocumentExtended<
  ClasseType & {
    // virtual fields
    etablissement?: EtablissementDocument;
    referents?: ReferentDocument[];
    cohesionCenter?: CohesionCenterDocument;
    session?: SessionPhase1Document;
    pointDeRassemblement?: PointDeRassemblementDocument;
    ligne?: LigneBusDocument;
    cohortData?: CohortDocument;
  } & T
>;
type SchemaExtended = ClasseDocument & UserExtension;

export const ClasseModel = mongoose.model<ClasseDocument>(MODELNAME, schema);

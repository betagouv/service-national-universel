import mongoose, { Schema, InferSchemaType } from "mongoose";
import { isAfter, isWithinInterval } from "date-fns";
import { COHORT_TYPE, COHORT_TYPE_LIST, getDateTimeByTimeZoneOffset } from "snu-lib";
import patchHistory from "mongoose-patch-history";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "./types";

const MODELNAME = "cohort";

const DSNJExportDates = new Schema({
  cohesionCenters: Date,
  youngsBeforeSession: Date,
  youngsAfterSession: Date,
});

const Eligibility = new Schema({
  zones: {
    type: [String],
    enum: ["A", "B", "C", "DOM", "PF", "Etranger", "NC", "Corse", "Mayotte", "La Réunion", "Guadeloupe", "Guyane", "Martinique"],
    required: true,
  },
  schoolLevels: {
    type: [String],
    enum: ["4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre", "NOT_SCOLARISE"],
    required: true,
  },
  bornAfter: { type: Date, required: true },
  bornBefore: { type: Date, required: true },
});

const schema = new mongoose.Schema({
  snuId: {
    type: String,
    required: true,
    unique: true,
    documentation: {
      description: "Cohorte id (defined in snu lib)",
    },
  },
  name: {
    type: String,
    required: true,
    documentation: {
      description: "Cohorte name (defined in snu lib)",
    },
  },
  dsnjExportDates: {
    type: DSNJExportDates,
    documentation: {
      description: "Dates when DSNJ export are generated",
    },
  },

  isAssignmentAnnouncementsOpenForYoung: {
    type: Boolean,
    documentation: {
      description:
        "Si true, les affectations sont 'révélées' au jeune. Sinon, le jeune doit avoir l'impression qu'il est toujours dans un état d'attente d'affectation même si il a été affecté.",
    },
  },
  manualAffectionOpenForAdmin: {
    type: Boolean,
    documentation: {
      description: "Si true, les admins peuvent manuellement affecter un jeune à un centre",
    },
  },
  manualAffectionOpenForReferentRegion: {
    type: Boolean,
    documentation: {
      description: "Si true, les referents régionaux peuvent manuellement affecter un jeune à un centre",
    },
  },
  manualAffectionOpenForReferentDepartment: {
    type: Boolean,
    documentation: {
      description: "Si true, les referents départementaux peuvent manuellement affecter un jeune à un centre",
    },
  },

  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },

  eligibility: { type: Eligibility, required: true },

  inscriptionStartDate: { type: Date, required: true },
  inscriptionEndDate: { type: Date, required: true },
  instructionEndDate: { type: Date, required: true },
  inscriptionModificationEndDate: { type: Date },
  reInscriptionStartDate: { type: Date || null },
  reInscriptionEndDate: { type: Date || null },

  buffer: {
    type: Number,
    required: true,
  },

  event: {
    type: String,
    required: true,
    documentation: {
      description: "Event plausible",
    },
  },

  pdrChoiceLimitDate: {
    type: Date,
    documentation: {
      description: "Date limite de choix du PDR par le jeune, par defaut 23h59",
    },
  },

  // CLE
  // CLE - update by referents
  cleUpdateCohortForReferentRegion: { type: Boolean, default: false, required: false },
  cleUpdateCohortForReferentRegionDate: { from: { type: Date }, to: { type: Date } },
  cleUpdateCohortForReferentDepartment: { type: Boolean, default: false, required: false },
  cleUpdateCohortForReferentDepartmentDate: { from: { type: Date }, to: { type: Date } },
  // CLE - display cohorts
  cleDisplayCohortsForAdminCLE: { type: Boolean, default: false, required: false },
  cleDisplayCohortsForAdminCLEDate: { from: { type: Date }, to: { type: Date } },
  cleDisplayCohortsForReferentClasse: { type: Boolean, default: false, required: false },
  cleDisplayCohortsForReferentClasseDate: { from: { type: Date }, to: { type: Date } },
  // CLE - update centers
  cleUpdateCentersForReferentRegion: { type: Boolean, default: false, required: false },
  cleUpdateCentersForReferentRegionDate: { from: { type: Date }, to: { type: Date } },
  cleUpdateCentersForReferentDepartment: { type: Boolean, default: false, required: false },
  cleUpdateCentersForReferentDepartmentDate: { from: { type: Date }, to: { type: Date } },
  // CLE - display centers
  cleDisplayCentersForAdminCLE: { type: Boolean, default: false, required: false },
  cleDisplayCentersForAdminCLEDate: { from: { type: Date }, to: { type: Date } },
  cleDisplayCentersForReferentClasse: { type: Boolean, default: false, required: false },
  cleDisplayCentersForReferentClasseDate: { from: { type: Date }, to: { type: Date } },
  // CLE - PDR
  cleDisplayPDRForAdminCLE: { type: Boolean, default: false, required: false },
  cleDisplayPDRForAdminCLEDate: { from: { type: Date }, to: { type: Date } },
  cleDisplayPDRForReferentClasse: { type: Boolean, default: false, required: false },
  cleDisplayPDRForReferentClasseDate: { from: { type: Date }, to: { type: Date } },

  validationDate: {
    type: Date,
    documentation: {
      description: "Date d'autoValidation du jeune (apèrs cette date, sa phase 1 est validée), par defaut 23h59",
    },
  },

  validationDateForTerminaleGrade: {
    type: Date,
    documentation: {
      description: "Date d'autoValidation d'un jeune en terminale (apèrs cette date, sa phase 1 est validée), par defaut 23h59",
    },
  },

  youngCheckinForAdmin: {
    type: Boolean,
    documentation: {
      description: "Ouverture du pointage des volontaires pour les modérateurs",
    },
  },
  youngCheckinForHeadOfCenter: {
    type: Boolean,
    documentation: {
      description: "Ouverture du pointage des volontaires pour les chefs de centre",
    },
  },
  youngCheckinForRegionReferent: {
    type: Boolean,
    documentation: {
      description: "Ouverture du pointage des volontaires pour les référents régionaux",
    },
  },
  youngCheckinForDepartmentReferent: {
    type: Boolean,
    documentation: {
      description: "Ouverture du pointage des volontaires pour les référents départementaux",
    },
  },

  busListAvailability: {
    type: Boolean,
    documentation: {
      description:
        " Ouverture ou fermeture de l’accès à la liste des volontaires d’un même centre par ligne de transport et par point de rassemblement envoyé par email (activation/désactivation du token)",
    },
  },

  sessionEditionOpenForReferentRegion: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Ouverture ou fermeture de l'édition des sessions pour les référents régionaux",
    },
  },

  sessionEditionOpenForReferentDepartment: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Ouverture ou fermeture de l'édition des sessions pour les référents départementaux",
    },
  },

  sessionEditionOpenForTransporter: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Ouverture ou fermeture de l'édition des sessions pour les transporteurs",
    },
  },

  pdrEditionOpenForReferentRegion: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Ouverture ou fermeture de l'édition des PDR pour les référents régionaux",
    },
  },

  pdrEditionOpenForReferentDepartment: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Ouverture ou fermeture de l'édition des PDR pour les référents départementaux",
    },
  },

  pdrEditionOpenForTransporter: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Ouverture ou fermeture de l'édition des PDR pour les transporteurs",
    },
  },

  informationsConvoyage: {
    editionOpenForReferentRegion: {
      type: Boolean,
      default: true,
      documentation: {
        description: "Ouverture ou fermeture de l'édition des informations de convoyage pour les référents régionaux",
      },
    },
    editionOpenForReferentDepartment: {
      type: Boolean,
      default: true,
      documentation: {
        description: "Ouverture ou fermeture de l'édition des informations de convoyage pour les référents départementaux",
      },
    },
    editionOpenForHeadOfCenter: {
      type: Boolean,
      default: true,
      documentation: {
        description: "Ouverture ou fermeture de l'édition des informations de convoyage pour les chefs de centre",
      },
    },
  },

  repartitionSchemaCreateAndEditGroupAvailability: {
    type: Boolean,
    documentation: {
      description: "Ouverture ou fermeture pour les utilisateurs de la possibilité de créer et modifier des groupes sur le schéma de répartition.",
    },
  },
  repartitionSchemaDownloadAvailability: {
    type: Boolean,
    documentation: {
      description: "Ouverture ou fermeture pour les utilisateurs de la possibilité de télécharger le schéma de répartition.",
    },
  },

  isTransportPlanCorrectionRequestOpen: {
    type: Boolean,
    documentation: {
      description: "Ouverture ou fermeture pour les référents régionaux de la possibilité de demander une correction du plan de transport.",
    },
  },

  schemaAccessForReferentRegion: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Autoriser ou bloquer l’accès à la consultation du schéma de répartition pour les référents régionaux",
    },
  },

  schemaAccessForReferentDepartment: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Autoriser ou bloquer l’accès à la consultation du schéma de répartition pour les référents départemts",
    },
  },

  busEditionOpenForTransporter: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Ouverture ou fermeture de l'édition des bus pour les transporteurs",
    },
  },

  //information n'impactant le fonctionnement de l'application
  uselessInformation: {
    type: mongoose.Schema.Types.Mixed,
    documentation: {
      description: "Information complémentaire non utilisée par l'application",
    },
  },

  daysToValidate: {
    type: Number,
    documentation: {
      description: "Nombre de jours nécessaire pour valider le séjour",
    },
  },

  daysToValidateForTerminalGrade: {
    type: Number,
    documentation: {
      description: "Nombre de jours pour valider le séjour pour les jeunes étant en Terminale",
    },
  },

  type: {
    type: String,
    enum: COHORT_TYPE_LIST,
    default: COHORT_TYPE.VOLONTAIRE,
    documentation: {
      description: "Type de la cohorte",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

schema.virtual("fromUser").set<SchemaExtended>(function (fromUser: UserSaved) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

schema.methods.getIsInstructionOpen = function (timeZoneOffset) {
  const now = getDateTimeByTimeZoneOffset(timeZoneOffset);
  const end = this.instructionEndDate;
  if (!end || isAfter(now, end)) return false;
  return true;
};

schema.virtual("isInstructionOpen").get<SchemaExtended>(function () {
  return this.getIsInstructionOpen();
});

schema.methods.getIsInscriptionOpen = function (timeZoneOffset) {
  const now = getDateTimeByTimeZoneOffset(timeZoneOffset);
  const start = this.inscriptionStartDate;
  const end = this.inscriptionEndDate;
  if (!start || !end || isAfter(start, end)) return false;
  return isWithinInterval(now, { start, end });
};

schema.virtual("isInscriptionOpen").get<SchemaExtended>(function () {
  return this.getIsInscriptionOpen();
});

schema.methods.getIsReInscriptionOpen = function (timeZoneOffset) {
  const now = getDateTimeByTimeZoneOffset(timeZoneOffset);
  const start = this.reInscriptionStartDate;
  const end = this.reInscriptionEndDate;
  if (!start || !end) return this.getIsInscriptionOpen(timeZoneOffset);
  if (isAfter(start, end)) return false;
  return isWithinInterval(now, { start, end });
};

schema.virtual("isReInscriptionOpen").get<SchemaExtended>(function () {
  return this.getIsReInscriptionOpen();
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

export type CohortType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type CohortDocument<T = {}> = DocumentExtended<CohortType & T>;
type SchemaExtended = CohortDocument &
  UserExtension & {
    // virtual fields
    isInscriptionOpen: boolean;
    isReInscriptionOpen: boolean;
    isInstructionOpen: boolean;
    getIsInscriptionOpen: () => void;
    getIsInstructionOpen: () => void;
    getIsReInscriptionOpen: () => void;
  };

export const CohortModel = mongoose.model<CohortDocument>(MODELNAME, schema);

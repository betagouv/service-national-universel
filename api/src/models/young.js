const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");
const sendinblue = require("../sendinblue");

const MODELNAME = "young";

const Schema = new mongoose.Schema({
  sqlId: { type: String, index: true },

  firstName: { type: String },
  lastName: { type: String },
  frenchNationality: { type: String, enum: ["true", "false"] },
  birthCountry: { type: String },
  email: { type: String, required: true, unique: true, trim: true },
  phone: { type: String },
  gender: { type: String },
  birthdateAt: { type: Date },
  cohort: { type: String, default: "2021", enum: ["2021", "2020", "2019"] },
  phase: { type: String, default: "INSCRIPTION", enum: ["INSCRIPTION", "COHESION_STAY", "INTEREST_MISSION"] },
  status: {
    type: String,
    default: "IN_PROGRESS",
    enum: ["IN_PROGRESS", "WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED", "REFUSED", "WITHDRAWN"],
  },
  statusPhase1: {
    type: String,
    default: "WAITING_AFFECTATION",
    enum: ["AFFECTED", "WAITING_AFFECTATION", "CANCEL", "DONE", "NOT_DONE"],
  },
  statusPhase2: {
    type: String,
    default: "WAITING_REALISATION",
    enum: ["WAITING_REALISATION", "IN_PROGRESS", "VALIDATED"],
  },
  statusPhase3: {
    type: String,
    enum: [],
  },
  lastStatusAt: { type: Date, default: Date.now },

  // keep track of the current inscription step
  inscriptionStep: {
    type: String,
    default: "COORDONNEES", // if the young is created, it passed the first step, so default is COORDONNEES
    enum: ["PROFIL", "COORDONNEES", "PARTICULIERES", "REPRESENTANTS", "CONSENTEMENTS", "MOTIVATIONS", "DONE"],
  },

  // keep track of the current cohesion inscription step for 2020 users
  cohesion2020Step: {
    type: String,
    default: "CONSENTEMENTS",
    enum: ["CONSENTEMENTS", "COORDONNEES", "PARTICULIERES", "JDC", "DONE"],
  },

  // userName and userId because it can be a young or a referent
  historic: {
    type: [
      {
        phase: String,
        createdAt: { type: Date, default: Date.now },
        userName: String,
        userId: String,
        status: String,
        note: { type: String, default: "" },
      },
    ],
    default: [],
  },

  password: { type: String, select: false },
  lastLoginAt: { type: Date, default: Date.now },
  forgotPasswordResetToken: { type: String, default: "" },
  forgotPasswordResetExpires: { type: Date },

  cniFiles: { type: [String], default: [] },

  // * phase1 infos
  cohesionStayPresence: { type: String, enum: ["true", "false"] },
  cohesionStayMedicalFileReceived: { type: String, enum: ["true", "false"] },

  // * address
  address: { type: String },
  complementAddress: { type: String },
  zip: { type: String },
  city: { type: String },
  department: { type: String },
  region: { type: String },
  location: { lat: Number, lon: Number },
  qpv: { type: String, enum: ["true", "false", ""], default: "" },

  // * School informations
  situation: { type: String },
  schoolCertification: { type: String, enum: ["true", "false"] },
  schooled: { type: String, enum: ["true", "false"] },
  schoolName: { type: String },
  schoolType: { type: String },
  schoolAddress: { type: String },
  schoolComplementAdresse: { type: String },
  schoolZip: { type: String },
  schoolCity: { type: String },
  schoolDepartment: { type: String },
  schoolRegion: { type: String },
  schoolLocation: { lat: Number, lon: Number },
  schoolId: { type: String },

  // * Parents et représentants
  parent1Status: { type: String },
  parent1FirstName: { type: String },
  parent1LastName: { type: String },
  parent1Email: { type: String },
  parent1Phone: { type: String },
  parent1OwnAddress: { type: String, enum: ["true", "false"] },
  parent1Address: { type: String },
  parent1ComplementAddress: { type: String },
  parent1Zip: { type: String },
  parent1City: { type: String },
  parent1Department: { type: String },
  parent1Region: { type: String },
  parent1Location: { lat: Number, lon: Number },
  parent1FromFranceConnect: { type: String, enum: ["true", "false"], default: "false" },

  parent2Status: { type: String },
  parent2FirstName: { type: String },
  parent2LastName: { type: String },
  parent2Email: { type: String },
  parent2Phone: { type: String },
  parent2OwnAddress: { type: String, enum: ["true", "false"] },
  parent2Address: { type: String },
  parent2ComplementAddress: { type: String },
  parent2Zip: { type: String },
  parent2City: { type: String },
  parent2Department: { type: String },
  parent2Region: { type: String },
  parent2Location: { lat: Number, lon: Number },
  parent2FromFranceConnect: { type: String, enum: ["true", "false"], default: "false" },

  // * Situations particulières
  handicap: { type: String, enum: ["true", "false"] },
  ppsBeneficiary: { type: String, enum: ["true", "false"] },
  paiBeneficiary: { type: String, enum: ["true", "false"] },

  medicosocialStructure: { type: String, enum: ["true", "false"] },
  medicosocialStructureName: { type: String },
  medicosocialStructureAddress: { type: String },
  medicosocialStructureComplementAddress: { type: String },
  medicosocialStructureZip: { type: String },
  medicosocialStructureCity: { type: String },
  medicosocialStructureDepartment: { type: String },
  medicosocialStructureRegion: { type: String },
  medicosocialStructureLocation: { lat: Number, lon: Number },

  engagedStructure: { type: String },
  specificAmenagment: { type: String, enum: ["true", "false"] },
  specificAmenagmentType: { type: String },

  highSkilledActivity: { type: String, enum: ["true", "false"] },
  highSkilledActivityType: { type: String },
  highSkilledActivityProofFiles: { type: [String] },

  // * Consentements
  parentConsentment: { type: String, enum: ["true", "false"] },
  parentConsentmentFiles: { type: [String], default: [] },
  parentConsentmentFilesCompliant: { type: String, enum: ["true", "false"] },
  parentConsentmentFilesCompliantInfo: { type: String },
  consentment: { type: String, enum: ["true", "false"] },
  imageRight: { type: String, enum: ["true", "false"] },
  imageRightFiles: { type: [String], default: [] },

  // * Motivations
  motivations: { type: String },

  // * Preferences
  domains: { type: [String], default: [] },
  professionnalProject: { type: String, enum: ["UNIFORM", "OTHER", "UNKNOWN"] },
  professionnalProjectPrecision: { type: String },
  period: { type: String, enum: ["DURING_HOLIDAYS", "DURING_SCHOOL"] },
  periodRanking: { type: [String] },
  mobilityNearSchool: { type: String, enum: ["true", "false"] },
  mobilityNearHome: { type: String, enum: ["true", "false"] },
  mobilityNearRelative: { type: String, enum: ["true", "false"] },
  mobilityNearRelativeName: { type: String },
  mobilityNearRelativeZip: { type: String },
  mobilityTransport: { type: [String] },
  mobilityTransportOther: { type: String },
  missionFormat: { type: String, enum: ["CONTINUOUS", "DISCONTINUOUS"] },
  engaged: { type: String, enum: ["true", "false"] },
  engagedDescription: { type: String },
  desiredLocation: { type: String },

  // TODO : clean interests
  defenseInterest: { type: String },
  defenseTypeInterest: { type: String },
  defenseDomainInterest: { type: String },
  defenseMotivationInterest: { type: String },
  securityInterest: { type: String },
  securityDomainInterest: { type: String },
  solidarityInterest: { type: String },
  healthInterest: { type: String },
  educationInterest: { type: String },
  cultureInterest: { type: String },
  sportInterest: { type: String },
  environmentInterest: { type: String },
  citizenshipInterest: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) {
    bcrypt.hash(this.password, 10, (e, hash) => {
      this.password = hash;
      return next();
    });
  } else {
    return next();
  }
});

Schema.methods.comparePassword = async function (p) {
  const user = await OBJ.findById(this._id).select("password");
  return bcrypt.compare(p, user.password || "");
};

//Sync with sendinblue
Schema.post("save", function (doc) {
  sendinblue.sync(doc, MODELNAME);
});
Schema.post("findOneAndUpdate", function (doc) {
  sendinblue.sync(doc, MODELNAME);
});
Schema.post("remove", function (doc) {
  sendinblue.unsync(doc);
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;

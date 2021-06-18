const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;
const esClient = require("../es");
const MODELNAME = "mission";

const Schema = new mongoose.Schema({
  sqlId: {
    type: String,
    index: true,
    documentation: {
      description: "(migration) Identifiant dans l'ancienne base de données",
    },
  }, // ID of the previous database
  sqlStructureId: {
    type: String,
    index: true,
    documentation: {
      description: "(migration) Identifiant de la structure dans l'ancienne base de données",
    },
  }, // ID of the previous database
  sqlTutorId: {
    type: String,
    index: true,
    documentation: {
      description: "(migration) Identifiant de l'utilisateur tuteur de mission dans l'ancienne base de données",
    },
  }, // ID of the previous database

  name: {
    type: String,
    required: true,
    documentation: {
      description: "Titre de la mission",
    },
  }, // OK
  domains: {
    type: [String],
    documentation: {
      description: "Liste des domaines de la mission (citoyenneté, sport, culture, ...)",
    },
  }, // OK

  startAt: {
    type: Date,
    documentation: {
      description: "Date du début de la mission",
    },
  }, // OK
  endAt: {
    type: Date,
    documentation: {
      description: "Date de fin de la mission",
    },
  }, // OK
  format: {
    type: String,
    default: "CONTINUOUS",
    enum: ["CONTINUOUS", "DISCONTINUOUS", "AUTONOMOUS"],
    documentation: {
      description: "Format de la mission",
    },
  },

  frequence: {
    type: String,
    documentation: {
      description: "Fréquence de la mission",
    },
  },
  period: {
    type: [String],
    documentation: {
      description: "Période de la mission (pendant les vacances scolaires, pendant l'année scolaire)",
    },
  },
  subPeriod: {
    type: [String],
    documentation: {
      description: "Période de la mission, détails",
    },
  },

  placesTotal: {
    type: Number,
    default: 1,
    documentation: {
      description: "Nombre de places total pour cette mission",
    },
  }, // OK
  placesLeft: {
    type: Number,
    default: 1,
    documentation: {
      description: "Nombre de places encore disponibles pour cette mission",
    },
  }, // OK

  actions: {
    type: String,
    documentation: {
      description: "Actions concrètes confiées au(x) volontaire(s)",
    },
  }, // OK
  description: {
    type: String,
    documentation: {
      description: "Description de la mission",
    },
  }, // OK
  justifications: {
    type: String,
    documentation: {
      description: "",
    },
  }, // OK
  contraintes: {
    type: String,
    documentation: {
      description: "Contraintes spécifiques pour la mission",
    },
  }, // OK

  structureId: {
    type: String,
    documentation: {
      description: "Identifiant de la structure proposant la mission",
    },
  }, // OK
  structureName: {
    type: String,
    documentation: {
      description: "Nom de la structure proposant la mission",
    },
  }, // OK ( slave data from structure)

  status: {
    type: String,
    default: "DRAFT",
    enum: ["DRAFT", "WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED", "REFUSED", "CANCEL", "ARCHIVED"],
    documentation: {
      description: "Statut de la mission",
    },
  },

  // structure_id: { type: String, required: true },
  // referent_id: { type: String, required: true },
  tutorId: {
    type: String,
    documentation: {
      description: "Identifiant de l'utilisateur tuteur de la mission",
    },
  },
  tutorName: {
    type: String,
    documentation: {
      description: "Prénom et nom de l'utilisateur tuteur de la mission",
    },
  },

  //

  // dates_infos: { type: String },
  // periodes: { type: String },
  // frequence: { type: String },
  // planning: { type: String },

  address: {
    type: String,
    documentation: {
      description: "Adresse du lieu où se déroule la mission",
    },
  },
  zip: {
    type: String,
    documentation: {
      description: "Code postal du lieu où se déroule la mission",
    },
  },
  city: {
    type: String,
    documentation: {
      description: "Ville où se déroule la mission",
    },
  },
  department: {
    type: String,
    documentation: {
      description: "Département où se déroule la mission",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Région où se déroule la mission",
    },
  },
  country: {
    type: String,
    documentation: {
      description: "",
    },
  },
  location: {
    lat: {
      type: Number,
    },
    lon: {
      type: Number,
    },
  },
  remote: {
    type: String,
    documentation: {
      description: "La mission peut se réaliser à distance",
    },
  },
  //
  //
  //
  // state: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.plugin(patchHistory, {
  mongoose,
  name: `${MODELNAME}Patches`,
  trackOriginalValue: true,
  includes: {
    modelName: { type: String, required: true, default: MODELNAME },
  },
});
Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;

/*

{
   "id":2234,
   "user_id":10090,
   "name":"TEST",
   "structure_id":2166,
   "tuteur_id":10080,
   "domaines":[
      "Solidarit\u00e9",
      "S\u00e9curit\u00e9",
      "Sant\u00e9"
   ],
   "participations_max":4,
   "ceu":null,
   "format":"Continue",

   "dates_infos":null,
   "periodes":[
      
   ],
   "frequence":null,
   "planning":null,
   "description":"TEST",
   "address":"Mauron",
   "zip":"56430",
   "city":"Mauron",
   "department":"56",
   "country":"France",
   "latitude":"48.0821",
   "longitude":"-2.28591",
   "is_everywhere":0,
   "actions":"TEST",
   "justifications":"TESTXS",
   "contraintes":null,
   "state":"En attente de validation",
   "created_at":"2020-12-02 15:01:52",
   "updated_at":"2020-12-06 11:45:42",
   "deleted_at":null,
   "youngs_count":0,
   "full_address":"Mauron 56430 Mauron",
   "places_left":4,
   "places_taken":0,
   "has_places_left":true,
   "structure":{
      "id":2166,
      "name":"TEST SEB",
      "logo":null,
      "full_address":",  ",
      "ceu":false,
      "members":[
         {
            "id":10080,
            "first_name":"Sebastien",
            "last_name":"Le Goff",
            "full_name":"Sebastien Le Goff",
            "avatar":null,
            "roles":{
               "admin":false,
               "referent":false,
               "referentRegion":false,
               "superviseur":false,
               "responsable":true,
               "tuteur":false
            },
            "has_user":false,
            "pivot":{
               "structure_id":2166,
               "profile_id":10080,
               "role":"responsable"
            },
            "structures":[
               {
                  "id":2166,
                  "name":"TEST SEB",
                  "logo":null,
                  "full_address":",  ",
                  "ceu":false,
                  "pivot":{
                     "profile_id":10080,
                     "structure_id":2166,
                     "role":"responsable"
                  }
               }
            ],
            "reseau":null
         }
      ]
   },
   "youngs":[
      
   ]
}

*/

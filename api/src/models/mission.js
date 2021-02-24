const mongoose = require("mongoose");

const mongoosastic = require("../es/mongoosastic");

const MODELNAME = "mission";

const Schema = new mongoose.Schema({
  sqlId: { type: String, index: true }, // ID of the previous database
  sqlStructureId: { type: String, index: true }, // ID of the previous database
  sqlTutorId: { type: String, index: true }, // ID of the previous database

  name: { type: String, required: true }, // OK
  domains: { type: [String] }, // OK

  startAt: { type: Date }, // OK
  endAt: { type: Date }, // OK
  format: { type: String, default: "CONTINUOUS", enum: ["CONTINUOUS", "DISCONTINUOUS", "AUTONOMOUS"] },
  frequence: { type: String },
  period: { type: [String] },

  placesTotal: { type: Number, default: 1 }, // OK
  placesLeft: { type: Number, default: 1 }, // OK
  placesTaken: { type: Number, default: 0 }, // OK

  actions: { type: String }, // OK
  description: { type: String }, // OK
  justifications: { type: String }, // OK
  contraintes: { type: String }, // OK

  structureId: { type: String }, // OK
  structureName: { type: String }, // OK ( slave data from structure)

  status: {
    type: String,
    default: "DRAFT",
    enum: ["DRAFT", "WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED", "REFUSED", "CANCEL", "ARCHIVED"],
  },

  // structure_id: { type: String, required: true },
  // referent_id: { type: String, required: true },
  tutorId: { type: String },
  tutorFirstName: { type: String },
  tutorLastName: { type: String },

  //

  // dates_infos: { type: String },
  // periodes: { type: String },
  // frequence: { type: String },
  // planning: { type: String },

  address: { type: String },
  zip: { type: String },
  city: { type: String },
  department: { type: String },
  region: { type: String },
  country: { type: String },
  location: {
    lat: { type: Number },
    lon: { type: Number },
  },
  remote: { type: String },
  //
  //
  //
  // state: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.plugin(mongoosastic, MODELNAME);

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

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const mongoosastic = require("../es/mongoosastic");
const sendinblue = require("../sendinblue");

const MODELNAME = "referent";

const Schema = new mongoose.Schema({
  sqlId: { type: String, index: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true, trim: true },

  password: { type: String, select: false },
  lastLoginAt: { type: Date },
  registredAt: { type: Date },

  forgotPasswordResetToken: { type: String, default: "" },
  forgotPasswordResetExpires: { type: Date },

  invitationToken: { type: String, default: "" },
  invitationExpires: { type: Date },

  role: { type: String, enum: ["admin", "referent_region", "referent_department"] },
  region: { type: String, default: "" },
  department: { type: String, default: "" },

  phone: { type: String },
  mobile: { type: String },

  structureId: { type: String },

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
Schema.plugin(mongoosastic, MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;

/*

{
   "id":10090,
   "name":"se.legoff@gmail.com",
   "email":"se.legoff@gmail.com",
   "context_role":"responsable",
   "created_at":"2020-12-02 14:37:10",
   "updated_at":"2020-12-02 14:37:10",
   "profile":{
      "id":10080,
      "user_id":10090,
      "first_name":"Sebastien",
      "last_name":"Le Goff",
      "email":"se.legoff@gmail.com",
      "phone":null,
      "mobile":"+33658469890",
      "reseau_id":null,
      "referent_department":null,
      "referent_region":null,
      "created_at":"2020-12-02 14:37:10",
      "updated_at":"2020-12-02 14:37:29",
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
      "has_user":true,
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
}

*/

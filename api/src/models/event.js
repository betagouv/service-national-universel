const mongoose = require("mongoose");

const MODELNAME = "event";

const Schema = new mongoose.Schema({
  userType: {
    type: String,
    documentation: {
      description: "young ou referent",
    },
  },
  userId: {
    type: String,
  },
  category: {
    type: String,
  },
  action: {
    type: String,
  },
  value: {
    type: String,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;

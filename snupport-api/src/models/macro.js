const mongoose = require("mongoose");

const MODELNAME = "macro";

const Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    documentation: {
      description: "nom de la macro",
    },
  },
  description: {
    type: String,
    // @todo make required after updates
    // required: true,
    documentation: {
      description: "description de la macro",
    },
  },
  macroAction: {
    type: [{ value: String, field: String, action: String }],
    required: true,
    documentation: {
      description: "ensemble des actions à effectuer par la macro",
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // only taken into account if the macro is applied to one ticket (not on ticket list page)
  sendCurrentMessage: {
    type: Boolean,
    default: false,
  },
  // whether or not to stay on current page or redirects to ticket list (inbox) (keep preview open or not)
  stayOnCurrentPage: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: new mongoose.Schema({
    _id: { type: mongoose.Types.ObjectId, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["AGENT", "ADMIN", "REFERENT_DEPARTMENT", "REFERENT_REGION"],
    },
  }),
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;

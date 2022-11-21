const mongoose = require("mongoose");

const { ROLES_LIST } = require("snu-lib");

const Note = new mongoose.Schema({
  phase: {
    type: String,
    enum: ["INSCRIPTION", "PHASE_1", "PHASE_2", "PHASE_3", ""],
  },
  note: { type: String, required: true, maxLength: 500 },
  referent: new mongoose.Schema({
    _id: { type: mongoose.Types.ObjectId, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      enum: ROLES_LIST,
      required: true,
    },
  }),
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});

module.exports = Note;

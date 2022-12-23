const mongoose = require("mongoose");

module.exports = mongoose.model("structure_patches", new mongoose.Schema({}, { collection: "structure_patches" }));

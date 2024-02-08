const mongoose = require("mongoose");

module.exports = mongoose.model("classe_patches", new mongoose.Schema({}, { collection: "classe_patches" }));

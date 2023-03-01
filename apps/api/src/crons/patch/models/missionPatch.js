const mongoose = require("mongoose");

module.exports = mongoose.model("mission_patches", new mongoose.Schema({}, { collection: "mission_patches" }));

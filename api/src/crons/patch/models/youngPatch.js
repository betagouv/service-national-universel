const mongoose = require("mongoose");

module.exports = mongoose.model("young_patches", new mongoose.Schema({}, { collection: "young_patches" }));

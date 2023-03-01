const mongoose = require("mongoose");

module.exports = mongoose.model("application_patches", new mongoose.Schema({}, { collection: "application_patches" }));

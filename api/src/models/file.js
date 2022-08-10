const mongoose = require("mongoose");

const File = new mongoose.Schema({
  name: String,
  uploadedAt: Date,
  size: Number,
  mimetype: String,
});

module.exports = File;

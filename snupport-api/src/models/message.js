const mongoose = require("mongoose");

const MODELNAME = "message";

const Schema = new mongoose.Schema({
  ticketId: { type: String, required: true },

  text: { type: String },
  slateContent: {},
  rawText: { type: String },
  rawTextHtml: { type: String },
  messageId: { type: String, documentation: { description: "Message id de l'email" } },

  authorId: { type: String, documentation: { description: "Id de l'auteur. Peut etre l'agent ou le contact" } },

  authorFirstName: { type: String },

  authorLastName: { type: String },

  createdAt: { type: Date, default: Date.now },

  fromEmail: { type: String },
  toEmail: { type: String },
  copyRecipient: {
    type: [String],
    documentation: {
      description: "Contacts en copie du mail",
    },
  },
  attachments: {
    type: [{ name: String, url: String, path: String }],
    documentation: { description: "Pièces jointes" },
  },
  files: {
    type: [{ name: String, url: String, path: String }],
    documentation: { description: "Pièces jointes" },
  },
  subject: { type: String },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;

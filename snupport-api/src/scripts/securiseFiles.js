require("dotenv").config({ path: "./../../.env-prod" });
require("../mongo");
const MessageModel = require("../models/message");
const { getFile, uploadAttachment } = require("../utils");
const { encrypt } = require("../utils/crypto");
const { config } = require("../config");
const { getS3Path } = require("../utils/file");

async function process(message, count, total) {
  if (count % 10 === 0) console.log(count, "/", total);
  const files = [];
  for (const attachment of message.attachments) {
    // download file
    try {
      const downloadedFile = await getFile(attachment.path, config.PUBLIC_BUCKET_NAME_SUPPORT);

      const path = getS3Path(attachment.name);

      // encode file
      const encryptedBuffer = encrypt(downloadedFile.Body);
      const encryptedFile = { mimetype: downloadedFile.ContentType, encoding: "7bit", data: encryptedBuffer };

      // upload file
      const url = await uploadAttachment(path, encryptedFile);

      files.push({ name: attachment.name, url, path });
    } catch (error) {
      console.log("file download error", error);
    }
  }
  // update / save model
  message.files = files;
  await message.save();
}

async function findAll(Model, where, cb) {
  let count = 0;
  const total = await Model.countDocuments(where);
  return Model.find(where)
    .cursor()
    .addCursorFlag("noCursorTimeout", true)
    .eachAsync(async (doc) => {
      try {
        await cb(doc, count++, total);
      } catch (e) {
        console.log("e", e);
      }
    });
}

(async () => {
  try {
    await findAll(MessageModel, { attachments: { $exists: true, $not: { $size: 0 } } }, process);
  } catch (e) {
    console.error(e);
  }
})();

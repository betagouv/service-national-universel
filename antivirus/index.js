const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const Joi = require("joi");
const NodeClam = require("clamscan");

const { initSentry, capture } = require("./sentry");

const { PORT: port, RELEASE, CLAMSCAN_CONFIG } = require("./config.js");

const app = express();

const registerSentryErrorHandler = initSentry(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const ERRORS = {
  SERVER_ERROR: "SERVER_ERROR",
  FILE_INFECTED: "FILE_INFECTED",
  INVALID_PARAMS: "INVALID_PARAMS",
}

app.get("/release", (req, res) => {
  res.send(`${RELEASE}`);
});

function validate_request(req) {
   return Joi.object({
    file : Joi.object({
      name: Joi.string().required(),
      data: Joi.binary().required(),
      tempFilePath: Joi.string().allow("").optional(),
    }).unknown()
  })
  .validate(
    req.files,
    { stripUnknown: true },
  );
}

app.post("/scan",
  fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req, res) => {
    try {
      const { error: filesError, value: files } = validate_request(req)
      if (filesError) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const clamscan = await new NodeClam().init(CLAMSCAN_CONFIG);
      const { isInfected } = await clamscan.isInfected(files.file.tempFilePath);

      fs.unlinkSync(files.file.tempFilePath);

      if (isInfected) {
        console.error(`File ${files.file.tempFilePath} is infected`);
        return res.status(403).send({ ok: false, code: ERRORS.FILE_INFECTED });
      }

      return res.status(200).send({ ok: true });
    } catch (error) {
      console.error(error);
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }
);

registerSentryErrorHandler();

app.listen(port, () => {
  console.log(`Application listening on port ${port}`);
});

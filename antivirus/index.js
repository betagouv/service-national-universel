const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const Joi = require("joi");
const NodeClam = require("clamscan");
const authMiddleware = require("./middlewares/authMiddleware");
const authController = require("./controllers/authController");

const { initSentry, capture } = require("./sentry");

const { PORT: port, RELEASE, CLAMSCAN_CONFIG } = require("./config");

const app = express();

const registerSentryErrorHandler = initSentry(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const ERRORS = {
  SERVER_ERROR: "SERVER_ERROR",
  INVALID_PARAMS: "INVALID_PARAMS",
};

app.use("/auth", authController);

app.get("/", async (req, res) => {
  const d = new Date();
  res.status(200).send("ANTIVIRUS " + d.toLocaleString());
});

app.get("/release", (req, res) => {
  res.send(`${RELEASE}`);
});

function validate_request(req) {
  return Joi.object({
    file: Joi.object({
      name: Joi.string().required(),
      data: Joi.binary().required(),
      tempFilePath: Joi.string().allow("").optional(),
    }).unknown(),
  }).validate(req.files, { stripUnknown: true });
}

app.post(
  "/scan",
  authMiddleware,
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: "/tmp/",
  }),
  async (req, res) => {
    try {
      const { error: filesError, value: files } = validate_request(req);
      if (filesError) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const clamscan = await new NodeClam().init(CLAMSCAN_CONFIG);

      const { isInfected } = await clamscan.isInfected(files.file.tempFilePath);

      if (isInfected) {
        console.error(`File ${files.file.tempFilePath} is infected`);
        return res.status(200).send({ ok: true, infected: true });
      }

      return res.status(200).send({ ok: true, infected: false });
    } catch (error) {
      console.error(error);
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

registerSentryErrorHandler();

app.listen(port, () => {
  console.log(`Application listening on port ${port}`);
});

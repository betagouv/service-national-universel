const { initSentry } = require("./sentry");

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const logger = require("morgan");
const passport = require("passport");
const { errorHandler } = require("./middlewares/errorHandler");
const { validationErrorHandler } = require("./middlewares/validation");
require("./mongo");
require("./imap");
require("./utils/ventilation");
require("./crons");

const { config } = require("./config");

const app = express();
const registerSentryErrorHandler = initSentry(app);
app.use(helmet());

console.log("ENVIRONMENT:", config.ENVIRONMENT);
app.use(logger("dev"));

const origin = [config.SNU_URL_APP, config.SNU_URL_ADMIN, config.SNUPPORT_URL_KB, config.SNUPPORT_URL_ADMIN];
if (config.ENVIRONMENT === "development") {
  origin.push(config.KNOWLEDGE_BASE_PUBLIC_URL);
}
app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    credentials: true,
    origin,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Referer", "User-Agent", "sentry-trace", "baggage"],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.text({ type: "application/x-ndjson" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } })); // 10 Mo
app.use(express.static(__dirname + "/../public"));

app.use(passport.initialize());

app.use("/agent", require("./controllers/agent"));
app.use("/ticket", require("./controllers/ticket"));
app.use("/message", require("./controllers/message"));
app.use("/folder", require("./controllers/folder"));
app.use("/contact", require("./controllers/contact"));
app.use("/organisation", require("./controllers/organisation"));
app.use("/tag", require("./controllers/tag"));
app.use("/shortcut", require("./controllers/shortcut"));
app.use("/macro", require("./controllers/macro"));
app.use("/ventilation", require("./controllers/ventilation"));
app.use("/knowledge-base", require("./controllers/knowledgeBase"));
app.use("/kb-search", require("./controllers/kbSearch"));
app.use("/template", require("./controllers/template"));
app.use("/feedback", require("./controllers/feedback"));

app.use("/v0/message", require("./controllers/v0/message"));
app.use("/v0/contact", require("./controllers/v0/contact"));
app.use("/v0/ticket", require("./controllers/v0/ticket"));
app.use("/v0/sso", require("./controllers/v0/sso"));
app.use("/v0/referent", require("./controllers/v0/referent"));

app.use(validationErrorHandler);
registerSentryErrorHandler();
app.use(errorHandler);

app.get("/", async (req, res) => {
  const d = new Date();
  res.status(200).send("SNU " + d.toLocaleString());
});

require("./passport")();

app.listen(config.PORT, () => console.log("Listening on port " + config.PORT));

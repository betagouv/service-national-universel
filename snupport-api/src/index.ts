const { initSentry } = require("./sentry");

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const logger = require("morgan");
const passport = require("passport");
const { errorHandler } = require("./middlewares/errorHandler");
const { validationErrorHandler } = require("./middlewares/validation");
const { applyJsonBodyParser } = require("./middlewares/httpHardening");
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

// L'admin SNU et moncompte n'appellent jamais snupport-api directement (tout passe par l'api v1,
// authentifiée par clé d'API) : leur ouvrir le CORS avec credentials faisait d'une XSS dans l'un de
// ces fronts une session d'agent support (FM19, audit des fronts du 23/09/2026).
const origin = [config.SNUPPORT_URL_KB, config.SNUPPORT_URL_ADMIN];
if (config.ENVIRONMENT === "development") {
  origin.push(config.KNOWLEDGE_BASE_PUBLIC_URL);
}
applyJsonBodyParser(app);
app.use(
  cors({
    credentials: true,
    origin,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Referer", "User-Agent", "sentry-trace", "baggage"],
  })
);
app.use(bodyParser.text({ type: "application/x-ndjson" }));
// Pas de parseur urlencoded : aucun client n'en envoie, et c'est le corps qu'un formulaire HTML
// d'un autre sous-domaine peut poster sans preflight (CSRF, FL11).

app.use(cookieParser());
// Pas de parseur multipart global : il est monté sur les seules routes qui reçoivent des fichiers
// (middlewares/attachmentUpload.js).
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
app.use("/v0/knowledge-base", require("./controllers/v0/knowledgeBase"));

app.use(validationErrorHandler);
registerSentryErrorHandler();
app.use(errorHandler);

app.get("/", async (req, res) => {
  const d = new Date();
  res.status(200).send("SNU " + d.toLocaleString());
});

require("./passport")();

app.listen(config.PORT, () => console.log("Listening on port " + config.PORT));

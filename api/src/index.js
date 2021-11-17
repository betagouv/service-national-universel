require("dotenv").config({ path: "./.env-staging" });

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const logger = require("morgan");
require("./mongo");

const { PORT, APP_URL, ADMIN_URL, SUPPORT_URL, ENVIRONMENT } = require("./config.js");

if (process.env.NODE_ENV !== "test") {
  console.log("APP_URL", APP_URL);
  console.log("ADMIN_URL", ADMIN_URL);
  console.log("SUPPORT_URL", SUPPORT_URL);
  console.log("ENVIRONMENT: ", ENVIRONMENT);
}

const app = express();
app.use(helmet());

if (ENVIRONMENT === "development") {
  app.use(logger("dev"));
}

function handleError(err, req, res, next) {
  const output = {
    error: {
      name: err.name,
      message: err.message,
      text: err.toString(),
    },
  };
  const statusCode = err.status || 500;
  res.status(statusCode).json(output);
}

const origin = [APP_URL, ADMIN_URL, SUPPORT_URL, "https://inscription.snu.gouv.fr"];
app.use(cors({ credentials: true, origin }));
app.use(bodyParser.json());
app.use(bodyParser.text({ type: "application/x-ndjson" }));
app.use(bodyParser.urlencoded({ extended: true }));

require("./crons");
app.use(cookieParser());
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } })); // 10 Mo
app.use(express.static(__dirname + "/../public"));

app.use("/es", require("./controllers/es"));
app.use("/mission", require("./controllers/mission"));
app.use("/structure", require("./controllers/structure"));
app.use("/young", require("./controllers/young/index"));
app.use("/referent", require("./controllers/referent"));
app.use("/application", require("./controllers/application"));
app.use("/contract", require("./controllers/contract"));
app.use("/program", require("./controllers/program"));
app.use("/event", require("./controllers/event"));
app.use("/inscription-goal", require("./controllers/inscription-goal"));
app.use("/cohort-session", require("./controllers/cohort-session"));
app.use("/department-service", require("./controllers/department-service"));
app.use("/waiting-list", require("./controllers/waiting-list"));
app.use("/cohesion-center", require("./controllers/cohesion-center"));
app.use("/email", require("./controllers/email"));
app.use("/meeting-point", require("./controllers/meeting-point"));
app.use("/diagoriente", require("./controllers/diagoriente"));
app.use("/bus", require("./controllers/bus"));
app.use("/support-center", require("./controllers/support-center"));
app.use(handleError);

app.get("/", async (req, res) => {
  const d = new Date();
  res.status(200).send("SNU " + d.toLocaleString());
});

require("./passport")(app);

app.listen(PORT, () => console.log("Listening on port " + PORT));

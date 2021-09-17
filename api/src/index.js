require("dotenv").config({ path: "./.env-staging" });

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const fetch = require("node-fetch");
const helmet = require("helmet");
require("./mongo");

const { PORT, APP_URL, ADMIN_URL, ENVIRONMENT } = require("./config.js");

if (process.env.NODE_ENV !== "test") {
  console.log("APP_URL", APP_URL);
  console.log("ADMIN_URL", ADMIN_URL);
  console.log("ENVIRONMENT: ", ENVIRONMENT);
}

const app = express();
app.use(helmet());

const origin = [APP_URL, ADMIN_URL];
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
app.use("/inscription-goal", require("./controllers/inscription-goal"));
app.use("/department-service", require("./controllers/department-service"));
app.use("/waiting-list", require("./controllers/waiting-list"));
app.use("/cohesion-center", require("./controllers/cohesion-center"));
app.use("/email", require("./controllers/email"));
app.use("/meeting-point", require("./controllers/meeting-point"));
app.use("/diagoriente", require("./controllers/diagoriente"));
app.use("/bus", require("./controllers/bus"));

(async () => {
  const res = await fetch('http://92.222.24.89/api/v1/users', {
    method: "GET",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer t2t18-3PuTGA_SWqVBrzwAzWQCN8Obd2G0s58OCK-yE6cnrdHGcyZwQQbQvUdFVm` },
  });
  console.log('RESPONSE', res);
  if (!res.ok) console.log('OH NOOO...', res.error);
  console.log('YEAAAAH ! 🎉', res.ok);
})();

app.get("/", async (req, res) => {
  const d = new Date();
  res.status(200).send("SNU " + d.toLocaleString());
});

require("./passport")(app);

app.listen(PORT, () => console.log("Listening on port " + PORT));

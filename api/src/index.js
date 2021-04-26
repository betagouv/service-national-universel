require("dotenv").config({ path: "./.env-staging" });

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
require("./mongo");

const { PORT, APP_URL, ADMIN_URL, MONGO_URL } = require("./config.js");

console.log("MONGO_URL", MONGO_URL);
console.log("APP_URL, ADMIN_URL", APP_URL, ADMIN_URL);

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
app.use("/young", require("./controllers/young"));
app.use("/referent", require("./controllers/referent"));
app.use("/application", require("./controllers/application"));
app.use("/program", require("./controllers/program"));
app.use("/inscription-goal", require("./controllers/inscription-goal"));
app.use("/waiting-list", require("./controllers/waiting-list"));

app.get("/", async (req, res) => {
  const d = new Date();
  res.status(200).send("COUCOU " + d.toLocaleString());
});

require("./passport")(app);

app.listen(PORT, () => console.log("Listening on port " + PORT));

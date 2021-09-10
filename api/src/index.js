require("dotenv").config({ path: "./.env-staging" });

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
require("./mongo");

const { PORT, APP_URL, ADMIN_URL, ENVIRONMENT } = require("./config.js");

if (process.env.NODE_ENV !== "test") {
  console.log("APP_URL", APP_URL);
  console.log("ADMIN_URL", ADMIN_URL);
  console.log("ENVIRONMENT: ", ENVIRONMENT);
}

const app = express();
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        "default-src": "'self'",
        "base-uri": "'self'",
        "font-src": ["'self'", "https:", "data:"],
        "frame-ancestors": "'self'",
        "img-src": ["'self'", "data:"],
        "object-src": "'none'",
        "script-src": ["'self'", "https://code.jquery.com/jquery-2.1.4.min.js", "https://support.selego.co/assets/chat/chat.min.js"],
        "script-src-attr": "'none'",
        "style-src": ["'self'", "https:"],
        "upgrade-insecure-requests": [],
        "navigate-to": [
          "'self'",
          "https:",
          "https://www.snu.gouv.fr/",
          "https://snu.crisp.help/",
          "https://inscription.snu.gouv.fr/",
          "https://www.gouvernement.fr/",
          "https://www.education.gouv.fr/",
          "http://jeunes.gouv.fr/",
          "https://presaje.sga.defense.gouv.fr/",
          "https://www.service-public.fr/",
          "https://www.legifrance.gouv.fr/",
          "https://www.data.gouv.fr/",
          "https://facebook.com/",
          "https://twitter.com/",
          "https://instagram.com/",
          "https://cellar-c2.services.clever-cloud.com/",
          "https://franceconnect.gouv.fr/",
          "https://apicivique.s3.eu-west-3.amazonaws.com/",
          "https://www.youtube.com/",
          "https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/",
          "https://api-adresse.data.gouv.fr/",
          "http://majdc.fr",
          "https://www.ameli.fr/",
        ],
      },
    },
  })
);
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

app.get("/", async (req, res) => {
  const d = new Date();
  res.status(200).send("SNU " + d.toLocaleString());
});

require("./passport")(app);

app.listen(PORT, () => console.log("Listening on port " + PORT));

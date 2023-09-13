require("dotenv").config();

const helmet = require("helmet");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const { initSentry, capture } = require("./sentry");

const { PORT } = require("./config.js");

const app = express();

const registerSentryErrorHandler = initSentry(app);

app.use(helmet());
app.use(helmet.hsts({ maxAge: 5184000 }));

require("./crons");

// @todo: can it be removed?
const origin = ["http://localhost:8085"];
app.use(cors({ credentials: true, origin }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.text({ type: "application/x-ndjson" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/log", require("./controllers/log"));
app.use("/stats", require("./controllers/stats"));
app.use("/auth", require("./controllers/auth"));

app.get("/", async (req, res) => {
  try {
    res.status(200).send("OK");
  } catch (error) {
    console.log("Error ", error);
    capture(error);
  }
});

app.get("/testsentry", async () => {
  try {
    throw new Error("Intentional error");
  } catch (error) {
    console.log("Error ");
    capture(error);
  }
});

registerSentryErrorHandler();

app.listen(PORT, () => console.log("Listening on port " + PORT));

require("dotenv").config();
const helmet = require("helmet");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");

const { PORT } = require("./config.js");

const app = express();

app.use(helmet());
app.use(helmet.hsts({ maxAge: 5184000 }));

// @todo: can it be removed?
const origin = ["http://localhost:8085"];
app.use(cors({ credentials: true, origin }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.text({ type: "application/x-ndjson" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/log", require("./controllers/log"));

app.get("/", async (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => console.log("Listening on port " + PORT));

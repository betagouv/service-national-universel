const express = require("express");
const path = require("path");
const hsts = require("hsts");
const { forceDomain } = require("forcedomain");
const helmet = require("helmet");

const app = express();
const port = 8080;

app.use(
  forceDomain({
    hostname: "admin.snu.gouv.fr",
    protocol: "https",
    excludeRule: /[a-zA-Z0-9-]+\.cleverapps\.io/,
  })
);

app.use(hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
app.use(express.static(path.join(__dirname, "../build")));

app.route("*").all((req, res) => {
  res.status(200).sendFile(path.join(__dirname, "/../build/index.html"));
});

app.listen(port, () => {
  console.log(`App listening at port:${port}`);
});

const express = require("express");
const path = require("path");
const hsts = require("hsts");
const { forceDomain } = require("forcedomain");

const app = express();
const port = 8080;

app.use(hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
app.use(express.static(path.join(__dirname, "../build")));
app.use(
  forceDomain({
    hostname: "candidature.snu.gouv.fr",
    protocol: "https",
  })
);

app.route("*").all((req, res) => {
  console.log(req.headers.host);
  res.status(200).sendFile(path.join(__dirname, "/../build/index.html"));
});

app.listen(port, () => {
  console.log(`App listening at port:${port}`);
});

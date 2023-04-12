const express = require("express");
const path = require("path");
const hsts = require("hsts");
const { forceDomain } = require("forcedomain");
const helmet = require("helmet");

const app = express();
const port = 8080;

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'strict-dynamic'",
        "https://www.snu.gouv.fr/mentions-legales/",
        "https://plausible.io/",
        "https://plausible.io/js/script.manual.outbound-links.file-downloads.js",
      ],
      scriptSrcElem: ["'self'", "'unsafe-inline'", "https://plausible.io"],
      connectSrc: ["'self'", "https://sentry.selego.co", "https://plausible.io"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      reportUri: "/csp-report",
    },
  }),
);

if (process.env.PROD) {
  app.use(
    forceDomain({
      hostname: "admin.snu.gouv.fr",
      protocol: "https",
    }),
  );
}

if (process.env.STAGING) {
  app.use(
    forceDomain({
      hostname: "admin.beta-snu.dev",
      protocol: "https",
    }),
  );
}

app.use(hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
app.use(express.static(path.join(__dirname, "../build")));

app.route("*").all((req, res) => {
  res.status(200).sendFile(path.join(__dirname, "/../build/index.html"));
});

app.listen(port, () => {
  console.log(`App listening at port:${port}`);
});

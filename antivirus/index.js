require("dotenv").config({ path: "./.env" });

const express = require("express");
const bodyParser = require("body-parser");

const { initSentry, capture } = require("./sentry");

const { PORT: port, RELEASE } = require("./config.js");

const app = express();

const registerSentryErrorHandler = initSentry(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/release", (req, res) => {
  res.send(`${RELEASE}`);
});

app.post("/render", async (req, res) => {
  try {
    const random = Math.random();
    console.time("RENDERING " + random);
    const buffer = await renderFromHtml(req.body.html, req.body.options || {});
    if (!buffer)
      throw new Error("No buffer returned : " + JSON.stringify(req.body));
    if (GENERATE_LOCALLY)
      fs.writeFileSync(
        `generated/${new Date().toISOString()}_test.pdf`,
        buffer
      );
    res.contentType("application/pdf");
    res.setHeader("Content-Dispositon", 'inline; filename="test.pdf"');
    res.set("Cache-Control", "public, max-age=1");
    res.send(buffer);
    console.timeEnd("RENDERING " + random);
  } catch (error) {
    console.log(error);
    capture(error);
    res.status(500).send({ ok: false, error });
  }
});

registerSentryErrorHandler();

app.listen(port, () => {
  console.log(`Application listening on port ${port}`);
});

(async function () {
  require("dotenv").config({ path: "./.env" });

  const express = require("express");
  const puppeteer = require("puppeteer");
  const bodyParser = require("body-parser");

  const { initSentry, capture } = require("./sentry");

  require("events").EventEmitter.defaultMaxListeners = 30; // Fix warning node

  const fs = require("fs");

  const { PORT: port, GENERATE_LOCALLY } = require("./config");

  const initBrowser = async () => {
    try {
      return await puppeteer.launch({ headless: "new" });
    } catch (error) {
      capture(error);
      throw error;
    }
  };

  const browser = await initBrowser();

  const app = express();

  const registerSentryErrorHandler = initSentry(app);

  app.use(bodyParser.json());

  app.use(bodyParser.urlencoded({ extended: true }));

  const DEFAULT_OPTIONS = {
    format: "A4",
    margin: 0,
  };

  const renderFromHtml = async (html, options) => {
    let buffer;
    const page = await browser.newPage();
    try {
      if (options?.emulateMedia) {
        await page.emulateMediaType(options.emulateMedia);
      }
      await page.setContent(html, options?.navigation ?? {});
      const pdfOptions = options ?? {};
      buffer = await page.pdf({
        ...DEFAULT_OPTIONS,
        ...pdfOptions,
      });
    } finally {
      await page.close();
    }

    return buffer;
  };

  app.use(express.static(__dirname + "/public"));

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.post("/render", async (req, res) => {
    try {
      const random = Math.random();
      console.time("RENDERING " + random);
      const buffer = await renderFromHtml(
        req.body.html,
        req.body.options || {}
      );
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
    console.log(`Example app listening on port ${port}`);
  });
})();

(async function () {
  require("dotenv").config({ path: "./.env" });

  const express = require("express");
  const puppeteer = require("puppeteer");
  const bodyParser = require("body-parser");

  const { initSentry, capture } = require("./sentry");

  require("events").EventEmitter.defaultMaxListeners = 30; // Fix warning node

  const fs = require("fs");

  const { PORT: port, GENERATE_LOCALLY } = require("./config.js");

  const ERRORS = {
    SERVER_ERROR: "SERVER_ERROR",
  };

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

  const renderFromHtml = async (page, html, options) => {
    if (options?.emulateMedia) {
      await page.emulateMediaType(options.emulateMedia);
    }

    await page.setContent(html, options?.navigation ?? {});
    const pdfOptions = options ?? {};
    const stream = await page.createPDFStream({
      ...DEFAULT_OPTIONS,
      ...pdfOptions,
    });

    return stream;
  };

  app.use(express.static(__dirname + "/public"));

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.post("/render", async (req, res) => {
    let page;
    try {
      const random = Math.random();
      console.time("RENDERING " + random);

      page = await browser.newPage();
      const stream = await renderFromHtml(
        page,
        req.body.html,
        req.body.options || {}
      );
      if (!stream)
        throw new Error("No stream returned : " + JSON.stringify(req.body));
      if (GENERATE_LOCALLY) {
        fs.writeFileSync(
          `generated/${new Date().toISOString()}_test.pdf`,
          stream
        );
      }
      res.contentType("application/pdf");
      res.setHeader("Content-Dispositon", 'inline; filename="test.pdf"');
      res.set("Cache-Control", "public, max-age=1");
      console.log("begin pipe");
      stream
        .on("end", () => {
          console.log("stream_end: page.close");
          page.close();
        })
        .on("error", (err) => {
          capture(err);
          console.log("stream_error: page.close");
          page.close();
        })
        .pipe(res);
      console.log("end pipe");
      console.timeEnd("RENDERING " + random);
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  });

  registerSentryErrorHandler();

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
})();

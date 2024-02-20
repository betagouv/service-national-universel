require("dotenv").config({ path: "./.env" });

const express = require("express");
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");

const { initSentry, capture } = require("./sentry");

require("events").EventEmitter.defaultMaxListeners = 30; // Fix warning node

const fs = require("fs");

const { PORT: port, GENERATE_LOCALLY } = require("./config.js");

const app = express();

const registerSentryErrorHandler = initSentry(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const DEFAULT_OPTIONS = {
  format: "A4",
  margin: 0,
};

const renderFromHtml = async (html, options) => {
  console.log("Rendering HTML to PDF with options:", options);
  try {
    const { browser, page } = await getBrowserAndPage(options);
    await page.setContent(html, options?.navigation ?? {});
    const pdfOptions = options ?? {};
    console.log("Generating PDF with options:", pdfOptions);
    const buffer = await page.pdf({
      ...DEFAULT_OPTIONS,
      ...pdfOptions,
    });

    await browser.close();

    return buffer;
  } catch (error) {
    console.log("Error rendering HTML to PDF:", error);
    capture(error);
  }
};

const getBrowserAndPage = async (options) => {
  try {
    console.log("Launching browser with options:", options?.launch);
    const browser = await puppeteer.launch(
      options?.launch ?? { headless: "new" }
    );
    const page = await browser.newPage();

    if (options?.emulateMedia) {
      await page.emulateMediaType(options.emulateMedia);
    }

    return { browser, page };
  } catch (error) {
    console.log("Error launching browser:", error);
    capture(error);
  }
};

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/render", async (req, res) => {
  console.log("Rendering PDF with body:", req.body);
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
  console.log(`Example app listening on port ${port}`);
});

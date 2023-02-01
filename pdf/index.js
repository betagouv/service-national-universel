require("dotenv").config({ path: "./.env" });

const express = require("express");
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");
const { initSentry, capture } = require("./sentry");

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
  try {
    const { browser, page } = await getBrowserAndPage(options);
    await page.setContent(html, options?.navigation ?? {});
    const pdfOptions = options ?? {};
    const buffer = await page.pdf({
      ...DEFAULT_OPTIONS,
      ...pdfOptions,
    });

    await browser.close();

    return buffer;
  } catch (error) {
    console.log(error);
    capture(error);
  }
};

const getBrowserAndPage = async (options) => {
  try {
    const browser = await puppeteer.launch(options?.launch ?? {});
    const page = await browser.newPage();

    if (options?.emulateMedia) {
      await page.emulateMediaType(options.emulateMedia);
    }

    return { browser, page };
  } catch (error) {
    console.log(error);
    capture(error);
  }
};

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/render", async (req, res) => {
  try {
    const buffer = await renderFromHtml(
      req.body.html.replace(
        /http(.*?)\/css\/style\.css/,
        "https://app-a2524146-ef53-4802-9027-80e4e0e79565.cleverapps.io/style.css"
      ),
      req.body.options || {}
    );
    if (!buffer)
      throw new Error("No buffer returned : " + JSON.stringify(req.body));
    // console.log(`${req.body.html} generated`);
    if (GENERATE_LOCALLY)
      fs.writeFileSync(
        `generated/${new Date().toISOString()}_test.pdf`,
        buffer
      );
    res.contentType("application/pdf");
    res.setHeader("Content-Dispositon", 'inline; filename="test.pdf"');
    res.set("Cache-Control", "public, max-age=1");
    res.send(buffer);
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

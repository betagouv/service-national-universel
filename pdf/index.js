const express = require('express')
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");
const app = express()
const port = process.env.PORT || 8087;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const DEFAULT_OPTIONS = {
  format: "A4",
  margin: 0,
};

const renderFromHtml = async (html, options) => {
  const { browser, page } = await getBrowserAndPage(options);
  await page.setContent(html, options?.navigation ?? {});
  const pdfOptions = options ?? {};
  const buffer = await page.pdf({
    ...DEFAULT_OPTIONS,
    ...pdfOptions,
  });

  await browser.close();

  return buffer;
};

const getBrowserAndPage = async (options) => {
  const browser = await puppeteer.launch(options?.launch ?? {});
  const page = await browser.newPage();

  if (options?.emulateMedia) {
    await page.emulateMediaType(options.emulateMedia);
  }

  return { browser, page };
};

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/render', (req, res) => {
  const buffer = renderFromHtml(req.body.html, req.body.options || {});
  console.log(req.body.html);
  console.log(buffer);
  res.contentType("application/pdf");
  res.setHeader("Content-Dispositon", 'inline; filename="test.pdf"');
  res.set("Cache-Control", "public, max-age=1");
  res.send(buffer);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

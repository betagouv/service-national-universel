const puppeteer = require("puppeteer");

const DEFAULT_OPTIONS = {
  format: "A4",
  margin: 0,
};

const renderFromHtml = async (html, options) => {
  console.log("--renderFromHtml 1--");
  const { browser, page } = await getBrowserAndPage(options);
  console.log("--renderFromHtml 2--");
  await page.setContent(html, options?.navigation ?? {});
  console.log("--renderFromHtml 3--");
  const pdfOptions = options ?? {};
  const buffer = await page.pdf({
    ...DEFAULT_OPTIONS,
    ...pdfOptions,
  });
  console.log("--renderFromHtml 4--");

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

module.exports = renderFromHtml;

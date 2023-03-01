const puppeteer = require("puppeteer");

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

module.exports = renderFromHtml;

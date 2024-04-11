const config = require("../config");
const { ERRORS } = require("../utils");
const fetch = require("node-fetch");

export const generatePdf = async (html: string) => {
  const pdfResponse = await fetch(config.API_PDF_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/pdf" },
    body: JSON.stringify({ html, options: { landscape: true } }),
  });

  if (pdfResponse.status !== 200) {
    throw new Error(ERRORS.PDF_ERROR);
  }

  return await pdfResponse.buffer();
};

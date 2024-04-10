const { API_PDF_ENDPOINT } = require("../config");
const { timeout } = require("../utils");
const { capture } = require("../sentry");
const { ERRORS } = require("./index");
const fetch = require("node-fetch");
const PDFDocument = require("pdfkit");

const TIMEOUT_PDF_SERVICE = 15000;

const certificate = require("../templates/certificate");
const form = require("../templates/form");
const convocation = require("../templates/convocation");
const contractPhase2 = require("../templates/contractPhase2");
const droitImage = require("../templates/droitImage");

const certifPhase1 = require("../templates/certificate/phase1");

async function getHtmlTemplate(type, template, young, contract) {
  if (type === "certificate" && template === "1") return await certificate.phase1(young); // WIP
  if (type === "certificate" && template === "2") return certificate.phase2(young);
  if (type === "certificate" && template === "3") return certificate.phase3(young);
  if (type === "certificate" && template === "snu") return certificate.snu(young);
  if (type === "form" && template === "imageRight") return form.imageRight(young);
  if (type === "convocation" && template === "cohesion") return convocation.cohesion(young);
  if (type === "contract" && template === "2" && contract) return contractPhase2.render(contract);
  if (type === "droitImage" && template === "droitImage") return droitImage.render(young);
  throw new Error("Not implemented");
}

function stream2buffer(stream) {
  return new Promise((resolve, reject) => {
    const buf = [];
    stream.on("data", (chunk) => buf.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(buf)));
    stream.on("error", (err) => reject(err));
  });
}

async function htmlToPdfStream(html, options) {
  const _getPDF = async () => {
    const response = await fetch(API_PDF_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/pdf" },
      body: JSON.stringify({ html, options }),
    });
    if (response.status && response.status !== 200) {
      throw new Error("PDF_BAD_RESPONSE");
    }
    return response.body;
  };

  try {
    return await timeout(_getPDF(), TIMEOUT_PDF_SERVICE);
  } catch (error) {
    capture(error);
    throw new Error(ERRORS.PDF_ERROR);
  }
}

async function htmlToPdfBuffer(html, options) {
  const stream = await htmlToPdfStream(html, options);

  return stream2buffer(stream);
}

async function generatePdfIntoStream(outStream, { type, template, young, contract }) {
  if (type === "certificate" && template === "1" && young) {

    const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 0 });
    doc.pipe(outStream);
    await certifPhase1.generate(doc, young);
    doc.end();

  } else {
    const html = await getHtmlTemplate(type, template, young, contract);
    if (!html) {
      throw new Error(ERRORS.NOT_FOUND);
    }

    const options = type === "certificate" ? { landscape: true } : { format: "A4", margin: 0 };
    const inStream = await htmlToPdfStream(html, options);
    inStream.pipe(outStream);
  }
}

//   res.set({
//     "content-length": response.headers.get("content-length"),
//     "content-disposition": `inline; filename="test.pdf"`,
//     "content-type": "application/pdf",
//     "cache-control": "public, max-age=1",
//   });

async function generatePdfIntoBuffer({ type, template, young, contract }) {
  const html = await getHtmlTemplate(type, template, young, contract);
  if (!html) {
    throw new Error(ERRORS.NOT_FOUND);
  }

  const options = type === "certificate" ? { landscape: true } : { format: "A4", margin: 0 };
  const stream = await htmlToPdfStream(html, options);

  return stream2buffer(stream);
}

module.exports = { generatePdfIntoStream, generatePdfIntoBuffer, htmlToPdfBuffer };

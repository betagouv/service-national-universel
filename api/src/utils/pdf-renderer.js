const path = require("path");
const { Writable } = require('node:stream');
const { Buffer } = require('node:buffer');
const { pipeline, finished } = require('node:stream/promises');
const fs = require("fs").promises;
const { API_PDF_ENDPOINT, IMAGES_ROOTDIR } = require("../config");
const { timeout, getFile } = require("../utils");
const { capture } = require("../sentry");
const { ERRORS } = require("./index");
const fetch = require("node-fetch");
const { MINISTRES } = require("snu-lib");

const TIMEOUT_PDF_SERVICE = 15000;

const contractPhase2 = require("../templates/contractPhase2");

const { generateCertifPhase1 } = require("../templates/certificate/phase1");
const { generateCertifPhase2 } = require("../templates/certificate/phase2");
const { generateCertifPhase3 } = require("../templates/certificate/phase3");
const { generateCertifSNU } = require("../templates/certificate/snu");
const { generateDroitImage } = require("../templates/droitImage/droitImage");
const { generateCohesion } = require("../templates/convocation/cohesion");

async function getHtmlTemplate(type, template, young, contract) {
  if (type === "contract" && template === "2" && contract) return contractPhase2.render(contract);
  throw new Error("Not implemented");
}

class InMemoryWritable extends Writable {
  constructor(options) {
    super(options);
    this.chunks = [];
  }

  toBuffer() {
    return Buffer.concat(this.chunks);
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    callback();
  }
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

async function generatePdfIntoStream(outStream, { type, template, young, contract }) {
  if (type === "certificate" && template === "1" && young) {
    return await generateCertifPhase1(outStream, young);
  }
  if (type === "certificate" && template === "2" && young) {
    return generateCertifPhase2(outStream, young);
  }
  if (type === "certificate" && template === "3" && young) {
    return generateCertifPhase3(outStream, young);
  }
  if (type === "certificate" && template === "snu" && young) {
    return generateCertifSNU(outStream, young);
  }
  if (type === "droitImage" && template === "droitImage" && young) {
    return generateDroitImage(outStream, young);
  }
  if (type === "convocation" && template === "cohesion" && young) {
    return generateCohesion(outStream, young);
  }
  const html = await getHtmlTemplate(type, template, young, contract);
  if (!html) {
    throw new Error(ERRORS.NOT_FOUND);
  }

  const options = type === "certificate" ? { landscape: true } : { format: "A4", margin: 0 };
  const inStream = await htmlToPdfStream(html, options);
  await pipeline(inStream, outStream);
}

async function generatePdfIntoBuffer(options) {
  const stream = new InMemoryWritable();
  await generatePdfIntoStream(stream, options);
  await finished(stream);
  return stream.toBuffer();
}

async function getTemplate(template) {
  const _path = path.join(IMAGES_ROOTDIR, template);
  try {
    const handle = await fs.open(_path, "wx");
    console.log(`Downloading ${template}`);
    // Download locally certificate template
    // in order to make them available for pdf generation
    const downloaded = await getFile(template);


    await handle.writeFile(downloaded.Body);
    await handle.close();
  } catch (err) {
    if (err.code != "EEXIST") {
      throw err;
    }
  }
}

async function getAllPdfTemplates() {
  await fs.mkdir(path.join(IMAGES_ROOTDIR, "certificates"), { recursive: true });
  const ministres = [...MINISTRES].reverse(); // Most recent first
  for (const m of ministres) {
    await getTemplate(m.template);
  }

  await fs.mkdir(path.join(IMAGES_ROOTDIR, "convocation"), { recursive: true });
  for (const convoc of [
    "convocation/convocation_template_base_2024_V2.png",
    "convocation/convocation_template_base_NC.png",
  ]) {
    await getTemplate(convoc);
  }
}

module.exports = { getAllPdfTemplates, generatePdfIntoStream, generatePdfIntoBuffer };

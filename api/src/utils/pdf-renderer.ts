import { ContractType, YoungType, MINISTRES } from "snu-lib";
import path from "path";
import { logger } from "../logger";
import { Writable } from "node:stream";
import { Buffer } from "node:buffer";
import { finished } from "node:stream/promises";
import fs from "fs/promises";
import { config } from "../config";
import { getFile } from "../utils";
import { ERRORS } from "./index";

import { generateCertifPhase1 } from "../templates/certificate/phase1";
import { generateCertifPhase2 } from "../templates/certificate/phase2";
import { generateCertifPhase3 } from "../templates/certificate/phase3";
import { generateCertifSNU } from "../templates/certificate/snu";
import { generateDroitImage, generateBatchDroitImage } from "../templates/droitImage/droitImage";
import { generateContractPhase2 } from "../templates/contract/phase2";
import { generateBatchConsentement } from "../templates/consent/consent";

class InMemoryWritable extends Writable {
  chunks: Buffer[] = [];

  constructor(options) {
    super(options);
  }

  toBuffer() {
    return Buffer.concat(this.chunks);
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    callback();
  }
}

export async function generatePdfIntoStream(outStream, { type, template, young, contract }: { type: string; template: string; young?: YoungType; contract?: ContractType }) {
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
  if (type === "contract" && template === "2" && contract) {
    return generateContractPhase2(outStream, contract);
  }
  if (type === "image_right_batch" && template === "droitImage" && young) {
    return generateBatchDroitImage(outStream, young);
  }
  if (type === "consent_batch" && template === "consentement" && young) {
    return generateBatchConsentement(outStream, young);
  }
  throw new Error(ERRORS.NOT_FOUND);
}

export async function generatePdfIntoBuffer(options) {
  const stream = new InMemoryWritable({});
  await generatePdfIntoStream(stream, options);
  await finished(stream);
  return stream.toBuffer();
}

async function getTemplate(template) {
  const _path = path.join(config.IMAGES_ROOTDIR, template);
  try {
    const handle = await fs.open(_path, "wx");
    logger.debug(`Downloading ${template}`);
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

export async function getAllPdfTemplates() {
  await fs.mkdir(path.join(config.IMAGES_ROOTDIR, "certificates"), { recursive: true });
  const ministres = [...MINISTRES].reverse(); // Most recent first
  for (const m of ministres) {
    await getTemplate(m.template);
  }

  await fs.mkdir(path.join(config.IMAGES_ROOTDIR, "convocation"), { recursive: true });
  for (const convoc of ["convocation/convocation_template_base_2024_V3.png", "convocation/convocation_template_base_NC.png"]) {
    await getTemplate(convoc);
  }
}

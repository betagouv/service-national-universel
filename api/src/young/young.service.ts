import { YoungType } from "./young.type";
import { capture } from "../sentry";
import { YOUNG_DOCUMENT, YOUNG_DOCUMENT_PHASE_TEMPLATE } from "./youngDocument";

const YoungModel = require("../models/young");
const { getHtmlTemplate } = require("../templates/utils");
const { generatePdf } = require("../document/document.service");

export type YoungPdfWithUniqueName = {
  buffer: Buffer;
  youngName: string;
};

export const generateCertificateForMultipleYoungs = async (youngs: YoungType[]) => {
  const youngPdfPromises = youngs.map(async (young) => {
    try {
      return await generateCertificateByYoung(young);
    } catch (error) {
      capture(`Failed to generate certificate for young: ${young._id}`);
      return null;
    }
  });

  const filteredYoungPdfPromises = await Promise.all(youngPdfPromises).then((youngPdfs) => youngPdfs.filter((youngPdf) => youngPdf !== null));
  console.log(`Number of pdfs requested : ${youngs.length} - Filtered Young with pdf files : ${filteredYoungPdfPromises.length}`);
  return filteredYoungPdfPromises;
};

export const generateCertificateByYoung = async (young: YoungType): Promise<YoungPdfWithUniqueName> => {
  const youngHtml = await getHtmlTemplate(YOUNG_DOCUMENT.CERTIFICATE, YOUNG_DOCUMENT_PHASE_TEMPLATE.PHASE_1, young);
  const youngBuffer = await generatePdf(youngHtml);
  return { buffer: youngBuffer, youngName: buildUniqueName(young) };
};

export const buildUniqueName = (young: YoungType) => `${young.firstName}-${young.lastName}-${young._id}`;

export const findYoungsByClasseId = async (classeId: string): Promise<YoungType[]> => {
  return YoungModel.find({ classeId });
};

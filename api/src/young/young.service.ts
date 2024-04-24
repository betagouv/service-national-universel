import { YoungType } from "./young.type";
import { YOUNG_DOCUMENT, YOUNG_DOCUMENT_PHASE_TEMPLATE } from "./youngDocument";

const YoungModel = require("../models/young");
const { generatePdfIntoBuffer } = require("../utils/pdf-renderer");

type YoungPdf = {
  buffer: Buffer;
};

export const generateConvocationsForMultipleYoungs = async (youngs: YoungType[]): Promise<YoungPdf[]> => {
  return await generatePdfIntoBuffer({
    type: YOUNG_DOCUMENT.CONVOCATION_BATCH,
    template: YOUNG_DOCUMENT_PHASE_TEMPLATE.COHESION,
    young: youngs,
  });
};

export const findYoungsByClasseId = async (classeId: string): Promise<YoungType[]> => {
  return YoungModel.find({ classeId });
};

import { YOUNG_DOCUMENT, YOUNG_DOCUMENT_PHASE_TEMPLATE } from "./youngDocument";
import YoungModel from "../models/young";
import { YoungType } from "./young.type";
import { generatePdfIntoBuffer } from "../utils/pdf-renderer";

export const generateConvocationsForMultipleYoungs = async (youngs: YoungType[]): Promise<Buffer> => {
  return await generatePdfIntoBuffer({
    type: YOUNG_DOCUMENT.CONVOCATION_BATCH,
    template: YOUNG_DOCUMENT_PHASE_TEMPLATE.COHESION,
    young: youngs,
  });
};

export const findYoungsByClasseId = async (classeId: string): Promise<YoungType[]> => {
  return YoungModel.find({ classeId });
};

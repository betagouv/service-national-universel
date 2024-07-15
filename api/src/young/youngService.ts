import { YOUNG_DOCUMENT, YOUNG_DOCUMENT_PHASE_TEMPLATE } from "./youngDocument";
import { YoungModel } from "../models";
import { YoungDto } from "snu-lib/src/dto/youngDto";
import { generatePdfIntoBuffer } from "../utils/pdf-renderer";

export const generateConvocationsForMultipleYoungs = async (youngs: YoungDto[]): Promise<Buffer> => {
  return await generatePdfIntoBuffer({
    type: YOUNG_DOCUMENT.CONVOCATION_BATCH,
    template: YOUNG_DOCUMENT_PHASE_TEMPLATE.COHESION,
    young: youngs,
  });
};

export const findYoungsByClasseId = async (classeId: string): Promise<YoungDto[]> => {
  return YoungModel.find({ classeId });
};

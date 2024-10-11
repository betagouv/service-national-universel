import Joi from "joi";
import { ImportPointDeRassemblementRoute } from "./pointDeRassemblementImport";

export const pdrImportBodySchema = Joi.object<ImportPointDeRassemblementRoute["payload"]>({
  pdrFilePath: Joi.string().required(),
});

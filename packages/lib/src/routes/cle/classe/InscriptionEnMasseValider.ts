import { ClasseImportEnMasseValidationDto } from "../../../dto/classeImportEnMasseValidationDto";
import { ColumnsMapping } from "../../../constants/cle/classeImportEnMasse";
import { BasicRoute, RouteResponseBodyV2 } from "../..";

export interface InscriptionEnMasseValiderRoute extends BasicRoute {
  method: "POST";
  path: "/classe/{id}/inscription-en-masse/valider";
  params: {
    id: string;
  };
  file: File;
  payload: {
    mapping: ColumnsMapping | null;
  };
  response: RouteResponseBodyV2<ClasseImportEnMasseValidationDto>;
}

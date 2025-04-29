import { CLASSE_IMPORT_EN_MASSE_COLUMNS } from "snu-lib";

export interface ValidationError {
    column: string;
    line?: number;
    code: string;
    message?: string;
}

import { FindClassePourPublic } from "src/admin/core/sejours/cle/classe/useCase/FindClassePourPublic";
import { VerifierClasse } from "src/admin/core/sejours/cle/classe/useCase/VerifierClasse";
import { GetReferentDepToBeNotified } from "src/admin/core/sejours/cle/referent/useCase/GetReferentDepToBeNotified";
import { InviterReferentClasse } from "src/admin/core/sejours/cle/referent/useCase/InviteReferentClasse";

export const useCaseProvider = [
    VerifierClasse,
    GetReferentDepToBeNotified,
    FindClassePourPublic,
    InviterReferentClasse,
];

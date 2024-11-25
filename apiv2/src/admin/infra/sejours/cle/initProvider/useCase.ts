import { FindClassePourPublic } from "@admin/core/sejours/cle/classe/useCase/FindClassePourPublic";
import { VerifierClasse } from "@admin/core/sejours/cle/classe/useCase/VerifierClasse";
import { GetReferentDepToBeNotified } from "@admin/core/sejours/cle/referent/useCase/GetReferentDepToBeNotified";
import { InviterReferentClasse } from "@admin/core/sejours/cle/referent/useCase/InviteReferentClasse";

export const useCaseProvider = [
    VerifierClasse,
    GetReferentDepToBeNotified,
    FindClassePourPublic,
    InviterReferentClasse,
];

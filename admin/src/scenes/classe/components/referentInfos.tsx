import React from "react";
import { Container, InputText } from "@snu/ds/admin";
import { Classe } from "@/types";

export default function ReferentInfos({ classe }: { classe: Classe }) {
  return (
    <Container title="Référent de classe" actions={[]}>
      <div className="flex items-stretch justify-stretch">
        <div className="flex-1">
          <InputText name="refName" className="mb-3" value={classe.referents[0].lastName} label={"Nom"} disabled={true} />
          <InputText name="refFirstName" className="mb-3" value={classe.referents[0].firstName} label={"Prénom"} disabled={true} />
        </div>
        <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
        <div className="flex-1">
          <InputText name="refMail" className="mb-3" label={"Adresse Email"} value={classe.referents[0].email} disabled={true} />
        </div>
      </div>
    </Container>
  );
}

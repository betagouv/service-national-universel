import React from "react";
import { Link } from "react-router-dom";

import { ROLES, ClassesRoutes } from "snu-lib";
import { Container, InputText, Label, Select, Button } from "@snu/ds/admin";
import { User } from "@/types";

import { Rights, InfoBus } from "./types";

interface Props {
  classe: NonNullable<ClassesRoutes["GetOne"]["response"]["data"]>;
  rights: Rights;
  user: User;
  infoBus: InfoBus | null;
}

export default function SejourInfos({ classe, rights, user }: Props) {
  return (
    <Container title="Séjour">
      <div className="flex items-stretch justify-stretch">
        {rights.showCenter && (
          <div className="flex-1">
            <Label title="Centre" name="centre" />
            <Select
              className="mb-3"
              readOnly
              disabled
              placeholder={![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role) ? "Choisissez un centre existant" : "Non renseigné"}
              options={[]}
              value={classe.cohesionCenter?.name ? { value: classe.cohesionCenter.name, label: classe.cohesionCenter.name } : null}
            />
            {classe.cohesionCenter && (
              <>
                <InputText name="centerAddress" className="mb-3" label="Numéro et nom de la voie" value={classe.cohesionCenter.address || ""} disabled />
                <div className="flex items-center justify-between gap-3 mb-3">
                  <InputText name="centerZip" className="flex-1" label="Code Postal" value={classe.cohesionCenter.zip || ""} disabled />
                  <InputText name="centerCity" className="flex-1" label="Ville" value={classe.cohesionCenter.city || ""} disabled />
                </div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <InputText name="centerDepartment" className="flex-1" label="Département" value={classe.cohesionCenter.department || ""} disabled />
                  <InputText name="centerRegion" className="flex-1" label="Région" value={classe.cohesionCenter.region || ""} disabled />
                </div>
                <Link to={`/centre/${classe.cohesionCenterId}`} className="w-full">
                  <Button type="tertiary" title="Voir le centre" className="w-full max-w-none" />
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </Container>
  );
}

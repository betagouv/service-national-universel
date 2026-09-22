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

export default function SejourInfos({ classe, rights, user, infoBus }: Props) {
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
                {![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role) && (
                  <Link to={`/centre/` + classe.cohesionCenter._id} className="w-full">
                    <Button type="tertiary" title="Voir le centre" className="w-full max-w-none" />
                  </Link>
                )}
              </>
            )}
          </div>
        )}
        {rights.showCenter && rights.showPDR && <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>}
        {rights.showPDR && (
          <div className="flex-1">
            <Label title="Point de rassemblement" name="pdr" />
            <Select
              className="mb-3"
              readOnly
              disabled
              placeholder={![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role) ? "Choisissez un point de rassemblement existant" : "Non renseigné"}
              options={[]}
              value={
                classe.pointDeRassemblement?.name && classe.pointDeRassemblement?.department
                  ? { value: classe.pointDeRassemblement._id, label: `${classe.pointDeRassemblement.name}, ${classe.pointDeRassemblement.department}` }
                  : null
              }
            />
            {classe.pointDeRassemblement && (
              <>
                <InputText name="pdrAddress" className="mb-3" label="Numéro et nom de la voie" value={classe.pointDeRassemblement?.address} disabled />
                <div className="flex items-center justify-between gap-3 mb-3">
                  <InputText name="pdrZip" className="flex-1" label="Code Postal" value={classe.pointDeRassemblement?.zip} disabled />
                  <InputText name="pdrCity" className="flex-1" label="Ville" value={classe.pointDeRassemblement?.city} disabled />
                </div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <InputText name="pdrDepartment" className="flex-1" label="Département" value={classe.pointDeRassemblement?.department} disabled />
                  <InputText name="pdrRegion" className="flex-1" label="Région" value={classe.pointDeRassemblement?.region} disabled />
                </div>
                {![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role) && (
                  <Link to={`/point-de-rassemblement/` + classe.pointDeRassemblement._id} className="w-full">
                    <Button type="tertiary" title="Voir le point de rassemblement" className="w-full max-w-none" />
                  </Link>
                )}
              </>
            )}
            {infoBus && (
              <div className="mt-3">
                <Label title="Transport" name="ligneBus" />
                <InputText name="busNumber" className="mb-3" label="Numéro de transport" value={infoBus.busId} disabled />
                <Label title="Aller" name="Aller" />
                <div className="flex gap-3">
                  <InputText name="busDepartDate" className="mb-3" label="Date&nbsp;de&nbsp;départ" value={infoBus.departureDate} disabled />
                  <InputText name="busPdrHour" className="mb-3" label="Heure&nbsp;de&nbsp;convocation" value={infoBus.meetingHour} disabled />
                  <InputText name="busDepartHour" className="mb-3" label="Heure&nbsp;de&nbsp;départ" value={infoBus.departureHour} disabled />
                </div>
                <Label title="Retour" name="Retour" />
                <div className="flex gap-3 w-full">
                  <InputText name="busRetrunDate" className="mb-3 w-1/2" label="Date&nbsp;de&nbsp;retour" value={infoBus.returnDate} disabled />
                  <InputText name="busReturnHour" className="mb-3 w-1/2" label="Heure&nbsp;de&nbsp;retour" value={infoBus.returnHour} disabled />
                </div>

                {![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role) && (
                  <Link to={`/ligne-de-bus/` + classe.ligneId} className="w-full">
                    <Button type="tertiary" title="Voir la ligne de bus" className="w-full max-w-none" />
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
}

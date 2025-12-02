import React from "react";
import { Link } from "react-router-dom";
import { HiOutlinePencil } from "react-icons/hi";

import { ROLES, ClassesRoutes } from "snu-lib";
import { Container, Button, Label, InputText, Select } from "@snu/ds/admin";
import { User } from "@/types";
import { searchSessions, searchPointDeRassemblements } from "../utils";

import { Rights, InfoBus } from "./types";

interface Props {
  classe: NonNullable<ClassesRoutes["GetOne"]["response"]["data"]>;
  setClasse: (classe: NonNullable<ClassesRoutes["GetOne"]["response"]["data"]>) => void;
  editStay: boolean;
  setEditStay: (edit: boolean) => void;
  errors: { [key: string]: string };
  rights: Rights;
  user: User;
  onCancel: () => void;
  infoBus: InfoBus | null;
  isLoading: boolean;
  onSendInfo: () => void;
}

export default function SejourInfos({ classe, setClasse, editStay, setEditStay, errors, rights, user, onCancel, infoBus, isLoading, onSendInfo }: Props) {
  const containerActionList = ({ edit, setEdit, canEdit }) => {
    if (edit) {
      return [
        <div key="actions" className="flex items-center justify-end ml-6">
          <Button key="cancel" type="cancel" title="Annuler" onClick={onCancel} disabled={isLoading} />
          <Button key="validate" type="primary" title="Valider" className={"!h-8 ml-2"} onClick={onSendInfo} loading={isLoading} disabled={isLoading} />
        </div>,
      ];
    } else if (canEdit) {
      return [];
    } else {
      return [];
    }
  };

  return (
    <Container
      title="Séjour"
      actions={containerActionList({
        edit: editStay,
        setEdit: setEditStay,
        canEdit: rights.canEditCenter || rights.canEditPDR,
      })}>
      <div className="flex items-stretch justify-stretch">
        {rights.showCenter && (
          <div className="flex-1">
            <Label
              title="Centre"
              name="centre"
              tooltip={
                ![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role)
                  ? "vous devez indiquez la cohorte avant d'indiquer le centre, si la cohorte séléctionner est CLE 23 24, vous ne pourrez associer aucun centre"
                  : null
              }
            />
            <Select
              isAsync
              className="mb-3"
              placeholder={![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role) ? "Choisissez un centre existant" : "Non renseigné"}
              loadOptions={(q) => searchSessions({ q, cohort: classe.cohort })}
              defaultOptions={() => searchSessions({ q: "", cohort: classe.cohort })}
              noOptionsMessage={"Aucun centre ne correspond à cette recherche"}
              isClearable={true}
              closeMenuOnSelect={true}
              value={classe.cohesionCenter?.name ? { value: classe.cohesionCenter.name, label: classe.cohesionCenter.name } : null}
              onChange={(option) =>
                setClasse({
                  ...classe,
                  session: option?.session,
                  sessionId: option?._id,
                  cohesionCenter: option?.session.cohesionCenter,
                  cohesionCenterId: option?.session.cohesionCenter._id,
                })
              }
              error={errors.session}
              isActive={editStay && rights.canEditCenter}
              readOnly={!editStay || !rights.canEditCenter}
              disabled={!rights.canEditCenter || classe?.cohort === "CLE 23-24"}
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

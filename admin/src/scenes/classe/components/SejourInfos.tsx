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
      return [<Button key="change" type="modify" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" onClick={() => setEdit(!edit)} disabled={isLoading} />];
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
            <Label
              title="Point de rassemblement"
              name="pdr"
              tooltip={
                ![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role)
                  ? "Le point de rassemblement est automatiquement pré rempli avec l'adresse de l'établissement, vous pouvez le modifier si besoin"
                  : null
              }
            />
            <Select
              isAsync
              className="mb-3"
              placeholder={![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role) ? "Choisissez un point de rassemblement existant" : "Non renseigné"}
              loadOptions={(q) => searchPointDeRassemblements({ q, cohort: classe.cohort })}
              defaultOptions={() =>
                searchPointDeRassemblements({
                  q: classe.etablissement?.name,
                  cohort: classe.cohort,
                })
              }
              noOptionsMessage={"Aucun point de rassemblement ne correspond à cette recherche"}
              isClearable={true}
              closeMenuOnSelect={true}
              value={
                classe.pointDeRassemblement?.name && classe.pointDeRassemblement?.department
                  ? { value: classe.pointDeRassemblement._id, label: `${classe.pointDeRassemblement.name}, ${classe.pointDeRassemblement.department}` }
                  : null
              }
              onChange={(option) =>
                setClasse({
                  ...classe,
                  pointDeRassemblement: option?.pointDeRassemblement,
                  pointDeRassemblementId: option?._id,
                })
              }
              error={errors.pointDeRassemblement}
              isActive={editStay && rights.canEditPDR}
              readOnly={!editStay || !rights.canEditPDR}
              disabled={!rights.canEditPDR || classe?.cohort === "CLE 23-24"}
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

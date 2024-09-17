import React from "react";
import { Link } from "react-router-dom";
import { HiOutlinePencil } from "react-icons/hi";

import { translate, ROLES, translateGrade, formatDateFRTimezoneUTC, CohortDto, ClassesRoutes } from "snu-lib";
import { Container, Button, Label, InputText, Select } from "@snu/ds/admin";
import { User } from "@/types";
import { Rights } from "./types";
import { colorOptions, filiereOptions, gradeOptions, typeOptions } from "../utils";
import WithdrawButton from "./WithdrawButton";
interface Props {
  classe: NonNullable<ClassesRoutes["GetOne"]["response"]["data"]>;
  setClasse: (classe: ClassesRoutes["GetOne"]["response"]["data"]) => void;
  edit: boolean;
  setEdit: (edit: boolean) => void;
  errors: { [key: string]: string };
  rights: Rights;
  cohorts: CohortDto[];
  user: User;
  isLoading: boolean;
  setIsLoading: (b: boolean) => void;
  onCancel: () => void;
  onCheckInfo: () => void;
  validatedYoung: number;
}

export default function GeneralInfos({ classe, setClasse, edit, setEdit, errors, rights, cohorts, user, isLoading, setIsLoading, onCancel, onCheckInfo, validatedYoung }: Props) {
  const containerActionList = ({ edit, setEdit, canEdit }) => {
    if (edit) {
      return [
        <div key="actions" className="flex items-center justify-end ml-6">
          <Button key="cancel" type="cancel" title="Annuler" onClick={onCancel} disabled={isLoading} />
          <Button key="validate" type="primary" title="Valider" className={"!h-8 ml-2"} onClick={onCheckInfo} loading={isLoading} disabled={isLoading} />
        </div>,
      ];
    } else if (canEdit) {
      return [<Button key="change" type="modify" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" onClick={() => setEdit(!edit)} disabled={isLoading} />];
    } else {
      return [];
    }
  };

  const isUserCLE = [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role);
  const isUserAdminOrReferent = [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role);

  const linkPath = isUserCLE ? "/mes-eleves" : "/inscription";
  const showButton = (isUserCLE && classe.schoolYear === "2024-2025") || isUserAdminOrReferent;

  return (
    <Container title="Informations générales" actions={containerActionList({ edit, setEdit, canEdit: rights.canEdit })}>
      <div className="flex items-stretch justify-stretch">
        <div className="flex-1">
          <Label title="Numéro d’identification" name="identification" />
          <InputText name="identification" className="flex-1 mb-3" value={classe.uniqueKeyAndId} disabled />
          <Label title="Nom de la classe engagée" name="Class-name" tooltip="Identité du groupe formé." />
          <InputText
            name="nameClasse"
            className="flex-1 mb-3"
            value={classe.name || ""}
            onChange={(e) => setClasse({ ...classe, name: e.target.value })}
            error={errors.name}
            readOnly={!edit}
            active={edit}
          />
          <Label title="Effectif prévisionnel" name="estimatedSeats" tooltip="Nombre d'élèves prévisionnel de la classe" />
          <InputText
            name="estimatedSeats"
            className="flex-1 mb-3"
            value={classe.estimatedSeats.toString()}
            disabled={!rights.canEditEstimatedSeats}
            onChange={(e) => setClasse({ ...classe, estimatedSeats: Number(e.target.value) })}
            readOnly={!edit}
            active={edit}
            error={errors.estimatedSeats}
          />
          <Label
            title="Effectif ajusté"
            name="totalSeats"
            tooltip="Estimation de l’effectif au plus proche de la réalité. L’effectif ajusté ne peut pas dépasser l’effectif prévisionnel"
          />
          <InputText
            name="totalSeats"
            className="flex-1 mb-3"
            value={classe.totalSeats.toString()}
            disabled={!rights.canEditTotalSeats}
            onChange={(e) => setClasse({ ...classe, totalSeats: Number(e.target.value) })}
            readOnly={!edit}
            active={edit}
            error={errors.totalSeats}
          />
          <Label title="Effectif inscrit" name="validatedYoung" tooltip="Nombre d'élèves validés inscrit sur la classe" />
          <InputText name="validatedYoung" className="flex-1 mb-3" value={validatedYoung.toString()} disabled />
          <Label title="Coloration" name="coloration" />
          <Select
            className="mb-3"
            isActive={edit && rights.canEditColoration}
            readOnly={!edit}
            disabled={!rights.canEditColoration}
            placeholder={"Choisissez une coloration"}
            options={colorOptions}
            closeMenuOnSelect={true}
            value={classe?.coloration ? { value: classe?.coloration, label: translate(classe?.coloration) } : null}
            onChange={(options) => {
              setClasse({ ...classe, coloration: options.value });
            }}
            error={errors.coloration}
          />
        </div>
        <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
        <div className="flex-1">
          {rights.showCohort && (
            <>
              <Label title="Cohorte" name="Cohorte" tooltip="La cohorte sera mise à jour lors de la reception des cohortes depuis le SI SNU" />
              <Select
                className="mb-3"
                isActive={edit && rights.canEditCohort}
                readOnly={!edit || !rights.canEditCohort}
                disabled={!rights.canEditCohort}
                placeholder={"Choisissez une cohorte"}
                options={cohorts?.map((c) => ({ value: c.name, label: c.name }))}
                closeMenuOnSelect={true}
                value={classe?.cohort ? { value: classe?.cohort, label: classe?.cohort } : null}
                onChange={(options) => {
                  const cohort = cohorts?.find((c) => c.name === options.value);
                  setClasse({
                    ...classe,
                    cohortId: cohort?._id,
                    cohort: cohort?.name,
                    cohortDetails: cohort,
                  });
                }}
                error={errors.cohort}
              />
              <div className="flex flex-col gap-2 rounded-lg bg-gray-100 px-3 py-2 mb-3">
                <p className="text-left text-sm  text-gray-800">Dates</p>
                <div className="flex items-center">
                  <p className="text-left text-xs text-gray-500 flex-1">
                    Début : <strong>{formatDateFRTimezoneUTC(classe.cohortDetails?.dateStart)}</strong>
                  </p>
                  <p className="text-left text-xs text-gray-500 flex-1">
                    Fin : <strong>{formatDateFRTimezoneUTC(classe.cohortDetails?.dateEnd)}</strong>
                  </p>
                </div>
              </div>
            </>
          )}
          <Label title="Type de groupe" name="type" />
          <Select
            className="mb-3"
            isActive={edit}
            readOnly={!edit}
            placeholder={"Choisissez un type de classe"}
            options={typeOptions}
            closeMenuOnSelect={true}
            value={classe?.type ? { value: classe?.type, label: translate(classe?.type) } : null}
            onChange={(options) => {
              setClasse({ ...classe, type: options.value });
            }}
            error={errors.type}
          />
          <Label
            title="Situation scolaire"
            name="class-situation"
            tooltip="C'est la situation de la classe. Une exception au niveau d'un élève qui viendrait d'une autre filière ou d'un autre niveau peut être gérée au niveau du profil de l'élève concerné."
          />
          <Select
            className="mb-3"
            isActive={edit}
            readOnly={!edit}
            placeholder={"Choisissez une filière"}
            options={filiereOptions}
            closeMenuOnSelect={true}
            value={classe?.filiere ? { value: classe?.filiere, label: translate(classe?.filiere) } : null}
            onChange={(options) => {
              setClasse({ ...classe, filiere: options.value });
            }}
            error={errors.filiere}
          />
          <Select
            className="mb-3"
            isActive={edit}
            readOnly={!edit}
            placeholder={"Choisissez un niveau"}
            options={gradeOptions}
            isMulti={true}
            isClearable={true}
            label="Niveau"
            value={classe?.grades ? classe.grades.map((grade) => ({ value: grade, label: translateGrade(grade) })) : null}
            onChange={(options) => {
              setClasse({ ...classe, grades: options ? options.map((opt) => opt.value) : [] });
            }}
            error={errors.grades}
          />
          {[ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && (
            <>
              <InputText name="etablissementName" className="mb-3" value={classe.etablissement?.name || ""} readOnly={true} label="Établissement" />
              <Link to={`/etablissement/${classe.etablissementId}`} className="w-full">
                <Button type="tertiary" title="Voir l'établissement" className="w-full max-w-none" />
              </Link>
            </>
          )}
          {showButton && (
            <Link key="list-students" to={`${linkPath}?classeId=${classe._id}`}>
              <Button type="tertiary" title="Voir la liste des élèves" className="w-full max-w-none mt-3" />
            </Link>
          )}
          {edit && [ROLES.ADMIN, ROLES.ADMINISTRATEUR_CLE].includes(user.role) && <WithdrawButton classe={classe} setIsLoading={setIsLoading} />}
        </div>
      </div>
    </Container>
  );
}

import React from "react";
import { BsTrash3 } from "react-icons/bs";
import { Link } from "react-router-dom";
import { HiOutlinePencil } from "react-icons/hi";

import { translate, CLE_COLORATION_LIST, CLE_GRADE_LIST, CLE_FILIERE_LIST, ROLES, translateGrade, translateColoration, formatDateFRTimezoneUTC } from "snu-lib";
import { Container, Button, Label, InputText, Select } from "@snu/ds/admin";
import { CohortDto } from "snu-lib/src/dto/cohortDto";
import { User } from "@/types";
import { ClasseDto } from "snu-lib/src/dto/classeDto";
import { Rights } from "./types";

type SelectOption = {
  value: string;
  label: string;
};

interface Props {
  classe: ClasseDto;
  setClasse: (classe: ClasseDto) => void;
  edit: boolean;
  setEdit: (edit: boolean) => void;
  errors: { [key: string]: string };
  rights: Rights;
  cohorts: CohortDto[];
  user: User;
  setShowModaleWithdraw: (b: boolean) => void;
  isLoading: boolean;
  onCancel: () => void;
  onCheckInfo: () => void;
}

export default function GeneralInfos({ classe, setClasse, edit, setEdit, errors, rights, cohorts, user, setShowModaleWithdraw, isLoading, onCancel, onCheckInfo }: Props) {
  const colorOptions: SelectOption[] = Object.keys(CLE_COLORATION_LIST).map((value) => ({
    value: CLE_COLORATION_LIST[value],
    label: translateColoration(CLE_COLORATION_LIST[value]),
  }));
  const filiereOptions = Object.keys(CLE_FILIERE_LIST).map((value) => ({
    value: CLE_FILIERE_LIST[value],
    label: CLE_FILIERE_LIST[value],
  }));
  const gradeOptions = Object.keys(CLE_GRADE_LIST).map((value) => ({
    value: CLE_GRADE_LIST[value],
    label: translateGrade(CLE_GRADE_LIST[value]),
  }));

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

  return (
    <Container title="Informations générales" actions={containerActionList({ edit, setEdit, canEdit: rights.canEdit })}>
      <div className="flex items-stretch justify-stretch">
        <div className="flex-1">
          {rights.showCohort && (
            <>
              <Label title="Cohorte" name="Cohorte" tooltip="La cohorte sera mise à jour lors de la validation des dates d'affectation." />
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
                  setClasse({ ...classe, cohort: options.value });
                }}
                error={errors.cohort}
              />
              <div className="flex flex-col gap-2 rounded-lg bg-gray-100 px-3 py-2 mb-3">
                <p className="text-left text-sm  text-gray-800">Dates</p>
                <div className="flex items-center">
                  <p className="text-left text-xs text-gray-500 flex-1">
                    Début : <strong>{formatDateFRTimezoneUTC(cohorts?.find((c) => c.name === classe?.cohort)?.dateStart)}</strong>
                  </p>
                  <p className="text-left text-xs text-gray-500 flex-1">
                    Fin : <strong>{formatDateFRTimezoneUTC(cohorts?.find((c) => c.name === classe?.cohort)?.dateEnd)}</strong>
                  </p>
                </div>
              </div>
            </>
          )}
          <Label title="Numéro d’identification" name="identification" />
          <div className="flex items-center justify-between gap-3 mb-3">
            <InputText name="uniqueKey" className="flex-1" value={classe.uniqueKey} disabled />
            <InputText name="uniqueId" className="flex-1" value={classe.uniqueId} disabled />
          </div>
          <Label title="Nom de la classe engagée" name="Class-name" tooltip="Identité du groupe formé." />
          <InputText
            name="nameClasse"
            className="mb-3"
            value={classe.name}
            onChange={(e) => setClasse({ ...classe, name: e.target.value })}
            error={errors.name}
            readOnly={!edit}
            active={edit}
          />
          <Label title="Coloration souhaitée" name="coloration" tooltip="Les colorations définitives seront confirmées au moment des affectations." />
          <Select
            className="mb-3"
            isActive={edit}
            readOnly={!edit}
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
          <Label
            title="Estimation du nombre d'élèves"
            name="totalSeats"
            tooltip="Pour qu'une classe soit considérée comme complète et puisse être validée, 100% des élèves doivent être inscrits (ou désistés). Vous pouvez modifier le nombre d'élèves dans le cas d'un changement d'effectif en cours d'année."
          />
          <InputText
            className="mb-3"
            name="totalSeats"
            type="number"
            value={classe.totalSeats?.toString()}
            error={errors.totalSeats}
            onChange={(e) => setClasse({ ...classe, totalSeats: Number(e.target.value) })}
            readOnly={!edit}
            active={edit}
          />
          <Label
            title="Situation scolaire"
            name="class-situation"
            tooltip="C'est la situation de la classe. Une exception au niveau d'un élève qui viendrait d'une autres filière ou d'un autre niveau peut être gérer au niveau du profil de l'élève concerné."
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
            closeMenuOnSelect={true}
            value={classe?.grade ? { value: classe?.grade, label: translateGrade(classe?.grade) } : null}
            onChange={(options) => {
              setClasse({ ...classe, grade: options.value });
            }}
            error={errors.grade}
          />
          {[ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && (
            <>
              <InputText name="etablissementName" className="mb-3" value={classe.etablissement?.name} readOnly={true} label="Établissement" />
              <Link to={`/etablissement/${classe.etablissementId}`} className="w-full">
                <Button type="tertiary" title="Voir l'établissement" className="w-full max-w-none" />
              </Link>
            </>
          )}

          {edit && [ROLES.ADMIN, ROLES.ADMINISTRATEUR_CLE].includes(user.role) ? (
            <div className="flex items-center justify-end mt-6">
              <button type="button" className="flex items-center justify-center text-xs text-red-500 hover:text-red-700" onClick={() => setShowModaleWithdraw(true)}>
                <BsTrash3 className="mr-2" />
                Désister la classe
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </Container>
  );
}

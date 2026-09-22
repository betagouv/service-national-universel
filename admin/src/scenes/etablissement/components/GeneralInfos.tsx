import React from "react";
import { Link, useParams } from "react-router-dom";

import { Button, Container, InputText, Label, Select } from "@snu/ds/admin";
import { Input } from "@snu/ds/common";
import { ROLES, CLE_TYPE_LIST, CLE_SECTOR_LIST, EtablissementType } from "snu-lib";
import { User } from "@/types";

interface Props {
  etablissement: EtablissementType;
  user: User;
}

export default function GeneralInfos({ etablissement, user }: Props) {
  const { id } = useParams<{ id: string }>();

  const typeOptions = Object.keys(CLE_TYPE_LIST).map((value) => ({
    value: CLE_TYPE_LIST[value],
    label: CLE_TYPE_LIST[value],
  }));
  const sectorOptions = Object.keys(CLE_SECTOR_LIST).map((value) => ({
    value: CLE_SECTOR_LIST[value],
    label: CLE_SECTOR_LIST[value],
  }));

  return (
    <Container title="Informations générales">
      <div className="flex items-stretch justify-between">
        <div className="flex-1 shrink-0">
          <Label name="name" title="Nom de l’établissement" />
          <InputText name="name" className="mb-4" value={etablissement.name} disabled />
          <Label name="address" title="Adresse postale" />
          <InputText name="address" className="mb-4" value={etablissement.address || ""} disabled />
          <div className="flex gap-4 mt-3">
            <Input label="Département" value={etablissement.department} disabled className="w-full" />
            <Input label="Région" value={etablissement.region} disabled className="w-full" />
          </div>
        </div>
        <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
        <div className="flex-1 shrink-0">
          <Label name="UAI" title="UAI" />
          <InputText name="UAI" className="mb-4" value={etablissement.uai} disabled />
          <Label name="academy" title="Académie" />
          <InputText name="academy" className="mb-4" value={etablissement.academy} disabled />
          <Label name="type" title="Type d’établissement" />
          <Select
            className="mb-4"
            readOnly
            disabled
            placeholder={"Non renseigné"}
            options={typeOptions}
            closeMenuOnSelect={true}
            value={etablissement.type?.map((type1) => ({ value: type1, label: typeOptions.find((type2) => type2.value === type1)?.label }))}
          />
          <Label name="statut" title="Statut" />
          <Select
            className="mb-4"
            readOnly
            disabled
            placeholder={"Non renseigné"}
            options={sectorOptions}
            closeMenuOnSelect={true}
            value={etablissement.sector?.map((sector1) => ({ value: sector1, label: sectorOptions.find((sector2) => sector2.value === sector1)?.label }))}
          />
          {[ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && (
            <div className="flex items-center gap-4">
              <Link key="list-eta" to={`/classes?etablissementId=${id}`} className="w-full">
                <Button title="Voir les classes" className="w-full" type="tertiary" />
              </Link>
              <Link key="list-young" to={`/inscription?etablissementId=${id}`} className="w-full">
                <Button title="Voir les élèves" className="w-full" type="tertiary" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

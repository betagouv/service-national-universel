import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDebounce } from "@uidotdev/usehooks";
import { HiOutlinePencil } from "react-icons/hi";
import { toastr } from "react-redux-toastr";

import api from "@/services/api";
import { capture } from "@/sentry";
import { Button, Container, InputText, Label, Select } from "@snu/ds/admin";
import { AddressForm, Input } from "@snu/ds/common";
import { ROLES, SUB_ROLES, CLE_TYPE_LIST, CLE_SECTOR_LIST, useAddress, translate } from "snu-lib";

interface Props {
  etablissement: any;
  onUpdateEtab: (data: any) => void;
  user: any;
  errors: any;
}

interface Errors {
  address?: string;
  type?: string;
  sector?: string;
  [key: string]: string | undefined;
}

export default function GeneralInfos({ etablissement, onUpdateEtab, user }: Props) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [errors, setErrors] = useState<Errors>({
    address: "",
    type: "",
    sector: "",
  });

  const debouncedQuery = useDebounce(query, 300);
  const { results } = useAddress({ query: debouncedQuery, options: { limit: 10 }, enabled: debouncedQuery.length > 2 });
  const { id } = useParams<{ id: string }>();

  const typeOptions = Object.keys(CLE_TYPE_LIST).map((value) => ({
    value: CLE_TYPE_LIST[value],
    label: CLE_TYPE_LIST[value],
  }));
  const sectorOptions = Object.keys(CLE_SECTOR_LIST).map((value) => ({
    value: CLE_SECTOR_LIST[value],
    label: CLE_SECTOR_LIST[value],
  }));

  const sendInfo = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      const errors: Errors = {};
      if (!etablissement.address) errors.address = "Ce champ est obligatoire";
      if (!etablissement.type || etablissement.type.length === 0) errors.type = "Ce champ est obligatoire";
      if (!etablissement.sector || etablissement.sector.length === 0) errors.sector = "Ce champ est obligatoire";

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        setIsLoading(false);
        return;
      }

      const { ok, code, data: response } = await api.put(`/cle/etablissement/${etablissement._id}`, etablissement);

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la modification de l'établissement", translate(code));
        return setIsLoading(false);
      }
      onUpdateEtab(response);
      setEdit(!edit);
      setIsLoading(false);
      setErrors({});
    } catch (e) {
      capture(e);
      toastr.error("Erreur", "Oups, une erreur est survenue lors de la modification de l'établissement");
    } finally {
      setIsLoading(false);
    }
  };

  const cancel = () => {
    setEdit(!edit);
    setErrors({});
  };

  const actionList = edit
    ? [
        <div key="actions-list" className="flex items-center justify-end ml-6">
          <Button key="cancel" type="cancel" title="Annuler" onClick={cancel} disabled={isLoading} />
          <Button key="validate" type="primary" title="Valider" className={"!h-8 ml-2"} onClick={sendInfo} disabled={isLoading} />
        </div>,
      ]
    : user.subRole === SUB_ROLES.referent_etablissement || [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role)
      ? [<Button key="change" type="modify" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" onClick={() => setEdit(!edit)} disabled={isLoading} />]
      : [];

  return (
    <Container title="Informations générales" actions={actionList}>
      <div className="flex items-stretch justify-between">
        <div className="flex-1 shrink-0">
          <Label name="name" title="Nom de l’établissement" />
          <InputText name="name" className="mb-4" value={etablissement.name} disabled />
          <Label name="address" title="Adresse postale" />
          <AddressForm
            readOnly={!edit}
            data={{ address: etablissement.address, zip: etablissement.zip, city: etablissement.city, department: etablissement.department, region: etablissement.region }}
            updateData={(address) => onUpdateEtab({ ...etablissement, ...address })}
            query={query}
            setQuery={setQuery}
            options={results}
          />
          {errors.address && <div className="text-red-500 mb-2">{errors.address}</div>}
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
            readOnly={!edit}
            isActive={edit}
            placeholder={"À modifier"}
            options={typeOptions}
            closeMenuOnSelect={true}
            value={etablissement.type?.map((type1) => ({ value: type1, label: typeOptions.find((type2) => type2.value === type1)?.label }))}
            onChange={(options) => {
              onUpdateEtab({ ...etablissement, type: [options.value] });
            }}
            error={errors.type}
          />
          <Label name="statut" title="Statut" />
          <Select
            className="mb-4"
            readOnly={!edit}
            isActive={edit}
            placeholder={"À modifier"}
            options={sectorOptions}
            closeMenuOnSelect={true}
            value={etablissement.sector?.map((sector1) => ({ value: sector1, label: sectorOptions.find((sector2) => sector2.value === sector1)?.label }))}
            onChange={(options) => {
              onUpdateEtab({ ...etablissement, sector: [options.value] });
            }}
            error={errors.sector}
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

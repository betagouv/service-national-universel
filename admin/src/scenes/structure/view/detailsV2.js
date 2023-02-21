import React, { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { canCreateStructure, translate } from "snu-lib";
import API from "../../../services/api";
import { getNetworkOptions, legalStatus, typesStructure } from "../../../utils";
import { StructureContext } from "../view";

import EditButton from "../../../components/buttons/EditButton";
import MultiSelect from "../../../components/forms/MultiSelect";
import AsyncSelect from "react-select/async";
import VerifyAddress from "../../phase0/components/VerifyAddress";
import Field from "../../../components/forms/Field";
import Select from "../../../components/forms/Select";
import Toggle from "../../../components/Toggle";
import StructureView from "./wrapperv2";
import TeamCard from "../components/cards/TeamCard";
import CardRepresentant from "../components/cards/CardRepresentant";

export default function DetailsView() {
  return (
    <StructureView tab="details">
      <div className="flex gap-6 my-4">
        <CardRepresentant />
        <TeamCard />
      </div>
      <StructureForm />
    </StructureView>
  );
}

function StructureForm() {
  const user = useSelector((state) => state.Auth.user);
  const { structure, setStructure } = useContext(StructureContext);
  const [data, setData] = useState(structure);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const legalStatusOptions = legalStatus.map((e) => ({ label: translate(e), value: e }));
  const structureTypesOptions = data.legalStatus && data.legalStatus !== "OTHER" ? typesStructure[data.legalStatus].map((e) => ({ label: e, value: e })) : [];

  const onVerifyAddress = (isConfirmed) => (suggestion) => {
    setData({
      ...data,
      addressVerified: true,
      region: suggestion.region,
      department: suggestion.department,
      location: suggestion.location,
      address: isConfirmed ? suggestion.address : data.address,
      zip: isConfirmed ? suggestion.zip : data.zip,
      city: isConfirmed ? suggestion.city : data.city,
    });
  };

  const onSubmit = async () => {
    if (data.isNtwork) data.networkId = undefined;
    setIsLoading(true);

    const error = {};
    if (!data.addressVerified) error.addressVerified = "Veuillez vérifier l'adresse";
    if (!data?.name) error.name = "Le nom est obligatoire";
    if (!data?.address) error.address = "L'adresse est obligatoire";
    if (!data?.zip) error.zip = "Le code postal est obligatoire";
    if (!data?.city) error.city = "La ville est obligatoire";
    if (!data?.legalStatus) error.legalStatus = "Veuillez sélectionner un statut juridique";
    if (!data?.types) error.types = "Veuillez sélectionner au moins un type d'agréément";
    setErrors(error);
    if (Object.keys(error).length > 0) return setIsLoading(false);

    try {
      const { ok, code, data: resData } = await API.put(`/structure/${structure._id}`, data);
      if (!ok) {
        setErrors(code);
        return toastr.error("Oups, une erreur est survenue pendant la mise à jour de la structure :", translate(code));
      }
      toastr.success("Structure mise à jour avec succès");
      setData(resData);
      setStructure(resData);
      setIsEditing(false);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la mise à jour de la structure :", translate(e.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-white p-8 rounded-xl shadow-sm">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-lg leading-6 font-medium text-gray-900 my-0">Informations générales</h2>
        {canCreateStructure(user) && (
          <EditButton isEditing={isEditing} setIsEditing={setIsEditing} isLoading={isLoading} onSubmit={onSubmit} defaultData={structure} setData={setData} setErrors={setErrors} />
        )}
      </div>

      <div className="flex my-4">
        <div className="space-y-4 w-[47%]">
          <div className="space-y-2">
            <div className="text-xs font-medium leading-4 text-gray-900">Nom de la structure</div>
            <Field
              name="name"
              label="Nom de la structure"
              value={data.name}
              handleChange={(e) => setData({ ...data, name: e.target.value })}
              readOnly={!isEditing}
              errors={errors}
            />
          </div>

          <div className="space-y-2 my-4">
            <div className="text-xs font-medium leading-4 text-gray-900">Présentation de la structure (facultatif)</div>
            <Field
              name="description"
              label="Précisez les informations complémentaires à préciser au volontaire. "
              value={data.description || ""}
              type="textarea"
              handleChange={(e) => setData({ ...data, description: e.target.value })}
              readOnly={!isEditing}
            />
          </div>

          <div className="space-y-3">
            <div className="text-xs font-medium leading-4 text-gray-900">Adresse</div>
            <Field
              name="address"
              label="Adresse"
              value={data.address}
              handleChange={(e) => setData({ ...data, address: e.target.value, addressVerified: false })}
              readOnly={!isEditing}
              errors={errors}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                name="zip"
                label="Code postal"
                value={data.zip}
                handleChange={(e) => setData({ ...data, zip: e.target.value, addressVerified: false })}
                readOnly={!isEditing}
                errors={errors}
              />
              <Field
                name="city"
                label="Ville"
                value={data.city}
                handleChange={(e) => setData({ ...data, city: e.target.value, addressVerified: false })}
                readOnly={!isEditing}
                errors={errors}
              />
            </div>
            {data.addressVerified && (
              <div className="grid grid-cols-2 gap-3">
                <Field
                  name="department"
                  label="Département"
                  value={data.department}
                  className="w-full"
                  handleChange={(e) => setData({ ...data, department: e.target.value })}
                  readOnly={true}
                  errors={errors}
                />
                <Field readOnly={true} label="Région" className="w-full" handleChange={(e) => setData({ ...data, region: e.target.value })} value={data.region} disabled={true} />
              </div>
            )}
            {isEditing && !data.addressVerified && (
              <div className="space-y-2 ">
                <VerifyAddress
                  address={data.address}
                  zip={data.zip}
                  city={data.city}
                  onSuccess={onVerifyAddress(true)}
                  onFail={onVerifyAddress()}
                  isVerified={data.addressVerified === true}
                  buttonClassName="border-[#1D4ED8] text-[#1D4ED8]"
                  verifyText="Pour vérifier l'adresse vous devez remplir les champs adresse, code postal et ville."
                  verifyButtonText="Vérifier l'adresse du centre"
                />
                {errors?.addressVerified && <div className="text-[#EF4444]">{errors.addressVerified}</div>}
              </div>
            )}
          </div>
        </div>

        <div className="flex w-[6%] justify-center items-center">
          <div className="w-[1px] h-4/5 border-r-[1px] border-gray-200" />
        </div>

        <div className="space-y-4 w-[47%]">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-medium leading-4 text-gray-900">Informations juridiques</div>
            <Select
              label="Sélectionnez un statut juridique"
              readOnly={!isEditing}
              options={legalStatusOptions}
              selected={legalStatusOptions.find((e) => e.value === data.legalStatus || "")}
              setSelected={(e) => setData({ ...data, legalStatus: e.value })}
              error={errors?.legalStatus}
            />
            {data.legalStatus && data.legalStatus !== "OTHER" && (
              <MultiSelect
                label="Sélectionnez un ou plusieurs agrééments"
                readOnly={!isEditing}
                options={structureTypesOptions}
                selected={structureTypesOptions.filter((e) => data.types.includes(e.value)) || ""}
                error={errors?.types}
                setSelected={(e) => setData({ ...data, types: e.map((e) => e.value) })}
              />
            )}
            <Field
              name="siret"
              label="Numéro de SIRET (si disponible)"
              value={data.siret || ""}
              handleChange={(e) => setData({ ...data, siret: e.target.value })}
              readOnly={!isEditing}
              errors={errors}
            />

            {(!data.isNetwork || data.isNetwork === "false") && (
              <div className="space-y-2 my-3">
                <h3 className="text-xs font-medium leading-4 text-gray-900">Réseau national</h3>
                <p className="text-xs font-medium leading-4 text-gray-400">
                  Si l&apos;organisation est membre d&apos;un réseau national (Les Banques alimentaires, Armée du Salut...), renseignez son nom. Vous permettrez ainsi au
                  superviseur de votre réseau de visualiser les missions et bénévoles rattachés à votre organisation.
                </p>
                <AsyncSelect
                  isClearable
                  label="Réseau national"
                  value={{
                    label: data.networkName,
                  }}
                  loadOptions={getNetworkOptions}
                  isDisabled={!isEditing}
                  noOptionsMessage={() => "Aucune structure ne correspond à cette recherche"}
                  styles={{
                    dropdownIndicator: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
                    placeholder: (styles) => ({ ...styles, color: "black" }),
                    control: (styles, { isDisabled }) => ({ ...styles, borderColor: "#D1D5DB", backgroundColor: isDisabled ? "white" : "white" }),
                    singleValue: (styles) => ({ ...styles, color: "black" }),
                    multiValueRemove: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
                    indicatorsContainer: (provided, { isDisabled }) => ({ ...provided, display: isDisabled ? "none" : "flex" }),
                  }}
                  defaultOptions
                  onChange={(e) => setData({ ...data, networkName: e?.label || "", networkId: e?._id || "" })}
                  placeholder="Rechercher une structure"
                  error={errors.structureName}
                />
              </div>
            )}

            <div className="flex justify-between my-3">
              <p className="text-gray-500">Tête de réseau</p>
              <div className="flex gap-2 items-center">
                <Toggle value={data.isNetwork === "true"} onChange={(e) => setData({ ...data, isNetwork: e.toString() })} disabled={!isEditing} />
                {data.isNetwork ? "Oui" : "Non"}
              </div>
            </div>

            <div className="flex justify-between my-3">
              <p className="text-gray-500">Préparation militaire</p>
              <div className="flex gap-2 items-center">
                <Toggle value={data.isMilitaryPreparation === "true"} onChange={(e) => setData({ ...data, isMilitaryPreparation: e.toString() })} disabled={!isEditing} />
                {data.isMilitaryPreparation ? "Oui" : "Non"}
              </div>
            </div>

            <div className="space-y-2 my-3">
              <h3 className="text-xs font-medium leading-4 text-gray-900">Réseaux sociaux (facultatif)</h3>
              <div className="grid grid-cols-2 gap-2">
                <Field
                  name="website"
                  label="Site Internet"
                  value={data.website || ""}
                  handleChange={(e) => setData({ ...data, website: e.target.value })}
                  readOnly={!isEditing}
                  copy={true}
                />
                <Field
                  name="fb"
                  label="Facebook"
                  value={data.facebook || ""}
                  handleChange={(e) => setData({ ...data, facebook: e.target.value })}
                  readOnly={!isEditing}
                  copy={true}
                />
                <Field
                  name="twitter"
                  label="Twitter"
                  value={data.twitter || ""}
                  handleChange={(e) => setData({ ...data, twitter: e.target.value })}
                  readOnly={!isEditing}
                  copy={true}
                />
                <Field
                  name="instagram"
                  label="Instagram"
                  value={data.instagram || ""}
                  handleChange={(e) => setData({ ...data, instagram: e.target.value })}
                  readOnly={!isEditing}
                  copy={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

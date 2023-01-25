import React, { useContext, useState } from "react";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import API from "../../../services/api";

import EditButton from "./EditButton";
import MultiSelect from "./MultiSelect";
import VerifyAddress from "../../phase0/components/VerifyAddress";
import Field from "../../centersV2/components/Field";
import Select from "../../centersV2/components/Select";
import Toggle from "../../centersV2/components/Toggle";
import { getNetworkOptions, legalStatus, typesStructure } from "../../../utils";
import { StructureContext } from "../view";
import Textarea from "../../../components/Textarea";

export default function Informations() {
  const { structure, setStructure } = useContext(StructureContext);
  const [data, setData] = useState(structure);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const legalStatusOptions = legalStatus.map((e) => ({ label: translate(e), value: e }));
  const structureTypesOptions = typesStructure[data.legalStatus].map((e) => ({ label: e, value: e }));

  const [networkOptions, setNetworkOptions] = useState([]);

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
    setIsLoading(true);

    const error = {};
    if (!data?.name) error.name = "Le nom est obligatoire";
    if (!data?.address) error.address = "L'adresse est obligatoire";
    if (!data?.zip) error.zip = "Le code postal est obligatoire";
    if (!data?.city) error.city = "La ville est obligatoire";
    if (!data?.addressVerified) error.addressVerified = "L'adresse n'a pas été vérifiée";
    if (!data?.legalStatus) error.legalStatus = "Veuillez sélectionner un statut juridique";
    if (!data?.types) error.types = "Veuillez sélectionner au moins un type d'agréément";
    if (!data?.siret) error.siret = "Le numéro SIRET est obligatoire";
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
    <div className="bg-white p-8 rounded-xl shadow-sm">
      <div className="flex justify-between w-full">
        <h2 className="text-lg leading-6 font-medium text-gray-900 my-0">Informations générales</h2>
        {
          <EditButton
            onClick={async () => {
              const options = await getNetworkOptions();
              setNetworkOptions(options);
            }}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isLoading={isLoading}
            onSubmit={onSubmit}
            defaultData={structure}
            setData={setData}
            setErrors={setErrors}
          />
        }
      </div>

      <div className="flex my-8">
        <div className="space-y-4 w-[45%]">
          <div className="space-y-2">
            <div className="text-xs font-medium leading-4 text-gray-900">Nom de la structure</div>
            <Field readOnly={!isEditing} label="Nom de la structure" onChange={(e) => setData({ ...data, name: e.target.value })} value={data.name} error={errors?.name} />
          </div>

          <div className="space-y-2 my-4">
            <div className="text-xs font-medium leading-4 text-gray-900">Présentation de la structure (facultatif)</div>
            <Textarea
              readOnly={!isEditing}
              label="Précisez les informations complémentaires à préciser au volontaire. "
              onChange={(e) => setData({ ...data, description: e.target.value })}
              value={data.description || ""}
              error={errors?.description}
            />
          </div>

          <div className="space-y-3">
            <div className="text-xs font-medium leading-4 text-gray-900">Adresse</div>
            <Field
              readOnly={!isEditing}
              label="Adresse"
              onChange={(e) => setData({ ...data, address: e.target.value, addressVerified: false })}
              value={data.address}
              error={errors?.address}
            />
            <div className="flex items-center gap-3">
              <Field
                readOnly={!isEditing}
                label="Code postal"
                onChange={(e) => setData({ ...data, zip: e.target.value, addressVerified: false })}
                value={data.zip}
                error={errors?.zip}
              />
              <Field
                readOnly={!isEditing}
                label="Ville"
                onChange={(e) => setData({ ...data, city: e.target.value, addressVerified: false })}
                value={data.city}
                error={errors?.city}
              />
            </div>
            {data.addressVerified && (
              <div className="flex items-center gap-3">
                <Field readOnly={!isEditing} label="Département" onChange={(e) => setData({ ...data, department: e.target.value })} value={data.department} disabled={true} />
                <Field readOnly={!isEditing} label="Région" onChange={(e) => setData({ ...data, region: e.target.value })} value={data.region} disabled={true} />
              </div>
            )}
            {isEditing && (
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

        <div className="flex w-[10%] justify-center items-center">
          <div className="w-[1px] h-4/5 border-r-[1px] border-gray-300" />
        </div>

        <div className="space-y-4 w-[45%]">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-medium leading-4 text-gray-900">Informations juridiques</div>
            <Select
              label="Sélectionnez un statut juridique"
              readOnly={!isEditing}
              options={legalStatusOptions}
              selected={legalStatusOptions.find((e) => e.value === data.legalStatus)}
              setSelected={(e) => setData({ ...data, legalStatus: e.value })}
              error={errors?.legalStatus}
            />
            <MultiSelect
              label="Sélectionnez un ou plusieurs agrééments"
              readOnly={!isEditing}
              options={structureTypesOptions}
              selected={structureTypesOptions.filter((e) => data.types.includes(e.value))}
              error={errors?.types}
              setSelected={(e) => setData({ ...data, types: e.map((e) => e.value) })}
            />
            <Field
              readOnly={!isEditing}
              label="Numéro de SIRET (si disponible)"
              onChange={(e) => setData({ ...data, siret: e.target.value })}
              value={data.siret || ""}
              error={errors?.siret}
            />

            <div className="space-y-2 my-3">
              <h3 className="text-xs font-medium leading-4 text-gray-900">Réseau national</h3>
              <p className="text-xs font-medium leading-4 text-gray-400">
                Si l&apos;organisation est membre d&apos;un réseau national (Les Banques alimentaires, Armée du Salut...), renseignez son nom. Vous permettrez ainsi au superviseur
                de votre réseau de visualiser les missions et bénévoles rattachés à votre organisation.
              </p>
              <Select
                label="Sélectionnez un réseau"
                readOnly={!isEditing}
                options={networkOptions}
                selected={networkOptions.find((e) => e.value === data.networkId) || { label: data.networkName, value: data.networkId } || {}}
                setSelected={(e) => setData({ ...data, networkId: e.value, networkName: e.label })}
                error={errors?.network}
              />
            </div>

            <div className="flex justify-between my-3">
              <p className="text-gray-500">Tête de réseau</p>
              <div className="flex gap-2 items-center">
                <Toggle value={data.isNetworkHead === "true"} onChange={(e) => setData({ ...data, isNetworkHead: e.toString() })} disabled={!isEditing} />
                {data.isNetworkHead ? "Oui" : "Non"}
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
                  readOnly={!isEditing}
                  label="Site Internet"
                  onChange={(e) => setData({ ...data, website: e.target.value })}
                  value={data.website || ""}
                  error={errors?.website}
                />
                <Field
                  readOnly={!isEditing}
                  label="Facebook"
                  onChange={(e) => setData({ ...data, facebook: e.target.value })}
                  value={data.facebook || ""}
                  error={errors?.facebook}
                />
                <Field readOnly={!isEditing} label="Twitter" onChange={(e) => setData({ ...data, twitter: e.target.value })} value={data.twitter || ""} error={errors?.twitter} />
                <Field
                  readOnly={!isEditing}
                  label="Instagram"
                  onChange={(e) => setData({ ...data, instagram: e.target.value })}
                  value={data.instagram || ""}
                  error={errors?.instagram}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";

import RadioButton from "../../components/RadioButton";
import Input from "../../components/Input";
import Select from "../../components/Select";
import ErrorMessage from "../../components/ErrorMessage";
import {
  youngSchooledSituationOptions,
  youngActiveSituationOptions,
  countryOptions,
  hostRelationshipOptions,
  frenchNationalityOptions,
  genderOptions,
  booleanOptions,
} from "../../utils";

import VerifyAddress from "../../components/VerifyAddress";
import SearchableSelect from "../../../../components/SearchableSelect";
import Toggle from "../../../../components/inscription/toggle";
import CheckBox from "../../../../components/inscription/checkbox";
import { FRANCE, getObjectWithEmptyData, birthPlaceFields, addressFields, foreignAddressFields } from "./utils";
import CityInput from "./components/CityInput";

export default function Form({ data, setData, errors, corrections }) {
  const [hasSpecialSituation, setSpecialSituation] = useState(false);

  const {
    frenchNationality,
    birthCountry,
    birthCityZip,
    birthCity,
    gender,
    phone,
    livesInFrance,
    addressVerified,
    address,
    zip,
    city,
    foreignCountry,
    foreignAddress,
    foreignCity,
    foreignZip,
    hostFirstName,
    hostLastName,
    hostRelationship,
    situation,
    schooled,
    handicap,
    allergies,
    ppsBeneficiary,
    paiBeneficiary,
    specificAmenagment,
    specificAmenagmentType,
    reducedMobilityAccess,
    handicapInSameDepartment,
  } = data;

  const isFrench = frenchNationality === "true";
  const isFrenchResident = livesInFrance === "true";

  const isVerifyAddressDisabled = !address || !city || !zip;
  const moreInformation = handicap === "true" || ppsBeneficiary === "true" || paiBeneficiary === "true";

  const setFrenchNationality = (frenchNationality) => {
    if (frenchNationality === "true") {
      setData({ ...data, ...getObjectWithEmptyData(birthPlaceFields), birthCountry: FRANCE, frenchNationality });
    } else {
      setData({ ...data, ...getObjectWithEmptyData(birthPlaceFields), frenchNationality });
    }
  };

  const setLivesInFrance = (livesInFrance) => {
    setData({ ...data, ...getObjectWithEmptyData(addressFields), ...getObjectWithEmptyData(foreignAddressFields), livesInFrance });
  };

  const updateData = (key) => (value) => {
    setData({ ...data, [key]: value });
  };

  const updateSpecialSituation = (value) => {
    setSpecialSituation(value);
    if (!value) {
      setData({
        ...data,
        handicap: "false",
        allergies: "false",
        ppsBeneficiary: "false",
        paiBeneficiary: "false",
        specificAmenagment: "",
        specificAmenagmentType: "",
        reducedMobilityAccess: "",
        handicapInSameDepartment: "",
      });
    }
  };

  const updateAddressToVerify = (key) => (value) => {
    setData({ ...data, [key]: value, addressVerified: "false" });
  };

  const onClickBirthCitySuggestion = (birthCity, birthCityZip) => {
    setData({ ...data, birthCity, birthCityZip });
  };

  const onVerifyAddress = (isConfirmed) => (suggestion) => {
    setData({
      ...data,
      addressVerified: "true",
      cityCode: suggestion.cityCode,
      region: suggestion.region,
      department: suggestion.department,
      location: suggestion.location,
      // if the suggestion is not confirmed we keep the address typed by the user
      address: isConfirmed ? suggestion.address : address,
      zip: isConfirmed ? suggestion.zip : zip,
      city: isConfirmed ? suggestion.city : city,
    });
  };

  return (
    <>
      <RadioButton
        label="Je suis né(e)..."
        options={frenchNationalityOptions}
        onChange={setFrenchNationality}
        value={frenchNationality}
        error={errors.frenchNationality}
        correction={corrections?.frenchNationality}
      />
      {!isFrench && (
        <SearchableSelect
          label="Pays de naissance"
          value={birthCountry}
          options={countryOptions}
          onChange={updateData("birthCountry")}
          placeholder="Sélectionnez un pays"
          error={errors.birthCountry}
          correction={corrections.birthCountry}
        />
      )}
      <div className="flex">
        <div className="flex-1 mr-3 relative">
          <CityInput
            value={birthCity}
            label="Commune de naissance"
            onChange={updateData("birthCity")}
            error={errors.birthCity}
            correction={corrections.birthCity}
            withSuggestion={isFrench}
            onSuggestionClick={onClickBirthCitySuggestion}
          />
        </div>

        <Input
          className="flex-1 ml-3"
          value={birthCityZip}
          label="Code postal de naissance"
          onChange={updateData("birthCityZip")}
          error={errors.birthCityZip}
          correction={corrections.birthCityZip}
        />
      </div>
      <RadioButton label="Sexe" options={genderOptions} onChange={updateData("gender")} value={gender} correction={corrections.gender} error={errors?.gender} />
      <Input type="tel" value={phone} label="Votre téléphone" onChange={updateData("phone")} error={errors.phone} correction={corrections.phone} />
      <RadioButton
        label="Je réside..."
        options={frenchNationalityOptions}
        onChange={setLivesInFrance}
        value={livesInFrance}
        correction={corrections.livesInFrance}
        error={errors?.livesInFrance}
      />
      {!isFrenchResident && (
        <SearchableSelect
          label="Pays de résidence"
          value={foreignCountry}
          options={countryOptions}
          onChange={updateData("foreignCountry")}
          placeholder="Sélectionnez un pays"
          error={errors.foreignCountry}
          correction={corrections.foreignCountry}
        />
      )}
      <Input
        value={isFrenchResident ? address : foreignAddress}
        label="Adresse de résidence"
        onChange={isFrenchResident ? updateAddressToVerify("address") : updateData("foreignAddress")}
        error={isFrenchResident ? errors.address : errors.foreignAddress}
        correction={isFrenchResident ? corrections.address : corrections.foreignAddress}
      />
      <div className="flex">
        <Input
          className="flex-1 mr-3"
          value={isFrenchResident ? zip : foreignZip}
          label="Code postal"
          onChange={isFrenchResident ? updateAddressToVerify("zip") : updateData("foreignZip")}
          error={isFrenchResident ? errors.zip : errors.foreignZip}
          correction={isFrenchResident ? corrections.zip : corrections.foreignZip}
        />
        <Input
          className="flex-1 ml-3"
          value={isFrenchResident ? city : foreignCity}
          label="Ville"
          onChange={isFrenchResident ? updateAddressToVerify("city") : updateData("foreignCity")}
          error={isFrenchResident ? errors.city : errors.foreignCity}
          correction={isFrenchResident ? corrections.city : corrections.foreignCity}
        />
      </div>
      {!isFrenchResident && (
        <>
          <h2 className="text-[16px] font-bold">Mon hébergeur</h2>
          <div className="flex my-3">
            <div className="w-[40px] min-w-[40px] flex justify-center items-center bg-[#0063CB]">
              <img src={require("../../../../assets/infoSquared.svg")} height={20} width={20} />
            </div>
            <div className="text-[#3A3A3A] border-2 border-[#0063CB] p-3  text-justify shadow-sm">
              Proche chez qui vous séjournerez le temps de la réalisation de votre SNU (lieu de départ/retour pour le séjour et de réalisation de la MIG).
            </div>
          </div>
          <p className="text-[14px] text-[#666666] leading-tight text-justify">
            À noter : l’hébergement chez un proche en France ainsi que le transport entre votre lieu de résidence et celui de votre hébergeur sont à votre charge.
          </p>
          <div className="flex">
            <Input
              className="flex-1 mr-3"
              value={hostFirstName}
              label="Prénom de l’hébergeur"
              onChange={updateData("hostFirstName")}
              error={errors.hostFirstName}
              correction={corrections.hostFirstName}
            />
            <Input
              className="flex-1 ml-3"
              value={hostLastName}
              label="Nom de l’hébergeur"
              onChange={updateData("hostLastName")}
              error={errors.hostLastName}
              correction={corrections.hostLastName}
            />
          </div>
          <Select
            options={hostRelationshipOptions}
            value={hostRelationship}
            label="Précisez votre lien avec l’hébergeur"
            onChange={updateData("hostRelationship")}
            error={errors.hostRelationship}
            correction={corrections.hostRelationship}
          />
          <Input value={address} label="Son adresse" onChange={updateAddressToVerify("address", false)} error={errors.address} correction={corrections.address} />
          <div className="flex">
            <Input className="flex-1 mr-3" value={zip} label="Code postal" onChange={updateAddressToVerify("zip", false)} error={errors.zip} correction={corrections.zip} />
            <Input className="flex-1 ml-3" value={city} label="Ville" onChange={updateAddressToVerify("city", false)} error={errors.city} correction={corrections.city} />
          </div>
        </>
      )}
      <VerifyAddress
        buttonContainerClassName="flex justify-end"
        buttonClassName="w-[200px]"
        address={address}
        disabled={isVerifyAddressDisabled}
        zip={zip}
        city={city}
        onSuccess={onVerifyAddress(true)}
        onFail={onVerifyAddress()}
        isVerified={addressVerified === "true"}
      />
      <div className="flex justify-end">
        <ErrorMessage>{errors.addressVerified}</ErrorMessage>
      </div>
      <Select
        label={schooled === "true" ? "Ma situation scolaire" : "Ma situation"}
        options={schooled === "true" ? youngSchooledSituationOptions : youngActiveSituationOptions}
        value={situation}
        onChange={updateData("situation")}
        error={errors.situation}
        correction={corrections.situation}
      />
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="mt-0 text-[16px] font-bold">
            Souhaitez-vous nous faire part d’une situation particulière ? (allergie, situation de handicap, besoin d&apos;un aménagement spécifique, ...)
          </h2>
          <div className=" text-[#666666] text-[14px] leading-tight mt-1">En fonction des situations signalées, un responsable prendra contact avec vous.</div>
        </div>
        <div className="ml-3">
          <Toggle toggled={hasSpecialSituation} onClick={() => updateSpecialSituation(!hasSpecialSituation)} />
        </div>
      </div>
      {hasSpecialSituation && (
        <>
          <CheckBox
            className="mb-4"
            label="Je suis en situation de handicap"
            checked={handicap === "true"}
            onChange={(value) => {
              setData({ ...data, handicap: value.toString() });
            }}
          />
          <CheckBox
            className="mb-4"
            label="Je suis bénéficiaire d’un Projet personnalisé de scolarisation (PPS)"
            checked={ppsBeneficiary === "true"}
            onChange={(value) => {
              setData({ ...data, ppsBeneficiary: value.toString() });
            }}
          />
          <CheckBox
            className="mb-4"
            label="Je suis bénéficiaire d’un Projet d’accueil individualisé (PAI)"
            checked={paiBeneficiary === "true"}
            onChange={(value) => {
              setData({ ...data, paiBeneficiary: value.toString() });
            }}
          />
          <CheckBox
            className="mb-4"
            label="J’ai des allergies ou intolérances alimentaires."
            description="(nécessitant la mise en place de mesures adaptées)"
            checked={allergies === "true"}
            onChange={(value) => {
              setData({ ...data, allergies: value.toString() });
            }}
          />
          <ErrorMessage>{errors.hasSpecialSituation}</ErrorMessage>
          {moreInformation && (
            <>
              <hr className="my-4 h-px bg-gray-200 border-0" />
              <RadioButton
                label="Avez-vous besoin d’aménagements spécifiques ?"
                description="(accompagnant professionnel, participation de jour, activités adaptées... )"
                options={booleanOptions}
                onChange={updateData("specificAmenagment")}
                value={specificAmenagment}
                error={errors.specificAmenagment}
              />
              {specificAmenagment === "true" && (
                <Input
                  value={specificAmenagmentType}
                  label="Quelle est la nature de cet aménagement ?"
                  onChange={updateData("specificAmenagmentType")}
                  error={errors.specificAmenagmentType}
                />
              )}
              <RadioButton
                label="Avez-vous besoin d’un aménagement pour mobilité réduite ?"
                options={booleanOptions}
                onChange={updateData("reducedMobilityAccess")}
                value={reducedMobilityAccess}
                error={errors.reducedMobilityAccess}
              />
              <RadioButton
                label="Avez-vous besoin d’être affecté(e) dans un centre de votre département de résidence ?"
                options={booleanOptions}
                onChange={updateData("handicapInSameDepartment")}
                value={handicapInSameDepartment}
                error={errors.handicapInSameDepartment}
              />
            </>
          )}
        </>
      )}
    </>
  );
}

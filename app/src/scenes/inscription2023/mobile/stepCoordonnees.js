import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import validator from "validator";

import RadioButton from "../components/RadioButton";
import Input from "../components/Input";
import Select from "../components/Select";
import ErrorMessage from "../components/ErrorMessage";
import Navbar from "../components/Navbar";
import Footer from "../../../components/footerV2";
import Help from "../components/Help";
import {
  youngSchooledSituationOptions,
  youngActiveSituationOptions,
  countryOptions,
  hostRelationshipOptions,
  frenchNationalityOptions,
  genderOptions,
  booleanOptions,
} from "../utils";

import api from "../../../services/api";
import VerifyAddress from "../components/VerifyAddress";
import SearchableSelect from "../../../components/SearchableSelect";
import StickyButton from "../../../components/inscription/stickyButton";
import Toggle from "../../../components/inscription/toggle";
import CheckBox from "../../../components/inscription/checkbox";
import { setYoung } from "../../../redux/auth/actions";
import { translate, regexPhoneFrenchCountries } from "../../../utils";
import { capture } from "../../../sentry";

const getObjectWithEmptyData = (fields) => {
  const object = {};
  fields.forEach((field) => {
    object[field] = "";
  });
  return object;
};

const FRANCE = "France";
const errorMessages = {
  addressVerified: "Merci de vérifier l'adresse",
  phone: "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX",
  zip: "Le code postal n'est pas valide",
};

const birthPlaceFields = ["birthCountry", "birthCity", "birthCityZip"];
const addressFields = ["address", "zip", "city", "cityCode", "region", "department", "location", "addressVerified"];
const foreignAddressFields = ["foreignCountry", "foreignAddress", "foreignCity", "foreignZip", "hostFirstName", "hostLastName", "hostRelationship"];
const moreInformationFields = ["specificAmenagment", "reducedMobilityAccess", "handicapInSameDepartment"];

const commonFields = [
  "frenchNationality",
  ...birthPlaceFields,
  ...addressFields,
  "gender",
  "phone",
  "situation",
  "livesInFrance",
  "handicap",
  "allergies",
  "ppsBeneficiary",
  "paiBeneficiary",
];

const commonRequiredFields = [
  "frenchNationality",
  ...birthPlaceFields,
  "gender",
  "phone",
  "situation",
  "livesInFrance",
  "address",
  "zip",
  "city",
  "region",
  "department",
  "location",
  "handicap",
  "allergies",
  "ppsBeneficiary",
  "paiBeneficiary",
];

const requiredFieldsForeigner = ["foreignCountry", "foreignAddress", "foreignCity", "foreignZip", "hostFirstName", "hostLastName", "hostRelationship"];
const requiredMoreInformationFields = ["specificAmenagment", "reducedMobilityAccess", "handicapInSameDepartment"];

const defaultState = {
  frenchNationality: "true",
  birthCountry: FRANCE,
  birthCityZip: "",
  birthCity: "",
  gender: genderOptions[0].value,
  phone: "",
  livesInFrance: frenchNationalityOptions[0].value,
  addressVerified: "false",
  address: "",
  zip: "",
  city: "",
  region: "",
  department: "",
  location: {},
  cityCode: "",
  foreignCountry: "",
  foreignAddress: "",
  foreignCity: "",
  foreignZip: "",
  hostFirstName: "",
  hostLastName: "",
  hostRelationship: "",
  situation: "",
  schooled: "",
  handicap: "false",
  allergies: "false",
  ppsBeneficiary: "false",
  paiBeneficiary: "false",
  specificAmenagment: "",
  specificAmenagmentType: "",
  reducedMobilityAccess: "",
  handicapInSameDepartment: "",
};

export default function StepCoordonnees() {
  const [data, setData] = useState(defaultState);
  const [errors, setErrors] = useState({});
  const [situationOptions, setSituationOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const history = useHistory();

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

  useEffect(() => {
    if (young) {
      const situationOptions = young.schooled === "true" ? youngSchooledSituationOptions : youngActiveSituationOptions;
      setSituationOptions(situationOptions);

      if (young.handicap === "true" || young.allergies === "true" || young.ppsBeneficiary === "true" || young.paiBeneficiary === "true") {
        setSpecialSituation(true);
      }

      setData({
        ...data,
        schooled: young.schooled || data.schooled,
        situation: young.situation || data.situation,
        frenchNationality: young.frenchNationality || data.frenchNationality,
        birthCountry: young.birthCountry || data.birthCountry,
        birthCity: young.birthCity || data.birthCity,
        birthCityZip: young.birthCityZip || data.birthCityZip,
        gender: young.gender || data.gender,
        phone: young.phone || data.phone,
        livesInFrance: young.foreignCountry ? "false" : data.livesInFrance,
        address: young.address || data.address,
        city: young.city || data.city,
        zip: young.zip || data.zip,
        foreignCountry: young.foreignCountry || data.foreignCountry,
        foreignAddress: young.foreignAddress || data.foreignAddress,
        foreignCity: young.foreignCity || data.foreignCity,
        foreignZip: young.foreignZip || data.foreignZip,
        hostFirstName: young.hostFirstName || data.hostFirstName,
        hostLastName: young.hostLastName || data.hostLastName,
        hostRelationship: young.hostRelationship || data.hostRelationship,
        handicap: young.handicap || data.handicap,
        allergies: young.allergies || data.allergies,
        ppsBeneficiary: young.ppsBeneficiary || data.ppsBeneficiary,
        paiBeneficiary: young.paiBeneficiary || data.paiBeneficiary,
        specificAmenagment: young.specificAmenagment || data.specificAmenagment,
        specificAmenagmentType: young.specificAmenagmentType || data.specificAmenagmentType,
        reducedMobilityAccess: young.reducedMobilityAccess || data.reducedMobilityAccess,
        handicapInSameDepartment: young.handicapInSameDepartment || data.handicapInSameDepartment,
      });
    }
  }, [young]);

  useEffect(() => {
    setErrors(getErrors());
  }, [phone, frenchNationality, birthCityZip, zip]);

  const getErrors = () => {
    let errors = {};

    if (phone && !validator.matches(phone, regexPhoneFrenchCountries)) {
      errors.phone = errorMessages.phone;
    }

    if (isFrench && birthCityZip && !validator.isPostalCode(birthCityZip, "FR")) {
      errors.birthCityZip = errorMessages.zip;
    }
    if (zip && !validator.isPostalCode(zip, "FR")) {
      errors.zip = errorMessages.zip;
    }

    return errors;
  };

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

  const updateAddressData =
    (key, isPersonalAddress = true) =>
    (value) => {
      setData({ ...data, [key]: value, [isPersonalAddress ? "addressVerified" : "hostAddressVerified"]: "false" });
    };

  const onSubmit = async () => {
    setLoading(true);
    let errors = {};
    const fieldToUpdate = [...commonFields];
    const requiredFields = [...commonRequiredFields];

    if (!isFrenchResident) {
      fieldToUpdate.push(...foreignAddressFields);
      requiredFields.push(...requiredFieldsForeigner);
    }

    if (addressVerified !== "true") {
      errors.addressVerified = errorMessages.addressVerified;
    }

    if (moreInformation) {
      fieldToUpdate.push(...moreInformationFields);
      requiredFields.push(...requiredMoreInformationFields);
    }

    if (specificAmenagment === "true") {
      fieldToUpdate.push("specificAmenagmentType");
      requiredFields.push("specificAmenagmentType");
    }

    for (const key of requiredFields) {
      if (data[key] === undefined || data[key] === "") {
        errors[key] = "Ce champ est obligatoire";
      }
    }

    errors = { ...errors, ...getErrors() };

    setErrors(errors);

    if (!Object.keys(errors).length) {
      const updates = {};
      fieldToUpdate.forEach((field) => {
        updates[field] = data[field];
      });

      updates.country = FRANCE;
      updates.moreInformation = moreInformation.toString();

      try {
        const { ok, code, data: responseData } = await api.put("/young/inscription2023/coordinates/next", updates);
        if (!ok) {
          setErrors({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
          setLoading(false);
          return;
        }
        dispatch(setYoung(responseData));
        history.push("/inscription2023/consentement");
      } catch (e) {
        capture(e);
        toastr.error("Une erreur s'est produite :", translate(e.code));
      }
    } else {
      toastr.error("Merci de corriger les erreurs", "");
    }
    setLoading(false);
  };

  const onSave = async () => {
    setLoading(true);

    const fieldToUpdate = [...commonFields];
    if (!isFrenchResident) {
      fieldToUpdate.push(...foreignAddressFields);
    }

    if (moreInformation) {
      fieldToUpdate.push(...moreInformationFields);
    }

    if (moreInformation && specificAmenagment === "true") {
      fieldToUpdate.push("specificAmenagmentType");
    }

    const updates = {};

    fieldToUpdate.forEach((field) => {
      updates[field] = data[field];
    });

    updates.country = FRANCE;
    updates.moreInformation = moreInformation.toString();

    try {
      const { ok, code, data: responseData } = await api.put("/young/inscription2023/coordinates/save", updates);
      if (!ok) {
        setErrors({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
        setLoading(false);
        return;
      }
      toastr.success("Vos modifications ont bien été enregistrees !", "");
      dispatch(setYoung(responseData));
    } catch (e) {
      capture(e);
      toastr.error("Une erreur s'est produite :", translate(e.code));
    }
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
    setErrors({ addressVerified: undefined });
  };

  return (
    <>
      <Navbar onSave={onSave} />
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Mon profil volontaire</h1>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <RadioButton label="Je suis né(e)..." options={frenchNationalityOptions} onChange={setFrenchNationality} value={frenchNationality} />
        {!isFrench && (
          <SearchableSelect
            label="Pays de naissance"
            value={birthCountry}
            options={countryOptions}
            onChange={updateData("birthCountry")}
            placeholder="Sélectionnez un pays"
            error={errors.birthCountry}
          />
        )}
        <Input value={birthCityZip} label="Code postal de naissance" onChange={updateData("birthCityZip")} error={errors.birthCityZip} />
        <Input value={birthCity} label="Commune de naissance" onChange={updateData("birthCity")} error={errors.birthCity} />
        <RadioButton label="Sexe" options={genderOptions} onChange={updateData("gender")} value={gender} />
        <Input type="tel" value={phone} label="Votre téléphone" onChange={updateData("phone")} error={errors.phone} />
        <RadioButton label="Je réside..." options={frenchNationalityOptions} onChange={setLivesInFrance} value={livesInFrance} />
        {!isFrenchResident && (
          <SearchableSelect
            label="Pays de résidence"
            value={foreignCountry}
            options={countryOptions}
            onChange={updateAddressData("foreignCountry")}
            placeholder="Sélectionnez un pays"
            error={errors.foreignCountry}
          />
        )}
        <Input
          value={isFrenchResident ? address : foreignAddress}
          label="Adresse de résidence"
          onChange={updateAddressData(isFrenchResident ? "address" : "foreignAddress")}
          error={isFrenchResident ? errors.address : errors.foreignAddress}
        />
        <Input
          value={isFrenchResident ? zip : foreignZip}
          label="Code postal"
          onChange={updateAddressData(isFrenchResident ? "zip" : "foreignZip")}
          error={isFrenchResident ? errors.zip : errors.foreignZip}
        />
        <Input
          value={isFrenchResident ? city : foreignCity}
          label="Ville"
          onChange={updateAddressData(isFrenchResident ? "city" : "foreignCity")}
          error={isFrenchResident ? errors.city : errors.foreignCity}
        />
        {!isFrenchResident && (
          <>
            <h2 className="text-[16px] font-bold">Mon hébergeur</h2>
            <div className="flex my-3">
              <div className="w-[40px] min-w-[40px] flex justify-center items-center bg-[#0063CB]">
                <img src={require("../../../assets/infoSquared.svg")} height={20} width={20} />
              </div>
              <div className="text-[#3A3A3A] border-2 border-[#0063CB] p-3  text-justify shadow-sm">
                Proche chez qui vous séjournerez le temps de la réalisation de votre SNU (lieu de départ/retour pour le séjour et de réalisation de la MIG).
              </div>
            </div>
            <p className="text-[14px] text-[#666666] leading-tight text-justify">
              À noter : l’hébergement chez un proche en France ainsi que le transport entre votre lieu de résidence et celui de votre hébergeur sont à votre charge.
            </p>
            <Input value={hostFirstName} label="Prénom de l’hébergeur" onChange={updateData("hostFirstName")} error={errors.hostFirstName} />
            <Input value={hostLastName} label="Nom de l’hébergeur" onChange={updateData("hostLastName")} error={errors.hostLastName} />
            <Select
              options={hostRelationshipOptions}
              value={hostRelationship}
              label="Précisez votre lien avec l’hébergeur"
              onChange={updateData("hostRelationship")}
              error={errors.hostRelationship}
            />
            <Input value={address} label="Son adresse" onChange={updateAddressData("address", false)} error={errors.address} />
            <Input value={zip} label="Code postal" onChange={updateAddressData("zip", false)} error={errors.zip} />
            <Input value={city} label="Ville" onChange={updateAddressData("city", false)} error={errors.city} />
          </>
        )}
        <VerifyAddress
          address={address}
          disabled={isVerifyAddressDisabled}
          zip={zip}
          city={city}
          onSuccess={onVerifyAddress(true)}
          onFail={onVerifyAddress()}
          isVerified={addressVerified === "true"}
        />
        <ErrorMessage>{errors.addressVerified}</ErrorMessage>
        <Select
          label={schooled === "true" ? "Ma situation scolaire" : "Ma situation"}
          options={situationOptions}
          value={situation}
          onChange={updateData("situation")}
          error={errors.situation}
        />
        <div className="flex items-center mb-4">
          <div>
            <h2 className="mt-0 text-[16px] font-bold">Souhaitez-vous nous faire part d’une situation particulière ?</h2>
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
                    onChange={updateAddressData("specificAmenagmentType")}
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
      </div>
      <Help />
      <Footer marginBottom={"12vh"} />
      <StickyButton text="Continuer" onClick={onSubmit} disabled={loading} />
    </>
  );
}

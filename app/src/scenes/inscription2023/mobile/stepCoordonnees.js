import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import validator from "validator";

import RadioButton from "../components/RadioButton";
import Input from "../components/Input";
import Select from "../components/Select";
import Navbar from "../components/Navbar";
import ErrorMessage from "../components/ErrorMessage";
import { youngSchooledSituationOptions, youngActiveSituationOptions, countryOptions, hostRelationshipOptions, frenchNationalityOptions, genderOptions } from "../utils";

import api from "../../../services/api";
import VerifyAddress, { messageStyles } from "../components/VerifyAddress";
import SearchableSelect from "../../../components/SearchableSelect";
import StickyButton from "../../../components/inscription/stickyButton";
import { setYoung } from "../../../redux/auth/actions";
import { translate } from "../../../utils";
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
  addressVerified: "Merci de valider l'adresse",
  phone: "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX",
  zip: "Le code postal n'est pas valide",
};

const addressValidationInfo = "Pour valider votre adresse vous devez remplir les champs adresse de résidence, code postale et ville.";
const addressValidationSuccess = "L'adresse a été vérifiée";

const birthPlaceFields = ["birthCountry", "birthCity", "birthCityZip"];
const commonFields = ["frenchNationality", ...birthPlaceFields, "gender", "phone", "situation", "livesInFrance"];
const commonRequiredFields = ["frenchNationality", ...birthPlaceFields, "gender", "phone", "situation", "livesInFrance"];
const frenchAddressFields = ["country", "address", "zip", "city", "cityCode", "region", "department", "location", "addressVerified"];
const foreignAddressFields = [
  "foreignCountry",
  "foreignAddress",
  "foreignCity",
  "foreignZip",
  "hostFirstName",
  "hostLastName",
  "hostRelationship",
  "hostCity",
  "hostZip",
  "hostAddress",
  "hostRegion",
  "hostDepartment",
  // "hostAddressVerified",
];

const requiredFieldsFrench = ["country", "address", "zip", "city", "region", "department", "location"];
const requiredFieldsForeigner = [
  "foreignCountry",
  "foreignAddress",
  "foreignCity",
  "hostFirstName",
  "hostLastName",
  "hostRelationship",
  "hostCity",
  "hostZip",
  "hostAddress",
  "hostRegion",
  "hostDepartment",
];

//@todo is neccessary
const defaultState = {
  region: "",
  department: "",
  location: {},
  cityCode: "",
  addressVerified: "false",
  hostRegion: "",
  hostDepartment: "",
  hostAddressVerified: "false",
};

export default function StepCoordonnees({ step }) {
  const [data, setData] = useState(defaultState);
  const [errors, setErrors] = useState({});
  const [situationOptions, setSituationOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const history = useHistory();

  const {
    frenchNationality,
    birthCountry,
    birthCityZip,
    birthCity,
    gender,
    phone,
    livesInFrance,
    addressVerified,
    country,
    address,
    zip,
    city,
    foreignCountry,
    foreignAddress,
    foreignCity,
    foreignZip,
    hostFirstName,
    hostLastName,
    hostCity,
    hostAddress,
    hostZip,
    hostRelationship,
    hostAddressVerified,
    situation,
    schooled,
  } = data;

  const isFrench = frenchNationality === "true";
  const isFrenchResident = livesInFrance === "true";

  const isVerifyAddressDisabled = !address || !city || !zip;
  const isVerifyHostAddressDisabled = !hostAddress || !hostCity || !hostZip;

  useEffect(() => {
    if (young) {
      const situationOptions = young.schooled === "true" ? youngSchooledSituationOptions : youngActiveSituationOptions;
      setSituationOptions(situationOptions);

      setData({
        ...data,
        schooled: young.schooled,
        situation: young.situation,
        frenchNationality: young.frenchNationality || data.frenchNationality,
        birthCountry: young.birthCountry || data.birthCountry,
        birthCity: young.birthCity || data.birthCity,
        birthCityZip: young.birthCityZip || data.birthCityZip,
        gender: young.gender || data.gender,
        phone: young.phone,
        livesInFrance: young.foreignCountry ? "false" : frenchNationalityOptions[0].value,
        country: young.country || FRANCE,
        address: young.address,
        city: young.city,
        zip: young.zip,
        foreignCountry: young.foreignCountry || "",
        foreignAddress: young.foreignAddress || "",
        foreignCity: young.foreignCity || "",
        foreignZip: young.foreignZip || "",
        hostFirstName: young.hostFirstName || "",
        hostLastName: young.hostLastName || "",
        hostRelationship: young.hostRelationship || "",
        hostCity: young.hostCity || "",
        hostZip: young.hostZip || "",
        hostAddress: young.hostAddress || "",
        hostRegion: young.hostRegion || "",
        hostDepartment: young.hostDepartment || "",
      });
    }
  }, [young]);

  useEffect(() => {
    setErrors(getErrors());
  }, [phone, frenchNationality, birthCityZip, zip, hostZip]);

  const getErrors = () => {
    let errors = {};

    if (phone && !validator.isMobilePhone(phone, ["fr-FR", "fr-GF", "fr-GP", "fr-MQ", "fr-RE"])) {
      errors.phone = errorMessages.phone;
    }

    if (isFrench && birthCityZip && !validator.isPostalCode(birthCityZip, "FR")) {
      errors.birthCityZip = errorMessages.zip;
    }
    if (isFrenchResident && zip && !validator.isPostalCode(zip, "FR")) {
      errors.zip = errorMessages.zip;
    }
    if (!isFrenchResident && hostZip && !validator.isPostalCode(hostZip, "FR")) {
      errors.hostZip = errorMessages.zip;
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
    if (livesInFrance === "true") {
      setData({ ...data, country: FRANCE, livesInFrance });
    } else {
      setData({ ...data, country: "", livesInFrance });
    }
  };

  const updateData = (key) => (value) => {
    setData({ ...data, [key]: value });
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

    if (isFrenchResident) {
      fieldToUpdate.push(...frenchAddressFields);
      requiredFields.push(...requiredFieldsFrench);
      if (addressVerified !== "true") {
        errors.addressVerified = errorMessages.addressVerified;
      }
    } else {
      fieldToUpdate.push(...foreignAddressFields);
      requiredFields.push(...requiredFieldsForeigner);
      if (hostAddressVerified !== "true") {
        errors.hostAddressVerified = errorMessages.addressVerified;
      }
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
    }
    setLoading(false);
  };

  const onSave = async () => {
    setLoading(true);

    const fieldToUpdate = [...commonFields];
    if (isFrenchResident) {
      fieldToUpdate.push(...frenchAddressFields);
    } else {
      fieldToUpdate.push(...foreignAddressFields);
    }
    const updates = {};
    fieldToUpdate.forEach((field) => {
      updates[field] = data[field];
    });

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

  const onVerifyAddress =
    (isPersonalAddress = true, isConfirmed) =>
    (suggestion) => {
      if (isPersonalAddress) {
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
      } else {
        setData({
          ...data,
          hostAddressVerified: "true",
          hostRegion: suggestion.region,
          hostDepartment: suggestion.department,
          hostCity: isConfirmed ? suggestion.city : hostCity,
          hostZip: isConfirmed ? suggestion.zip : hostZip,
          hostAddress: isConfirmed ? suggestion.address : hostAddress,
        });
        setErrors({ hostAddressVerified: undefined });
      }
    };

  return (
    <>
      <Navbar step={step} onSave={onSave} />
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Mon profile volontaire</h1>
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
        {isFrenchResident && (
          <VerifyAddress
            address={address}
            disabled={isVerifyAddressDisabled}
            zip={zip}
            city={city}
            onSuccess={onVerifyAddress(true, true)}
            onFail={onVerifyAddress(true)}
            message={addressVerified === "true" ? addressValidationSuccess : isVerifyAddressDisabled ? addressValidationInfo : errors.addressVerified}
            messageStyle={addressVerified === "true" || isVerifyAddressDisabled ? messageStyles.info : messageStyles.error}
          />
        )}
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
            <Input value={hostAddress} label="Son adresse" onChange={updateAddressData("hostAddress", false)} error={errors.hostAddress} />
            <Input value={hostZip} label="Code postal" onChange={updateAddressData("hostZip", false)} error={errors.hostZip} />
            <Input value={hostCity} label="Ville" onChange={updateAddressData("hostCity", false)} error={errors.hostCity} />
            <VerifyAddress
              address={hostAddress}
              disabled={isVerifyHostAddressDisabled}
              zip={hostZip}
              city={hostCity}
              onSuccess={onVerifyAddress(false, true)}
              onFail={onVerifyAddress(false)}
              message={hostAddressVerified === "true" ? addressValidationSuccess : isVerifyAddressDisabled ? addressValidationInfo : errors.hostAddressVerified}
              messageStyle={hostAddressVerified === "true" || isVerifyHostAddressDisabled ? messageStyles.info : messageStyles.error}
            />
          </>
        )}
        <Select
          label={schooled === "true" ? "Ma situation scolaire" : "Ma situation"}
          options={situationOptions}
          value={situation}
          onChange={updateData("situation")}
          error={errors.situation}
        />
      </div>
      <StickyButton text="Continuer" onClick={onSubmit} disabled={loading} />
    </>
  );
}

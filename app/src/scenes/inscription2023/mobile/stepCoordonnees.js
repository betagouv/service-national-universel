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
import { youngSchooledSituationOptions, youngActiveSituationOptions, countryOptions, hostRelationshipOptions, frenchNationalityOptions, genderOptions } from "../utils";

import api from "../../../services/api";
import VerifyAddress from "../components/VerifyAddress";
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
  addressVerified: "Merci de vérifier l'adresse",
  phone: "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX",
  zip: "Le code postal n'est pas valide",
};

const birthPlaceFields = ["birthCountry", "birthCity", "birthCityZip"];
const addressFields = ["address", "zip", "city", "cityCode", "region", "department", "location", "addressVerified"];
const foreignAddressFields = ["foreignCountry", "foreignAddress", "foreignCity", "foreignZip", "hostFirstName", "hostLastName", "hostRelationship"];

const commonFields = ["frenchNationality", ...birthPlaceFields, ...addressFields, "gender", "phone", "situation", "livesInFrance"];

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
];

const requiredFieldsForeigner = ["foreignCountry", "foreignAddress", "foreignCity", "foreignZip", "hostFirstName", "hostLastName", "hostRelationship"];

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
  } = data;

  const isFrench = frenchNationality === "true";
  const isFrenchResident = livesInFrance === "true";

  const isVerifyAddressDisabled = !address || !city || !zip;

  useEffect(() => {
    if (young) {
      const situationOptions = young.schooled === "true" ? youngSchooledSituationOptions : youngActiveSituationOptions;
      setSituationOptions(situationOptions);

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
      });
    }
  }, [young]);

  useEffect(() => {
    setErrors(getErrors());
  }, [phone, frenchNationality, birthCityZip, zip]);

  const getErrors = () => {
    let errors = {};

    if (phone && !validator.isMobilePhone(phone, ["fr-FR", "fr-GF", "fr-GP", "fr-MQ", "fr-RE"])) {
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

    fieldToUpdate.forEach((field) => {
      updates[field] = data[field];
    });

    updates.country = FRANCE;

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
      </div>
      <StickyButton text="Continuer" onClick={onSubmit} disabled={loading} />
    </>
  );
}

import Img2 from "../../../assets/infoSquared.svg";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory, useParams } from "react-router-dom";
import plausibleEvent from "../../../services/plausible";
import InformationCircle from "../../../assets/icons/InformationCircle";

import validator from "validator";

import RadioButton from "../../../components/dsfr/ui/buttons/RadioButton";
import Input from "../components/Input";
import Select from "../../../components/dsfr/forms/Select";
import ErrorMessage from "../../../components/dsfr/forms/ErrorMessage";
import Navbar from "../components/Navbar";
import {
  youngSchooledSituationOptions,
  youngActiveSituationOptions,
  foreignCountryOptions,
  hostRelationshipOptions,
  inFranceOrAbroadOptions,
  genderOptions,
  booleanOptions,
} from "../utils";

import api from "../../../services/api";
import SearchableSelect from "../../../components/dsfr/forms/SearchableSelect";
import CheckBox from "../../../components/dsfr/forms/checkbox";
import { setYoung } from "../../../redux/auth/actions";
import { debounce, translate } from "../../../utils";
import { capture } from "../../../sentry";
import { supportURL } from "../../../config";
import { YOUNG_STATUS } from "snu-lib";
import { getCorrectionByStep } from "../../../utils/navigation";
import { apiAdress, getAddressOptions } from "../../../services/api-adresse";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "@/components/dsfr/ui/buttons/SignupButtonContainer";
import AddressForm from "@/components/dsfr/forms/AddressForm";

const getObjectWithEmptyData = (fields) => {
  const object = {};
  fields.forEach((field) => {
    object[field] = "";
  });
  return object;
};

const FRANCE = "France";
const errorMessages = {
  phone: "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX",
  zip: "Le code postal n'est pas valide",
  hasSpecialSituation: "Merci de choisir au moins une option.",
};

const birthPlaceFields = ["birthCountry", "birthCity", "birthCityZip"];
const addressFields = ["address", "zip", "city", "cityCode", "region", "department", "location", "addressVerified", "coordinatesAccuracyLevel"];
const foreignAddressFields = ["foreignCountry", "foreignAddress", "foreignCity", "foreignZip", "hostFirstName", "hostLastName", "hostRelationship"];
const moreInformationFields = ["specificAmenagment", "reducedMobilityAccess", "handicapInSameDepartment"];

const commonFields = [...birthPlaceFields, ...addressFields, "gender", "situation", "livesInFrance", "handicap", "allergies", "ppsBeneficiary", "paiBeneficiary"];

const commonRequiredFields = [
  ...birthPlaceFields,
  "gender",
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
  birthCountry: FRANCE,
  birthCityZip: "",
  birthCity: "",
  gender: genderOptions[0].value,
  phone: "",
  phoneZone: "",
  livesInFrance: inFranceOrAbroadOptions[0].value,
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
  const [wasBornInFrance, setWasBornInFrance] = useState("true");
  const [data, setData] = useState(defaultState);
  const [errors, setErrors] = useState({});
  const [corrections, setCorrections] = useState({});
  const [situationOptions, setSituationOptions] = useState([]);
  const [birthCityZipSuggestions, setBirthCityZipSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const history = useHistory();
  const { step } = useParams();
  const ref = useRef(null);
  const modeCorrection = young.status === YOUNG_STATUS.WAITING_CORRECTION;

  const [hasSpecialSituation, setSpecialSituation] = useState(null);

  const {
    birthCountry,
    birthCityZip,
    birthCity,
    gender,
    livesInFrance,
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

  const wasBornInFranceBool = wasBornInFrance === "true";
  const isFrenchResident = livesInFrance === "true";

  const moreInformation = handicap === "true" || ppsBeneficiary === "true" || paiBeneficiary === "true";

  useEffect(() => {
    if (young) {
      const situationOptions = young.schooled === "true" ? youngSchooledSituationOptions : youngActiveSituationOptions;
      setSituationOptions(situationOptions);

      if (young.handicap === "true" || young.allergies === "true" || young.ppsBeneficiary === "true" || young.paiBeneficiary === "true") {
        setSpecialSituation(true);
      }

      setWasBornInFrance(!young.birthCountry || young.birthCountry === FRANCE ? "true" : "false");

      setData({
        ...data,
        schooled: young.schooled || data.schooled,
        situation: young.situation || data.situation,
        birthCountry: young.birthCountry || data.birthCountry,
        birthCity: young.birthCity || data.birthCity,
        birthCityZip: young.birthCityZip || data.birthCityZip,
        gender: young.gender || data.gender,
        livesInFrance: young.foreignCountry ? "false" : data.livesInFrance,
        address: young.address || data.address,
        addressVerified: young.addressVerified || data.addressVerified,
        coordinatesAccuracyLevel: young.coordinatesAccuracyLevel || data.coordinatesAccuracyLevel,
        city: young.city || data.city,
        zip: young.zip || data.zip,
        region: young.region || data.region,
        department: young.department || data.department,
        location: young.location || data.location,
        cityCode: young.cityCode || data.cityCode,
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
    if (young.status === YOUNG_STATUS.WAITING_CORRECTION) {
      const corrections = getCorrectionByStep(young, step);
      if (!Object.keys(corrections).length) return history.push("/");
      else setCorrections(corrections);
    }
  }, [young]);

  useEffect(() => {
    setErrors(getErrors());
  }, [birthCityZip, zip, hasSpecialSituation, handicap, allergies, ppsBeneficiary, paiBeneficiary]);

  const getErrors = () => {
    let errors = {};

    if (wasBornInFranceBool && birthCityZip && !validator.isPostalCode(birthCityZip, "FR")) {
      errors.birthCityZip = errorMessages.zip;
    }
    if (zip && !validator.isPostalCode(zip, "FR")) {
      errors.zip = errorMessages.zip;
    }

    if (hasSpecialSituation && handicap === "false" && allergies === "false" && ppsBeneficiary === "false" && paiBeneficiary === "false") {
      errors.hasSpecialSituation = errorMessages.hasSpecialSituation;
    }

    return errors;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setBirthCityZipSuggestions([]);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const updateWasBornInFrance = (newWasBornInFrance) => {
    if (newWasBornInFrance === "true") {
      setData({ ...data, ...getObjectWithEmptyData(birthPlaceFields), birthCountry: FRANCE });
    } else {
      setData({ ...data, ...getObjectWithEmptyData(birthPlaceFields) });
    }
    setWasBornInFrance(newWasBornInFrance);
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

  const debouncedSuggestionsRequest = useCallback(
    debounce(async (value) => {
      try {
        const response = await apiAdress(value, { type: "municipality" });
        const suggestions = response.features.map(({ properties: { city, postcode } }) => ({ city, postcode }));
        setBirthCityZipSuggestions(suggestions);
      } catch (error) {
        capture(error);
      }
    }, 100),
    [],
  );

  const updateBirthCity = async (value) => {
    setData({ ...data, birthCity: value });
    const trimmedValue = value.trim();
    if (trimmedValue && trimmedValue.length > 2) {
      debouncedSuggestionsRequest(trimmedValue);
    } else {
      setBirthCityZipSuggestions([]);
    }
  };

  const onClickBirthCitySuggestion = (birthCity, birthCityZip) => {
    setData({ ...data, birthCity, birthCityZip });
    setBirthCityZipSuggestions([]);
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

    if (moreInformation) {
      fieldToUpdate.push(...moreInformationFields);
      requiredFields.push(...requiredMoreInformationFields);
    }

    if (specificAmenagment === "true") {
      fieldToUpdate.push("specificAmenagmentType");
      requiredFields.push("specificAmenagmentType");
    }

    if (hasSpecialSituation === null) {
      errors.hasSpecialSituation = "Ce champ est obligatoire";
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
        plausibleEvent("Phase0/CTA inscription - profil");
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

  const onCorrection = async () => {
    setLoading(true);
    let errors = {};
    const fieldToUpdate = [...commonFields];
    const requiredFields = [...commonRequiredFields];

    if (!isFrenchResident) {
      fieldToUpdate.push(...foreignAddressFields);
      requiredFields.push(...requiredFieldsForeigner);
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
      updates.addressVerified = "true";

      try {
        const { ok, code, data: responseData } = await api.put("/young/inscription2023/coordinates/correction", updates);
        if (!ok) {
          setErrors({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
          setLoading(false);
          return;
        }
        plausibleEvent("Phase0/CTA demande correction - Corriger Coordonnees");
        dispatch(setYoung(responseData));
        history.push("/");
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
    updates.addressVerified = "true";

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

  const supportLink = `${supportURL}/base-de-connaissance/je-minscris-et-remplis-mon-profil`;

  return (
    <>
      <Navbar onSave={onSave} />
      <DSFRContainer title="Mon profil volontaire" supportLink={supportLink}>
        <RadioButton label="Je suis né(e)..." options={inFranceOrAbroadOptions} onChange={updateWasBornInFrance} value={wasBornInFrance} />
        {!wasBornInFranceBool && (
          <SearchableSelect
            label="Pays de naissance"
            value={birthCountry}
            options={foreignCountryOptions}
            onChange={updateData("birthCountry")}
            placeholder="Sélectionnez un pays"
            error={errors.birthCountry}
            correction={corrections?.birthCountry}
          />
        )}
        <div className="flex flex-col md:flex-row md:gap-8">
          <div className="relative w-full">
            <Input
              list="suggestions"
              value={birthCity}
              label="Commune de naissance"
              onChange={wasBornInFranceBool ? updateBirthCity : updateData("birthCity")}
              error={errors.birthCity}
              correction={corrections?.birthCity}
            />
            {wasBornInFranceBool && (
              <div ref={ref} className="border-3 absolute z-[100] mt-[-24px] w-full overflow-hidden border-red-600 bg-white shadow">
                {birthCityZipSuggestions.map(({ city, postcode }, index) => (
                  <div
                    onClick={() => {
                      onClickBirthCitySuggestion(city, postcode);
                    }}
                    className="group flex cursor-pointer items-center justify-between gap-2 p-2  px-3 hover:bg-gray-50"
                    key={`${index} - ${postcode}`}>{`${city} - ${postcode}`}</div>
                ))}
              </div>
            )}
          </div>
          <Input
            value={birthCityZip}
            label="Code postal de naissance"
            onChange={updateData("birthCityZip")}
            error={errors.birthCityZip}
            correction={corrections?.birthCityZip}
            className="w-full"
          />
        </div>
        <RadioButton label="Sexe" options={genderOptions} onChange={updateData("gender")} value={gender} error={errors?.gender} correction={corrections.gender} />
        <RadioButton
          label="Je réside..."
          options={inFranceOrAbroadOptions}
          onChange={setLivesInFrance}
          value={livesInFrance}
          error={errors?.livesInFrance}
          correction={corrections?.livesInFrance}
        />
        {isFrenchResident && (
          <AddressForm
            data={data}
            updateData={(newData) => setData({ ...data, ...newData })}
            getOptions={getAddressOptions}
            error={errors.address}
            correction={corrections?.address}
          />
        )}
        {!isFrenchResident && (
          <SearchableSelect
            label="Pays de résidence"
            value={foreignCountry}
            options={foreignCountryOptions}
            onChange={updateData("foreignCountry")}
            placeholder="Sélectionnez un pays"
            error={errors.foreignCountry}
            correction={corrections?.foreignCountry}
          />
        )}
        {!isFrenchResident && (
          <>
            <h2 className="text-[16px] font-bold">Mon hébergeur</h2>
            <div className="my-3 flex">
              <div className="flex w-[40px] min-w-[40px] items-center justify-center bg-[#0063CB]">
                <img src={Img2} height={20} width={20} />
              </div>
              <div className="border-2 border-[#0063CB] p-3 text-justify  text-[#3A3A3A] shadow-sm">
                Proche chez qui vous séjournerez le temps de la réalisation de votre SNU (lieu de départ/retour pour le séjour et de réalisation de la MIG).
              </div>
            </div>
            <p className="text-justify text-[14px] leading-tight text-[#666666]">
              À noter : l’hébergement chez un proche en France ainsi que le transport entre votre lieu de résidence et celui de votre hébergeur sont à votre charge.
            </p>
            <Input
              value={hostFirstName}
              label="Prénom de l’hébergeur"
              onChange={updateData("hostFirstName")}
              error={errors.hostFirstName}
              correction={corrections?.hostFirstName}
            />
            <Input value={hostLastName} label="Nom de l’hébergeur" onChange={updateData("hostLastName")} error={errors.hostLastName} correction={corrections?.hostLastName} />
            <Select
              options={hostRelationshipOptions}
              value={hostRelationship}
              label="Précisez votre lien avec l’hébergeur"
              onChange={updateData("hostRelationship")}
              error={errors.hostRelationship}
              correction={corrections?.hostRelationship}
            />
            <AddressForm
              data={data}
              updateData={(newData) => setData({ ...data, ...newData })}
              getOptions={getAddressOptions}
              error={errors.address}
              correction={corrections?.address}
            />
          </>
        )}

        <Select
          label={schooled === "true" ? "Ma situation scolaire" : "Ma situation"}
          options={situationOptions}
          value={situation}
          onChange={updateData("situation")}
          error={errors.situation}
          correction={corrections?.situation}
        />
        <hr className="my-2 h-px border-0 bg-gray-200" />
        <div className="flex mt-4 items-center gap-3 mb-4">
          <h2 className="m-0 text-lg font-semibold leading-6 align-left">Situations particulières</h2>
          <a className="mt-1" href={`${supportURL}/base-de-connaissance/je-suis-en-situation-de-handicap-et-jai-besoin-dun-amenagement-specifique`} target="_blank" rel="noreferrer">
            <RiInformationFill className="text-xl text-blue-france-sun-113 hover:text-blue-france-sun-113-hover" />

          </a>
        </div>
        <div className="mb-4 flex items-center">
          <div>
            <h2 className="mt-0 text-[16px] font-bold">
              Souhaitez-vous nous faire part d’une situation particulière ?
              <span className="text-[14px]">(allergie, situation de handicap, besoin d&apos;un aménagement spécifique, ...)</span>
            </h2>
            <div className=" mt-1 text-[14px] leading-tight text-[#666666]">En fonction des situations signalées, un responsable prendra contact avec vous.</div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row mb-4">
          <div className="pr-4 border-r">
            <input
              className="mr-2"
              type="radio"
              id="oui"
              name="specialSituation"
              value="true"
              checked={hasSpecialSituation === true}
              onChange={(e) => updateSpecialSituation(e.target.value === "true")}
            />
            <label className="mb-0" htmlFor="oui">
              Oui
            </label>
          </div>
          <div className="md:px-6">
            <input
              className="mr-2"
              type="radio"
              id="non"
              name="specialSituation"
              value="false"
              checked={hasSpecialSituation === false}
              onChange={(e) => updateSpecialSituation(e.target.value === "true")}
            />
            <label className="mb-0" htmlFor="non">
              Non
            </label>
          </div>
        </div>
        <ErrorMessage>{errors.hasSpecialSituation}</ErrorMessage>
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
                <hr className="my-4 h-px border-0 bg-gray-200" />
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
                  label="Pour le séjour de cohésion, avez-vous besoin d’être affecté(e) dans un centre proche de chez vous pour raison médicale ?"
                  options={booleanOptions}
                  onChange={updateData("handicapInSameDepartment")}
                  value={handicapInSameDepartment}
                  error={errors.handicapInSameDepartment}
                />
              </>
            )}
          </>
        )}
        <SignupButtonContainer onClickNext={modeCorrection ? onCorrection : onSubmit} disabled={loading} />
      </DSFRContainer>
    </>
  );
}

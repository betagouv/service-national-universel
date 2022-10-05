import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import validator from "validator";
import RadioButton from "../components/RadioButton";
import Input from "../components/Input";
import Header from "../components/Header";
import GhostButton from "../components/GhostButton";
import Select from "../components/Select";
import { youngSchooledSituationOptions, youngActiveSituationOptions, countryOptions, hostRelationShipOptions, frenchNationalityOptions, genderOptions } from "../utils";
import api from "../../../services/api";

const FRANCE = "France";

const defaultState = {
  frenchNationality: frenchNationalityOptions[0].value,
  birthCountry: FRANCE,
  birthCity: "",
  birthCityZip: "",
  gender: genderOptions[0].value,
  phone: "",
  livesInFrance: frenchNationalityOptions[0].value,
  country: FRANCE,
  address: "",
  city: "",
  zip: "",
  hostFirstName: "",
  hostLastName: "",
  hostRelationShip: "",
  hostCity: "",
  hostZip: "",
  hostAddress: "",
  //@todo: change for only one key after data retrieve
  schoolSituation: youngSchooledSituationOptions[0].value,
  activeSitutation: youngActiveSituationOptions[0].value,
};

export default function StepCoordonnees() {
  const [data, setData] = useState(defaultState);
  const [errors, setErrors] = useState({});
  const young = useSelector((state) => state.Auth.young);

  const {
    frenchNationality,
    birthCountry,
    birthCityZip,
    birthCity,
    gender,
    phone,
    livesInFrance,
    country,
    address,
    zip,
    city,
    hostFirstName,
    hostLastName,
    hostCity,
    hostAddress,
    hostZip,
    hostRelationShip,
    schoolSituation,
    activeSitutation,
  } = data;

  const getErrors = () => {
    let errors = {};
    if (phone && !validator.isMobilePhone(phone)) {
      errors.phone = "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX";
    }
    if (frenchNationality && birthCityZip && !validator.isPostalCode(birthCityZip, "FR")) {
      errors.birthCityZip = "Le code postal n'est pas valide";
    }

    return errors;
  };

  useEffect(() => {
    console.log("getting errors");
    setErrors(getErrors());
  }, [phone, frenchNationality, birthCityZip]);

  const onSubmit = async () => {
    let errors = {};
    const requiredFields = [
      "frenchNationality",
      "birthCountry",
      "birthCityZip",
      "birthCity",
      "gender",
      "phone",
      "livesInFrance",
      "country",
      "address",
      "zip",
      "city",
      "schoolSituation",
      "activeSitutation",
    ];
    const requiredFieldsForForeignYoung = ["hostFirstName", "hostLastName", "hostCity", "hostAddress", "hostZip", "hostRelationShip"];
    if (!livesInFrance) {
      requiredFields.push(...requiredFieldsForForeignYoung);
    }
    for (const key of requiredFields) {
      if (data[key] === undefined || data[key] === "") {
        errors[key] = "Ce champ est obligatoire";
      }
    }

    errors = { ...errors, ...getErrors() };

    setErrors(errors);
    if (!Object.keys(errors).length) {
      const { ok, code, data: responsData } = await api.put(`/young/inscription2023/coordinates`, data);
      //@todo display success/error messages
    }
  };

  const setFrenchNationality = (frenchNationality) => {
    if (frenchNationality) {
      setData({ ...data, birthCountry: FRANCE, frenchNationality });
    } else {
      setData({ ...data, birthCountry: "", frenchNationality });
    }
  };

  const setLivesInFrance = (livesInFrance) => {
    if (livesInFrance) {
      setData({ ...data, country: FRANCE, livesInFrance });
    } else {
      setData({ ...data, country: "", livesInFrance });
    }
  };

  const updateData = (key) => (value) => {
    setData({ ...data, [key]: value });
  };

  return (
    <>
      <Header />
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Mon profile volontaire</h1>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <RadioButton label="Je suis né(e)..." options={frenchNationalityOptions} onChange={setFrenchNationality} value={frenchNationality} />
        {!frenchNationality && (
          <Select
            options={countryOptions}
            value={birthCountry}
            label="Pays de naissance"
            placeholder="Sélectionnez un pays"
            onChange={updateData("birthCountry")}
            error={errors.birthCity}
          />
        )}
        <Input value={birthCityZip} label="Code postal de naissance" onChange={updateData("birthCityZip")} error={errors.birthCityZip} />
        <Input value={birthCity} label="Commune de naissance" onChange={updateData("birthCity")} error={errors.birthCity} />
        <RadioButton label="Sexe" options={genderOptions} onChange={updateData("gender")} value={gender} />
        <Input type="tel" value={phone} label="Votre téléphone" onChange={updateData("phone")} error={errors.phone} />
        <RadioButton label="Je réside..." options={frenchNationalityOptions} onChange={setLivesInFrance} value={livesInFrance} />
        {!livesInFrance && (
          <Select options={countryOptions} value={country} label="Pays de résidence" placeholder="Sélectionnez un pays" onChange={updateData("country")} error={errors.country} />
        )}
        <Input value={address} label="Adresse de résidence" onChange={updateData("address")} error={errors.address} />
        <Input value={zip} label="Code postal" onChange={updateData("zip")} error={errors.zip} />
        <Input value={city} label="Ville" onChange={updateData("city")} error={errors.city} />
        {livesInFrance && <GhostButton className="my-3" name="Vérifier mon adresse" onClick={() => {}} />}
        {!livesInFrance && (
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
              options={hostRelationShipOptions}
              value={hostRelationShip}
              label="Précisez votre lien avec l’hébergeur"
              onChange={updateData("hostRelationShip")}
              error={errors.hostRelationShip}
            />
            <Input value={hostAddress} label="Son adresse" onChange={updateData("hostAddress")} error={errors.hostAddress} />
            <Input value={hostZip} label="Code postal" onChange={updateData("hostZip")} error={errors.hostZip} />
            <Input value={hostCity} label="Ville" onChange={updateData("hostCity")} error={errors.hostCity} />
            <GhostButton name="Vérifier" onClick={() => {}} />
          </>
        )}
        <Select
          label="Ma situation scolaire"
          options={youngSchooledSituationOptions}
          value={schoolSituation}
          onChange={updateData("schoolSituation")}
          error={errors.schoolSituation}
        />
        <Select label="Ma situation" options={youngActiveSituationOptions} value={activeSitutation} onChange={updateData("activeSitutation")} error={errors.activeSitutation} />
        <GhostButton type="submit" name="Next" onClick={onSubmit} />
      </div>
    </>
  );
}

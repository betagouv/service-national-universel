import React from "react";
import { useState } from "react";
import RadioButton from "../components/RadioButton";
import Input from "../components/Input";
import Header from "../components/Header";
import GhostButton from "../components/GhostButton";
import Select from "../components/Select";
import { youngSchooledSituationOptions, youngActiveSituationOptions, countryOptions, hostRelationShipOptions, isFrenchOptions, genderOptions } from "../utils";

const FRANCE = "France";

const defaultState = {
  isFrench: isFrenchOptions[0].value,
  birthCountry: FRANCE,
  birthCity: "",
  birthCityZip: "",
  gender: genderOptions[0].value,
  phone: "",
  isFrenchResident: isFrenchOptions[0].value,
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

  const setFrench = (isFrench) => {
    if (isFrenchResident) {
      setData({ ...data, birthCountry: FRANCE, isFrench });
    } else {
      setData({ ...data, birthCountry: "", isFrench });
    }
  };

  const setFrenchResident = (isFrenchResident) => {
    if (isFrenchResident) {
      setData({ ...data, country: FRANCE, isFrenchResident });
    } else {
      setData({ ...data, country: "", isFrenchResident });
    }
  };

  const updateData = (key) => (value) => {
    setData({ ...data, [key]: value });
  };

  const {
    isFrench,
    birthCountry,
    birthCityZip,
    birthCity,
    gender,
    phone,
    isFrenchResident,
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

  return (
    <>
      <Header />
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Mon profile volontaire</h1>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <RadioButton className="my-4" label="Je suis né(e)..." options={isFrenchOptions} onChange={setFrench} value={isFrench} />
        {!isFrench && (
          <Select
            options={countryOptions}
            className="my-4"
            value={birthCountry}
            label="Pays de naissance"
            placeholder="Sélectionnez un pays"
            onChange={updateData("birthCountry")}
          />
        )}
        <Input className="my-4" value={birthCityZip} label="Code postal de naissance" onChange={updateData("birthCityZip")} />
        <Input className="my-4" value={birthCity} label="Commune de naissance" onChange={updateData("birthCity")} />
        <RadioButton className="my-4" label="Sexe" options={genderOptions} onChange={updateData("gender")} value={gender} />
        <Input type="tel" className="my-4" value={phone} label="Votre téléphone" onChange={updateData("phone")} />
        <RadioButton className="my-4" label="Je réside..." options={isFrenchOptions} onChange={setFrenchResident} value={isFrenchResident} />
        {!isFrenchResident && (
          <Select options={countryOptions} className="my-4" value={country} label="Pays de résidence" placeholder="Sélectionnez un pays" onChange={updateData("country")} />
        )}
        <Input className="my-4" value={address} label="Adresse de résidence" onChange={updateData("address")} />
        <Input className="my-4" value={zip} label="Code postal" onChange={updateData("zip")} />
        <Input className="my-4" value={city} label="Ville" onChange={updateData("city")} />
        {isFrenchResident && <GhostButton name="Vérifier mon adresse" onClick={() => {}} />}
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
            <Input className="my-4" value={hostFirstName} label="Prénom de l’hébergeur" onChange={updateData("hostFirstName")} />
            <Input className="my-4" value={hostLastName} label="Nom de l’hébergeur" onChange={updateData("hostLastName")} />
            <Select
              options={hostRelationShipOptions}
              className="my-4"
              value={hostRelationShip}
              label="Précisez votre lien avec l’hébergeur"
              onChange={updateData("hostRelationShip")}
            />
            <Input className="my-4" value={hostAddress} label="Son adresse" onChange={updateData("hostAddress")} />
            <Input className="my-4" value={hostZip} label="Code postal" onChange={updateData("hostZip")} />
            <Input className="my-4" value={hostCity} label="Ville" onChange={updateData("hostCity")} />
            <GhostButton name="Vérifier" onClick={() => {}} />
          </>
        )}
        <Select className="my-4" label="Ma situation scolaire" options={youngSchooledSituationOptions} value={schoolSituation} onChange={updateData("schoolSituation")} />
        <Select className="my-4" label="Ma situation" options={youngActiveSituationOptions} value={activeSitutation} onChange={updateData("activeSitutation")} />
      </div>
    </>
  );
}

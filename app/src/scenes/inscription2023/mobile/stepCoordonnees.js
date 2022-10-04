import React from "react";
import { useState } from "react";
import RadioButton from "../components/RadioButton";
import Input from "../components/Input";
import Header from "../components/Header";
import GhostButton from "../components/GhostButton";
import Select from "../components/Select";
import { youngSchooledSituationOptions, youngActiveSituationOptions, countryOptions, hostRelationShipOptions, isFrenchOptions, genderOptions } from "../utils";

const FRANCE = "France";

export default function StepCoordonnees() {
  const [isFrench, setFrench] = useState(isFrenchOptions[0].value);
  const [gender, setGender] = useState(genderOptions[0].value);
  const [birthCity, setBirthCity] = useState("");
  const [birthCityZip, setBirthCityZip] = useState("");
  const [phone, setPhone] = useState("");
  const [isFrenchResident, _setFrenchResident] = useState(isFrenchOptions[0].value);
  const [country, setCountry] = useState(FRANCE);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [hostFirstName, setHostFirstName] = useState("");
  const [hostLastName, setHostLastName] = useState("");
  const [hostRelationShip, setHostRelationShip] = useState("");
  const [hostCity, setHostCity] = useState("");
  const [hostZip, setHostZip] = useState("");
  const [hostAddress, setHostAddress] = useState("");
  const [schoolSituation, setSchoolSituation] = useState(youngSchooledSituationOptions[0].value);
  const [activeSitutation, setActiveSituation] = useState(youngActiveSituationOptions[0].value);

  const setFrenchResident = (isFrenchResident) => {
    if (isFrenchResident) {
      setCountry(FRANCE);
    } else {
      setCountry("");
    }
    _setFrenchResident(isFrenchResident);
  };

  return (
    <>
      <Header />
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Mon profile volontaire</h1>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <RadioButton className="my-4" label="Je suis né(e)..." options={isFrenchOptions} onChange={setFrench} value={isFrench} />
        <Input className="my-4" value={birthCityZip} label="Code postal de naissance" onChange={setBirthCityZip} />
        <Input className="my-4" value={birthCity} label="Commune de naissance" onChange={setBirthCity} />
        <RadioButton className="my-4" label="Sexe" options={genderOptions} onChange={setGender} value={gender} />
        <Input type="tel" className="my-4" value={phone} label="Votre téléphone" onChange={setPhone} />
        <RadioButton className="my-4" label="Je réside..." options={isFrenchOptions} onChange={setFrenchResident} value={isFrenchResident} />
        {!isFrenchResident && (
          <Select options={countryOptions} className="my-4" value={country} label="Pays de résidence" placeholder="Sélectionnez un pays" onChange={setCountry} />
        )}
        <Input className="my-4" value={address} label="Adresse de résidence" onChange={setAddress} />
        <Input className="my-4" value={zip} label="Code postal" onChange={setZip} />
        <Input className="my-4" value={city} label="Ville" onChange={setCity} />
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
            <Input className="my-4" value={hostFirstName} label="Prénom de l’hébergeur" onChange={setHostFirstName} />
            <Input className="my-4" value={hostLastName} label="Nom de l’hébergeur" onChange={setHostLastName} />
            <Select options={hostRelationShipOptions} className="my-4" value={hostRelationShip} label="Précisez votre lien avec l’hébergeur" onChange={setHostRelationShip} />
            <Input className="my-4" value={hostAddress} label="Son adresse" onChange={setHostCity} />
            <Input className="my-4" value={hostZip} label="Code postal" onChange={setHostZip} />
            <Input className="my-4" value={hostCity} label="Ville" onChange={setHostAddress} />
            <GhostButton name="Vérifier" onClick={() => {}} />
          </>
        )}
        <Select className="my-4" label="Ma situation scolaire" options={youngSchooledSituationOptions} value={schoolSituation} onChange={setSchoolSituation} />
        <Select className="my-4" label="Ma situation" options={youngActiveSituationOptions} value={activeSitutation} onChange={setActiveSituation} />
      </div>
    </>
  );
}

import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import SearchableSelect from "../../../components/SearchableSelect";
import CreatableSelect from "../../../components/CreatableSelect";
import { ES_NO_LIMIT } from "snu-lib";
import Input from "./Input";
import VerifyAddress from "./VerifyAddress";

const addressValidationInfo = "Pour valider votre adresse vous devez remplir les champs adresse de résidence, code postale et ville.";
const addressValidationSuccess = "L'adresse a été vérifiée";

// const errorMessages = {
//   addressVerified: "Merci de valider l'adresse",
//   phone: "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX",
//   zip: "Le code postal n'est pas valide",
// };

export const messageStyles = {
  info: "info",
  error: "error",
};

export default function SchoolInFrance({ school, onSelectSchool }) {
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState(school?.city);
  const [schools, setSchools] = useState([]);

  const [manualFilling, setManualFilling] = useState(false);
  console.log("🚀 ~ file: ShoolInFrance.js ~ line 29 ~ SchoolInFrance ~ manualFilling", manualFilling);
  const [manualSchool, setManualSchool] = useState({});
  const [errors, setErrors] = useState({});

  console.log("🚀 ~ file: ShoolInFrance.js ~ line 24 ~ SchoolInFrance ~ school", school);
  console.log("🚀 ~ file: ShoolInFrance.js ~ line 31 ~ SchoolInFrance ~ manualSchool", manualSchool);

  const isVerifyAddressDisabled = !manualSchool.fullName || !manualSchool.address || !manualSchool.city || !manualSchool.postCode;

  useEffect(() => {
    async function getCities() {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "country.keyword": "FRANCE" } }] } },
        size: 0,
        aggs: {
          cities: { terms: { field: "city.keyword", size: ES_NO_LIMIT } },
        },
      };
      const { responses } = await api.esQuery("schoolramses", body);
      setCities(responses[0].aggregations?.cities.buckets.map((e) => e.key).sort());
    }
    getCities();
  }, []);

  useEffect(() => {
    async function getSchools() {
      if (!city) return;
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "country.keyword": "FRANCE" } }] } },
        size: ES_NO_LIMIT,
      };
      body.query.bool.filter.push({ term: { "city.keyword": city } });
      const { responses } = await api.esQuery("schoolramses", body);
      setSchools(responses[0].hits.hits.map((e) => e._source));
    }
    getSchools();
  }, [city]);

  const onVerifyAddress = (isConfirmed) => (suggestion) => {
    setManualSchool({
      ...manualSchool,
      addressVerified: "true",
      cityCode: suggestion.cityCode,
      region: suggestion.region,
      department: suggestion.department,
      location: suggestion.location,
      // if the suggestion is not confirmed we keep the address typed by the user
      address: isConfirmed ? suggestion.address : manualSchool.address,
      postCode: isConfirmed ? suggestion.zip : manualSchool.postCode,
      city: isConfirmed ? suggestion.city : manualSchool.city,
    });
    setErrors({ addressVerified: undefined });
    onSelectSchool(manualSchool);
  };

  return manualFilling ? (
    <>
      <Input
        value={manualSchool.fullName}
        label="Nom de l'établissement"
        onChange={(value) => {
          setManualSchool({ ...manualSchool, fullName: value, addressVerified: undefined });
        }}
        error={errors.fullName}
      />
      <Input
        value={manualSchool.address}
        label="Adresse de l'établissement"
        onChange={(value) => {
          setManualSchool({ ...manualSchool, address: value, addressVerified: undefined });
        }}
        error={errors.address}
      />
      <Input
        value={manualSchool.postCode}
        label="Code postal de l'établissement"
        onChange={(value) => {
          setManualSchool({ ...manualSchool, postCode: value, addressVerified: undefined });
        }}
        error={errors.postCode}
      />
      <Input
        value={manualSchool.city}
        label="Ville de l'établissement"
        onChange={(value) => {
          setManualSchool({ ...manualSchool, city: value, addressVerified: undefined });
        }}
        error={errors.city}
      />
      <VerifyAddress
        address={manualSchool.address}
        disabled={isVerifyAddressDisabled}
        zip={manualSchool.postCode}
        city={city}
        onSuccess={onVerifyAddress(true)}
        onFail={onVerifyAddress(false)}
        message={manualSchool.addressVerified === "true" ? addressValidationSuccess : isVerifyAddressDisabled ? addressValidationInfo : errors.addressVerified}
        messageStyle={manualSchool.addressVerified === "true" || isVerifyAddressDisabled ? messageStyles.info : messageStyles.error}
      />
    </>
  ) : (
    <>
      <div className="form-group">
        <SearchableSelect
          label="Commune de l'établissement"
          value={city}
          options={cities.map((c) => ({ value: c, label: c }))}
          onChange={(value) => {
            setCity(value);
            setManualSchool({ ...manualSchool, city: value });
          }}
          placeholder="Sélectionnez une commune"
        />
      </div>
      <div className="form-group">
        <CreatableSelect
          label="Nom de l'établissement"
          value={school && `${school.fullName} - ${school.adresse}`}
          options={schools
            .map((e) => `${e.fullName} - ${e.adresse}`)
            .sort()
            .map((c) => ({ value: c, label: c }))}
          onChange={(value) => {
            onSelectSchool(schools.find((e) => `${e.fullName} - ${e.adresse}` === value));
          }}
          placeholder="Sélectionnez un établissement"
          onCreateOption={(value) => {
            setManualSchool({ ...manualSchool, fullName: value });
            setManualFilling(true);
          }}
        />
      </div>
    </>
  );
}

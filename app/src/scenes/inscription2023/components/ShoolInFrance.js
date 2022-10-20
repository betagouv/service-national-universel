import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import SearchableSelect from "../../../components/SearchableSelect";
import CreatableSelect from "../../../components/CreatableSelect";
import { ES_NO_LIMIT } from "snu-lib";
import Input from "./Input";
import VerifyAddress from "./VerifyAddress";
import GhostButton from "./GhostButton";
import { FiChevronLeft } from "react-icons/fi";
import validator from "validator";
import ErrorMessage from "./ErrorMessage";

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

export default function SchoolInFrance({ school, onSelectSchool, toggleVerify }) {
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState(school?.city);
  const [schools, setSchools] = useState([]);

  const [manualFilling, setManualFilling] = useState(school?.addressVerified);
  const [manualSchool, setManualSchool] = useState(school ?? {});
  const [errors, setErrors] = useState({});

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
    if (!cities.length) return;

    let errors = {};

    if (!school?.fullName) {
      errors.fullName = "Vous devez renseigner le nom de l'établissement";
    }
    if (!city) {
      errors.city = "Vous devez renseigner le nom de la ville";
    }

    if (manualFilling && Object.keys(manualSchool).length) {
      if (!manualSchool?.fullName) {
        errors.manualFullName = "Vous devez renseigner le nom de l'établissement";
      }
      if (!manualSchool?.address) {
        errors.manualAddress = "Vous devez renseigner une adresse";
      }
      if (!manualSchool?.city) {
        errors.manualCity = "Vous devez renseigner le nom de la ville";
      }
      if (!(manualSchool?.postCode && validator.isPostalCode(manualSchool?.postCode, "FR"))) {
        errors.manualPostCode = "Vous devez sélectionner un code postal";
      }
      if (!manualSchool?.addressVerified) {
        errors.addressVerified = "Merci de vérifier l'adresse";
      }
    }

    setErrors(errors);
  }, [toggleVerify]);

  useEffect(() => {
    async function getSchools() {
      if (!city) return;
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "country.keyword": "FRANCE" } }] } },
        size: ES_NO_LIMIT,
      };
      body.query.bool.filter.push({ term: { "city.keyword": city } });
      const { responses } = await api.esQuery("schoolramses", body);
      setSchools(responses[0].hits.hits.map((e) => new Object({ ...e._source, ...{ id: e._id } })));
    }
    getSchools();
  }, [city]);

  const onVerifyAddress = (isConfirmed) => (suggestion) => {
    const newSchool = {
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
    };
    setManualSchool(newSchool);
    setErrors({ addressVerified: undefined });
    onSelectSchool(newSchool);
  };

  return manualFilling ? (
    <>
      <Input
        value={manualSchool.fullName}
        label="Nom de l'établissement"
        onChange={(value) => {
          setManualSchool({ ...manualSchool, fullName: value, addressVerified: undefined });
          onSelectSchool(null);
        }}
        error={errors.manualFullName}
      />
      <Input
        value={manualSchool.address}
        label="Adresse de l'établissement"
        onChange={(value) => {
          setManualSchool({ ...manualSchool, address: value, addressVerified: undefined });
          onSelectSchool(null);
        }}
        error={errors.manualAddress}
      />
      <Input
        value={manualSchool.postCode}
        label="Code postal de l'établissement"
        onChange={(value) => {
          setManualSchool({ ...manualSchool, postCode: value, addressVerified: undefined });
          onSelectSchool(null);
        }}
        error={errors.manualPostCode}
      />
      <Input
        value={manualSchool.city}
        label="Ville de l'établissement"
        onChange={(value) => {
          setManualSchool({ ...manualSchool, city: value, addressVerified: undefined });
          onSelectSchool(null);
        }}
        error={errors.manualCity}
      />
      <VerifyAddress
        address={manualSchool.address}
        disabled={isVerifyAddressDisabled}
        zip={manualSchool.postCode}
        city={city}
        onSuccess={onVerifyAddress(true)}
        onFail={onVerifyAddress(false)}
        isVerified={manualSchool.addressVerified}
        message={manualSchool.addressVerified === "true" ? addressValidationSuccess : isVerifyAddressDisabled ? addressValidationInfo : errors.addressVerified}
        messageStyle={manualSchool.addressVerified === "true" || isVerifyAddressDisabled ? messageStyles.info : messageStyles.error}
      />
      <div className="flex justify-end">
        <ErrorMessage>{errors.addressVerified}</ErrorMessage>
      </div>
      <GhostButton
        name={
          <div className="flex text-center items-center justify-center gap-1">
            <FiChevronLeft className="text-[#000091] font-bold" />
            Revenir à la liste des établissements
          </div>
        }
        onClick={() => {
          setManualFilling(false);
        }}
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
            setManualSchool({ ...manualSchool, city: value, addressVerified: undefined });
            onSelectSchool(null);
          }}
          placeholder="Sélectionnez une commune"
          error={errors.city}
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
            setManualSchool({ ...manualSchool, fullName: value, addressVerified: undefined });
            onSelectSchool(null);
            setManualFilling(true);
          }}
          error={errors.fullName}
        />
      </div>
    </>
  );
}

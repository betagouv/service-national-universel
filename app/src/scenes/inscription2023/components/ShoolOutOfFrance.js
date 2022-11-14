import React, { useEffect, useState } from "react";
import { ES_NO_LIMIT } from "snu-lib";
import CreatableSelect from "../../../components/CreatableSelect";
import api from "../../../services/api";

export default function SchoolOutOfFrance({ school, onSelectSchool, toggleVerify, corrections = null }) {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState(school?.country);
  const [schools, setSchools] = useState([]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function getCountries() {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [] } },
        size: 0,
        aggs: {
          countries: { terms: { field: "country.keyword", size: ES_NO_LIMIT } },
        },
      };
      const { responses } = await api.esQuery("schoolramses", body);
      setCountries(
        responses[0].aggregations.countries.buckets
          .filter((e) => e.key !== "FRANCE")
          .map((e) => e.key)
          .sort(),
      );
    }
    getCountries();
  }, []);

  useEffect(() => {
    if (!countries.length) return;

    let errors = {};

    if (!school?.fullName) {
      errors.fullName = "Vous devez mettre le nom de l'établissement";
    }
    if (!country) {
      errors.country = "Vous devez mettre le nom du pays";
    }

    setErrors(errors);
  }, [toggleVerify]);

  useEffect(() => {
    async function getSchools() {
      if (!country) return;
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [] } },
        size: ES_NO_LIMIT,
      };
      body.query.bool.filter.push({ term: { "country.keyword": country } });
      const { responses } = await api.esQuery("schoolramses", body);
      setSchools(responses[0].hits.hits.map((e) => new Object({ ...e._source, ...{ id: e._id } })));
    }
    getSchools();
  }, [country]);

  return (
    <>
      <CreatableSelect
        label="Pays de l'établissement"
        value={country}
        options={countries.map((c) => ({ value: c, label: c }))}
        onChange={(value) => {
          setCountry(value);
        }}
        placeholder="Sélectionnez un pays"
        error={errors.country}
        corrections={corrections?.country}
      />
      <CreatableSelect
        label="Nom de l'établissement"
        value={school && `${school.fullName}${school.city ? ` - ${school.city}` : ""}`}
        options={schools
          .map((e) => `${e.fullName} - ${e.city}`)
          .sort()
          .map((c) => ({ value: c, label: c }))}
        onChange={(value) => {
          const selectedSchool = schools.find((e) => `${e.fullName} - ${e.city}` === value);
          onSelectSchool(selectedSchool ?? { fullName: value, country });
        }}
        placeholder="Sélectionnez un établissement"
        error={errors.fullName}
        correction={corrections?.schoolName}
      />
    </>
  );
}

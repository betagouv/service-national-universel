import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import SearchableSelect from "../../../components/SearchableSelect";

export default function SchoolInFrance({ onSelectSchool }) {
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState("");
  const [schools, setSchools] = useState([]);
  const [school, setSchool] = useState("");

  useEffect(() => {
    async function getCities() {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "country.keyword": "FRANCE" } }] } },
        size: 0,
        aggs: {
          cities: { terms: { field: "city.keyword", size: 10000 } },
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
      };
      body.query.bool.filter.push({ term: { "city.keyword": city } });
      const { responses } = await api.esQuery("schoolramses", body);
      setSchools(responses[0].hits.hits.map((e) => e._source));
    }
    getSchools();
  }, [city]);

  useEffect(() => {
    if (school) {
      onSelectSchool(schools.find((e) => `${e.fullName} - ${e.adresse}` === school));
    }
  }, [school]);

  return (
    <>
      <div className="form-group">
        <SearchableSelect
          label="Commune de l'établissement"
          value={city}
          options={cities.map((c) => ({ value: c, label: c }))}
          onChange={(value) => {
            setCity(value);
          }}
          placeholder="Sélectionnez une commune"
        />
      </div>
      <div className="form-group">
        <SearchableSelect
          label="Nom de l'établissement"
          value={school}
          options={schools
            .map((e) => `${e.fullName} - ${e.adresse}`)
            .sort()
            .map((c) => ({ value: c, label: c }))}
          onChange={(value) => {
            setSchool(value);
          }}
          placeholder="Sélectionnez un établissement"
        />
      </div>
    </>
  );
}

import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import SearchableSelect from "../../../components/SearchableSelect";

export default function SchoolOutOfFrance({ onSelectSchool }) {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("");
  const [schools, setSchools] = useState([]);
  const [school, setSchool] = useState("");

  useEffect(() => {
    async function getCountries() {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [] } },
        size: 0,
        aggs: {
          countries: { terms: { field: "country.keyword", size: 10000 } },
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
    async function getSchools() {
      if (!country) return;
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [] } },
      };
      body.query.bool.filter.push({ term: { "country.keyword": country } });
      const { responses } = await api.esQuery("schoolramses", body);
      setSchools(responses[0].hits.hits.map((e) => e._source));
    }
    getSchools();
  }, [country]);

  useEffect(() => {
    if (school) {
      onSelectSchool(schools.find((e) => `${e.fullName} - ${e.city}` === school));
    }
  }, [school]);

  return (
    <>
      <div className="form-group">
        <SearchableSelect
          label="Pays de l'établissement"
          value={country}
          options={countries.map((c) => ({ value: c, label: c }))}
          onChange={(value) => {
            setCountry(value);
          }}
          placeholder="Sélectionnez un pays"
        />
      </div>
      <div className="form-group">
        <SearchableSelect
          label="Établissement"
          value={school}
          options={schools
            .map((e) => `${e.fullName} - ${e.city}`)
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

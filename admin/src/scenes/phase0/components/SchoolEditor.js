import React, { useEffect, useState } from "react";
import Field from "./Field";
import { ES_NO_LIMIT } from "snu-lib";
import api from "../../../services/api";

export default function SchoolEditor({ young, onChange, className }) {
  const [schoolInFrance, setSchoolInFrance] = useState(true);
  const [cities, setCities] = useState([]);
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    if (young) {
      console.log("young.schoolCity: ", young.schoolCity);
      setSchoolInFrance(young.schoolCountry && young.schoolCountry.toUpperCase() === "FRANCE");
    } else {
      setSchoolInFrance(true);
    }
  }, [young]);

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    loadSchools();
  }, [young.schoolCity]);

  function onLocalChange(field, value) {
    console.log("School Editor: Local Change = ", field, value);
    let changes = { [field]: value };

    if (field === "schoolCity" && value !== young.schoolCity) {
      if (onChange) {
        changes.schoolName = "";
        changes.schoolId = "";
      }
    } else if (field === "schoolId") {
      const school = schools ? schools.find((s) => s.id === value) : null;
      if (onChange) {
        if (school) {
          changes.schoolName = school.fullName;
        }
      }
    }

    onChange && onChange(changes);
  }

  async function loadCities() {
    const body = {
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "country.keyword": "FRANCE" } }] } },
      size: 0,
      aggs: {
        cities: { terms: { field: "city.keyword", size: ES_NO_LIMIT } },
      },
    };
    const { responses } = await api.esQuery("schoolramses", body);
    setCities(responses[0].aggregations ? responses[0].aggregations.cities.buckets.map((e) => e.key).sort() : []);
  }

  async function loadSchools() {
    console.log("load schools: ", young.schoolCity);
    if (!young.schoolCity) {
      setSchools([]);
    }
    const body = {
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "country.keyword": "FRANCE" } }] } },
      size: ES_NO_LIMIT,
    };
    body.query.bool.filter.push({ term: { "city.keyword": young.schoolCity } });
    const { responses } = await api.esQuery("schoolramses", body);
    setSchools(responses[0].hits.hits.map((e) => new Object({ ...e._source, ...{ id: e._id } })));
  }

  return (
    <div className={`mb-[16px] ${className}`}>
      <div className="flex justify-between items-center mb-[16px]">
        <span>Mon établissement est</span>
        <div className="inline-flex">
          <div
            className={`border-[#3B82F6] border-[1px] rounded-[100px_0_0_100px] text-[14px] px-[10px] py-[3px] ${
              schoolInFrance ? "bg-[#3B82F6] text-[#FFFFFF]" : "bg-[#FFFFFF] text-[#3B82F6] cursor-pointer"
            }`}
            onClick={() => setSchoolInFrance(true)}>
            en France
          </div>
          <div
            className={`border-[#3B82F6] border-[1px] rounded-[0_100px_100px_0] text-[14px] px-[10px] py-[3px] ml-[-1px] ${
              !schoolInFrance ? "bg-[#3B82F6] text-[#FFFFFF]" : "bg-[#FFFFFF] text-[#3B82F6] cursor-pointer"
            }`}
            onClick={() => setSchoolInFrance(false)}>
            à l&apos;étranger
          </div>
        </div>
      </div>
      <Field
        name="schoolCity"
        label="Ville de l'établissement"
        value={young.schoolCity}
        mode="edition"
        className="mb-[16px]"
        type="select"
        filterOnType
        options={cities ? cities.map((c) => ({ value: c, label: c })) : []}
        onChange={(val) => onLocalChange("schoolCity", val)}
      />
      <Field
        name="schoolName"
        label="Nom de l'établissement"
        value={young.schoolName}
        mode="edition"
        className="mb-[16px]"
        type="select"
        filterOnType
        options={schools ? schools.map((s) => ({ value: s.id, label: s.fullName })) : []}
        onChange={(value) => onLocalChange("schoolId", value)}
      />
    </div>
  );
}

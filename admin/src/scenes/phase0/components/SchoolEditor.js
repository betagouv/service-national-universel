import React, { useEffect, useState } from "react";
import Field from "./Field";
import { ES_NO_LIMIT } from "snu-lib";
import api from "../../../services/api";

export default function SchoolEditor({ young, onChange, className, showBackgroundColor = true }) {
  const [schoolInFrance, setSchoolInFrance] = useState(true);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

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
    loadCountries();
  }, []);

  useEffect(() => {
    loadFrenchSchools();
  }, [young.schoolCity]);
  useEffect(() => {
    loadCountrySchools();
  }, [young.schoolCountry]);

  function changeSchoolInFrance(inFrance) {
    let change = young.schoolCountry === "FRANCE" ? !inFrance : inFrance;
    setSchoolInFrance(inFrance);
    if (onChange && change) {
      onChange({
        schoolId: "",
        schoolName: "",
        schoolType: "",
        schoolAddress: "",
        schoolZip: "",
        schoolDepartment: "",
        schoolRegion: "",
        schoolCity: "",
        schoolCountry: inFrance ? "FRANCE" : "",
      });
    }
  }

  function onLocalChange(field, value) {
    console.log("School Editor: Local Change = ", field, value);
    let changes = { [field]: value };

    if (field === "schoolCity" && value !== young.schoolCity) {
      if (onChange) {
        changes.schoolId = "";
        changes.schoolName = "";
        changes.schoolType = "";
        changes.schoolAddress = "";
        changes.schoolZip = "";
        changes.schoolDepartment = "";
        changes.schoolRegion = "";
        changes.schoolCountry = "FRANCE";
      }
    } else if (field === "schoolCountry" && value !== young.schoolCountry) {
      if (onChange) {
        changes.schoolId = "";
        changes.schoolName = "";
        changes.schoolType = "";
        changes.schoolAddress = "";
        changes.schoolZip = "";
        changes.schoolDepartment = "";
        changes.schoolRegion = "";
        changes.schoolCity = "";
      }
    } else if (field === "schoolId") {
      const school = schools ? schools.find((s) => s.id === value) : null;
      console.log("school = ", school);
      if (onChange) {
        if (school) {
          changes.schoolName = school.fullName;
          changes.schoolType = school.type;
          changes.schoolAddress = school.adresse;
          changes.schoolZip = school.postcode ? school.postcode : school.codeCity;
          changes.schoolDepartment = school.departementName ? school.departementName : school.departement;
          changes.schoolRegion = school.region;
          changes.schoolCity = school.city;
          changes.schoolCountry = school.country;
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

  async function loadCountries() {
    const body = {
      query: { bool: { must: { match_all: {} }, filter: [] } },
      size: 0,
      aggs: {
        countries: { terms: { field: "country.keyword", size: ES_NO_LIMIT } },
      },
    };
    const { responses } = await api.esQuery("schoolramses", body);
    if (responses && responses.length > 0) {
      setCountries(
        responses[0].aggregations.countries.buckets
          .filter((e) => e.key !== "FRANCE")
          .map((e) => e.key)
          .sort(),
      );
    }
  }

  async function loadFrenchSchools() {
    setLoadingSchools(true);
    if (!young.schoolCity || young.schoolCity.length === 0) {
      setSchools([]);
    } else {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "country.keyword": "FRANCE" } }] } },
        size: ES_NO_LIMIT,
      };
      body.query.bool.filter.push({ term: { "city.keyword": young.schoolCity } });
      const { responses } = await api.esQuery("schoolramses", body);
      if (responses && responses.length > 0) {
        setSchools(responses[0].hits.hits.map((e) => new Object({ ...e._source, ...{ id: e._id } })));
      }
    }
    setLoadingSchools(false);
  }

  async function loadCountrySchools() {
    setLoadingSchools(true);
    if (!young.schoolCountry || young.schoolCountry.length === 0 || young.schoolCountry === "FRANCE") {
      setSchools([]);
    } else {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [] } },
        size: ES_NO_LIMIT,
      };
      body.query.bool.filter.push({ term: { "country.keyword": young.schoolCountry } });
      const { responses } = await api.esQuery("schoolramses", body);
      if (responses && responses.length > 0) {
        setSchools(responses[0].hits.hits.map((e) => new Object({ ...e._source, ...{ id: e._id } })));
      }
    }
    setLoadingSchools(false);
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
            onClick={() => changeSchoolInFrance(true)}>
            en France
          </div>
          <div
            className={`border-[#3B82F6] border-[1px] rounded-[0_100px_100px_0] text-[14px] px-[10px] py-[3px] ml-[-1px] ${
              !schoolInFrance ? "bg-[#3B82F6] text-[#FFFFFF]" : "bg-[#FFFFFF] text-[#3B82F6] cursor-pointer"
            }`}
            onClick={() => changeSchoolInFrance(false)}>
            à l&apos;étranger
          </div>
        </div>
      </div>
      {schoolInFrance ? (
        <Field
          name="schoolCity"
          label="Ville de l'établissement"
          value={young.schoolCity}
          showBackgroundColor={showBackgroundColor}
          mode="edition"
          className="mb-[16px]"
          type="select"
          filterOnType
          options={cities ? cities.map((c) => ({ value: c, label: c })) : []}
          onChange={(val) => onLocalChange("schoolCity", val)}
          young={young}
        />
      ) : (
        <Field
          name="schoolCountry"
          label="Pays de l'établissement"
          showBackgroundColor={showBackgroundColor}
          value={young.schoolCountry}
          mode="edition"
          className="mb-[16px]"
          type="select"
          filterOnType
          options={countries ? countries.map((c) => ({ value: c, label: c })) : []}
          onChange={(val) => onLocalChange("schoolCountry", val)}
          young={young}
        />
      )}
      {loadingSchools ? (
        <div className="text-[#738297] my-[8px]">Chargement...</div>
      ) : (
        <Field
          name="schoolName"
          label="Nom de l'établissement"
          value={young.schoolName}
          showBackgroundColor={showBackgroundColor}
          mode="edition"
          className="mb-[16px]"
          type="select"
          filterOnType
          options={schools ? schools.map((s) => ({ value: s.id, label: s.fullName })) : []}
          onChange={(value) => onLocalChange("schoolId", value)}
          young={young}
        />
      )}
    </div>
  );
}

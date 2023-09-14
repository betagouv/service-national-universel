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
      if (onChange) {
        if (school) {
          changes.schoolName = school.fullName;
          changes.schoolType = school.type;
          changes.schoolAddress = school.adresse;
          changes.schoolZip = school.postcode ? school.postcode : school.codeCity;
          changes.schoolDepartment = school.departmentName ? school.departmentName : school.departement;
          changes.schoolRegion = school.region;
          changes.schoolCity = school.city;
          changes.schoolCountry = school.country;
          changes.schoolId = school.id;
        }
      }
    } else if (field === "schoolName") {
      if (onChange) {
        changes.schoolName = value;
        changes.schoolType = "";
        changes.schoolAddress = "";
        changes.schoolZip = "";
        changes.schoolDepartment = "";
        changes.schoolRegion = "";
        changes.schoolId = "";
      }
    }

    onChange && onChange(changes);
  }

  async function loadCities() {
    const { responses } = await api.post("/elasticsearch/schoolramses/public/search?aggsByCities=true", { filters: { country: ["FRANCE"] } });
    setCities(responses[0].aggregations ? responses[0].aggregations.cities.buckets.map((e) => e.key).sort() : []);
  }

  async function loadCountries() {
    const { responses } = await api.post("/elasticsearch/schoolramses/public/search?aggsByCountries=true");
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
      const { responses } = await api.post("/elasticsearch/schoolramses/public/search", { filters: { city: [young.schoolCity], country: ["FRANCE"] } });
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
      const { responses } = await api.post("/elasticsearch/schoolramses/public/search", { filters: { country: [young.schoolCountry] } });
      if (responses && responses.length > 0) {
        setSchools(responses[0].hits.hits.map((e) => new Object({ ...e._source, ...{ id: e._id } })));
      }
    }
    setLoadingSchools(false);
  }

  return (
    <div className={`mb-[16px] ${className}`}>
      <div className="mb-[16px] flex items-center justify-between">
        <span>Mon établissement est</span>
        <div className="inline-flex">
          <div
            className={`rounded-[100px_0_0_100px] border-[1px] border-[#3B82F6] px-[10px] py-[3px] text-[14px] ${
              schoolInFrance ? "bg-[#3B82F6] text-[#FFFFFF]" : "cursor-pointer bg-[#FFFFFF] text-[#3B82F6]"
            }`}
            onClick={() => changeSchoolInFrance(true)}>
            en France
          </div>
          <div
            className={`ml-[-1px] rounded-[0_100px_100px_0] border-[1px] border-[#3B82F6] px-[10px] py-[3px] text-[14px] ${
              !schoolInFrance ? "bg-[#3B82F6] text-[#FFFFFF]" : "cursor-pointer bg-[#FFFFFF] text-[#3B82F6]"
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
        <div className="my-[8px] text-[#738297]">Chargement...</div>
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
          onChange={(value) => onLocalChange(schools?.map((s) => s.id).includes(value) ? "schoolId" : "schoolName", value)}
          young={young}
          allowCustomValue={true}
        />
      )}
    </div>
  );
}

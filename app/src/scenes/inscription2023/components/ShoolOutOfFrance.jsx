import React, { useEffect, useState } from "react";
import CreatableSelect from "../../../components/CreatableSelect";
import Select from "@/components/dsfr/forms/Select";
import { HiArrowRight } from "react-icons/hi";
import Input from "./Input";
import { RiArrowGoBackLine } from "react-icons/ri";
import api from "../../../services/api";

export default function SchoolOutOfFrance({ school, onSelectSchool, toggleVerify, corrections = null }) {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState(school?.country);
  const [schools, setSchools] = useState([]);
  const [manualFilling, setManualFilling] = useState(school?.fullName && !school?.id);
  const [manualSchool, setManualSchool] = useState(school ?? {});

  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function getCountries() {
      const { responses } = await api.post("/elasticsearch/schoolramses/public/search?aggsByCountries=true");
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

      const { responses } = await api.post("/elasticsearch/schoolramses/public/search", { filters: { country: [country] } });
      setSchools(responses[0].hits.hits.map((e) => new Object({ ...e._source, ...{ id: e._id } })));
    }
    getSchools();
  }, [country]);

  function formatSchoolName(school) {
    if (!school?.fullName) return "";
    if (!school?.city) return school.fullName;
    return school.fullName + " - " + school.city;
  }

  return manualFilling ? (
    <>
      <hr></hr>
      <div className="flex items-center py-4">
        <RiArrowGoBackLine className="font-bold mt-1 mr-2 text-[#000091]" />
        <button
          className="text-[#000091] cursor-pointer underline underline-offset-2"
          onClick={() => {
            setManualFilling(false);
            onSelectSchool(null);
          }}>
          Revenir à la liste des établissements
        </button>
      </div>
      <Input
        value={formatSchoolName(school)}
        label="Saisir le nom de l'établissement"
        onChange={(value) => {
          onSelectSchool({ fullName: value, country });
        }}
        error={errors?.manualFullName}
        correction={corrections?.schoolName}
      />
    </>
  ) : (
    <>
      <hr></hr>
      <Select
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
      <Select
        label="Nom de l'établissement"
        value={formatSchoolName(school)}
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
      <div className="flex items-center">
        <button
          className="text-[#000091] cursor-pointer underline underline-offset-2"
          onClick={() => {
            setManualFilling(true);
            onSelectSchool(null);
          }}>
          Je n'ai pas trouvé mon établissement
        </button>
        <HiArrowRight className="text-[#000091] mt-1 ml-2" />
      </div>
    </>
  );
}

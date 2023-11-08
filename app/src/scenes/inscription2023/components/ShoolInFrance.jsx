import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import SearchableSelect from "../../../components/dsfr/forms/SearchableSelect";
import CreatableSelect from "../../../components/CreatableSelect";
import Input from "./Input";
import AddressForm from "@/components/dsfr/forms/AddressForm";
import GhostButton from "../../../components/dsfr/ui/buttons/GhostButton";
import { FiChevronLeft } from "react-icons/fi";
import { toastr } from "react-redux-toastr";
import { getAddressOptions } from "@/services/api-adresse";

export default function SchoolInFrance({ school, onSelectSchool, errors, corrections = null }) {
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState(school?.city);
  const [schools, setSchools] = useState([]);

  const [manualFilling, setManualFilling] = useState((school?.fullName && !school?.id) || false);
  const [manualSchool, setManualSchool] = useState(school ?? {});

  useEffect(() => {
    async function getCities() {
      const { responses } = await api.post("/elasticsearch/schoolramses/public/search?aggsByCities=true", { filters: { country: ["FRANCE"] } });
      if (!responses[0].aggregations?.cities.buckets.length) {
        toastr.error("Erreur", "Impossible de récupérer les établissements");
        return;
      }
      setCities(responses[0].aggregations?.cities.buckets.map((e) => e.key).sort());
    }
    getCities();
  }, []);

  useEffect(() => {
    async function getSchools() {
      if (!city) return;
      const { responses } = await api.post("/elasticsearch/schoolramses/public/search", { filters: { country: ["FRANCE"], city: [city] } });
      setSchools(responses[0].hits.hits.map((e) => new Object({ ...e._source, ...{ id: e._id } })));
    }
    getSchools();
  }, [city]);

  return manualFilling ? (
    <>
      <Input
        value={manualSchool.fullName}
        label="Nom de l'établissement"
        onChange={(value) => {
          setManualSchool({ ...manualSchool, fullName: value });
          onSelectSchool(null);
        }}
        error={errors.manualFullName}
        correction={corrections?.schoolName}
      />
      <AddressForm
        data={manualSchool}
        updateData={(newData) => {
          setManualSchool({ ...manualSchool, ...newData });
          onSelectSchool({ ...newData, fullName: manualSchool.fullName });
        }}
        getOptions={getAddressOptions}
        error={errors.school}
        correction={corrections?.schoolAddress}
      />
      <GhostButton
        name={
          <div className="flex items-center justify-center gap-1 text-center">
            <FiChevronLeft className="font-bold text-[#000091]" />
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
      <SearchableSelect
        label="Commune de l'établissement"
        options={cities?.map((c) => ({ value: c, label: c }))}
        onChange={(value) => {
          setCity(value);
          setManualSchool({ city: value, addressVerified: undefined });
          onSelectSchool(null);
        }}
        value={city}
        placeholder="Recherchez une commune"
        error={errors.city}
        correction={corrections?.schoolCity}
        noOptionsMessage="Veuillez rechercher une commune existante."
        isDebounced
      />
      <CreatableSelect
        label="Nom de l'établissement"
        value={school && `${school.fullName} - ${school.adresse}`}
        options={schools
          .map((e) => `${e.fullName}${e.adresse ? ` - ${e.adresse}` : ""}`)
          .sort()
          .map((c) => ({ value: c, label: c }))}
        onChange={(value) => {
          onSelectSchool(schools.find((e) => `${e.fullName}${e.adresse ? ` - ${e.adresse}` : ""}` === value));
        }}
        placeholder="Sélectionnez un établissement"
        onCreateOption={(value) => {
          setManualSchool({ fullName: value, addressVerified: undefined });
          onSelectSchool(null);
          setManualFilling(true);
        }}
        error={errors.school}
        correction={corrections?.schoolName}
      />
    </>
  );
}

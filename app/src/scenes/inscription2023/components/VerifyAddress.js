import React, { useEffect, useState } from "react";
import { Spinner } from "reactstrap";
import { department2region, departmentLookUp } from "snu-lib/region-and-departments";
import InfoIcon from "../../../components/InfoIcon";
import { apiAdress } from "../../../services/api-adresse";
import Button from "./Button";
import GhostButton from "./GhostButton";

export default function VerifyAddress({ address, zip, city, onSuccess, onFail, disabled = false, isVerified = false, buttonClassName = "", buttonContainerClassName = "" }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const handleClick = (address, city, zip) => {
    if (disabled || !address || !zip || !city || loading) return;
    return getSuggestions(address, city, zip);
  };

  useEffect(() => {
    setSuggestion(null);
  }, [address, zip, city]);

  const getSuggestions = async (address, city, zip) => {
    setLoading(true);
    try {
      let res = await apiAdress(`${address}, ${city}, ${zip}`, [`postcode=${zip}`]);

      // Si pas de résultat, on tente avec la ville et le code postal uniquement
      if (res?.features?.length === 0) {
        res = await apiAdress(`${city}, ${zip}`, [`postcode=${zip}`]);
      }

      const arr = res?.features;

      setLoading(false);
      if (arr?.length > 0) setSuggestion({ ok: true, status: "FOUND", ...arr[0] });
      else setSuggestion({ ok: false, status: "NOT_FOUND" });
    } catch (e) {
      setLoading(false);
    }
  };

  const formatResult = (suggestion) => {
    let depart = suggestion.properties.postcode.substr(0, 2);

    // Cas particuliers : codes postaux en Polynésie
    if (["97", "98"].includes(depart)) {
      depart = suggestion.properties.postcode.substr(0, 3);
    }

    // Cas particuliers : code postaux en Corse
    if (depart === "20") {
      depart = suggestion.properties.context.substr(0, 2);
      if (!["2A", "2B"].includes(depart)) depart = "2B";
    }

    return {
      address: suggestion.properties.name,
      zip: suggestion.properties.postcode,
      city: suggestion.properties.city,
      department: departmentLookUp[depart],
      departmentNumber: depart,
      location: { lon: suggestion.geometry.coordinates[0], lat: suggestion.geometry.coordinates[1] },
      region: department2region[departmentLookUp[depart]],
      cityCode: suggestion.properties.citycode,
    };
  };

  if (suggestion) {
    if (!suggestion.ok) {
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="text-red-500 text-center text-sm">L&apos;adresse saisie n&apos;a pas été trouvée.</div>
          <GhostButton name="Réessayer" onClick={() => setSuggestion(null)} />
        </div>
      );
    }
    return (
      <div className="my-2">
        <p className="mb-6 leading-relaxed">
          Est-ce que c&apos;est la bonne adresse ?
          <br />
          <strong>
            {suggestion.properties.name}, {`${suggestion.properties.postcode} ${suggestion.properties.city}`}
          </strong>
        </p>
        <Button
          onClick={() => {
            onSuccess(formatResult(suggestion));
            setSuggestion(null);
          }}
          className="w-full my-1">
          Oui
        </Button>
        <GhostButton
          onClick={() => {
            onFail(formatResult(suggestion));
            setSuggestion(null);
          }}
          name={`Non, garder "${address}, ${zip} ${city}"`}
        />
      </div>
    );
  }

  if (isVerified) return <Message>L&apos;adresse a été enregistrée</Message>;

  return (
    <>
      <div className={buttonContainerClassName}>
        <GhostButton
          className={buttonClassName}
          disabled={disabled}
          name={
            <div>
              {loading && <Spinner size="sm" key={"verifaddress"} style={{ borderWidth: "0.1em", marginRight: "0.5rem" }} />}
              Vériﬁer mon adresse
            </div>
          }
          onClick={() => handleClick(address, city, zip)}
        />
      </div>
      {(!address || !zip || !city) && <Message>Pour vérifier votre adresse vous devez remplir les champs adresse de résidence, code postale et ville.</Message>}
    </>
  );
}

const Message = ({ children, className = "" }) => (
  <div className={`flex items-center rounded-md p-3 text-["#32257f"] bg-[#edecfc] ${className}`}>
    <InfoIcon className="mt-1" color="#32257f" />
    <div className="ml-2">{children}</div>
  </div>
);

import React, { useEffect, useState } from "react";
import { Spinner } from "reactstrap";
import { department2region, departmentLookUp } from "snu-lib";
import InfoIcon from "../../../components/InfoIcon";
import { apiAdress } from "../../../services/api-adresse";
import { BorderButton } from "./Buttons";

export default function VerifyAddress({
  address,
  zip,
  city,
  onSuccess,
  onFail,
  disabled = false,
  isVerified = false,
  buttonClassName = "",
  buttonContainerClassName = "",
  verifyButtonText = "Vérifier mon adresse",
  verifyText = "Pour vérifier votre adresse vous devez remplir les champs adresse de résidence, code postal et ville.",
}) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    setSuggestion(null);
  }, [address, zip, city]);

  const getSuggestions = async (address, city, zip) => {
    setLoading(true);
    try {
      let res = await apiAdress(`${address}, ${city}, ${zip}`, { postcode: zip });

      // Si pas de résultat, on tente avec la ville et le code postal uniquement
      if (res?.features?.length === 0) {
        res = await apiAdress(`${city}, ${zip}`, { postcode: zip });
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
    let depart = suggestion.properties.postcode?.substr(0, 2) || suggestion.properties.citycode.substr(0, 2);
    if (["97", "98"].includes(depart)) {
      depart = suggestion.properties.postcode?.substr(0, 3) || suggestion.properties.citycode.substr(0, 3);
    }
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
          <div className="text-center text-sm text-red-500">L&apos;adresse saisie n&apos;a pas été trouvée.</div>
          <BorderButton onClick={() => setSuggestion(null)}>Réessayer</BorderButton>
        </div>
      );
    }
    return (
      <div className="w-full">
        <b className="mb-8">Est-ce que c&apos;est la bonne adresse ?</b>
        <p>{suggestion.properties.name}</p>
        <p>{`${suggestion.properties.postcode}, ${suggestion.properties.city}`}</p>
        <div className="mt-2 space-y-4">
          <BorderButton
            className="w-full"
            onClick={() => {
              onSuccess(formatResult(suggestion));
              setSuggestion(null);
            }}>
            Oui
          </BorderButton>
          <BorderButton
            className="w-full"
            onClick={() => {
              onFail(formatResult(suggestion));
              setSuggestion(null);
            }}>
            Non, garder &quot;{address}, {zip}, {city}&quot;
          </BorderButton>
        </div>
      </div>
    );
  }

  if (isVerified) return <Message>L&apos;adresse a été vérifiée</Message>;

  return (
    <>
      <div className={buttonContainerClassName}>
        <BorderButton
          className={buttonClassName}
          disabled={disabled}
          onClick={() => {
            if (disabled || !address || !zip || !city || loading) return;
            getSuggestions(address, city, zip);
          }}>
          <div>
            {loading && <Spinner size="sm" key={"verifaddress"} style={{ borderWidth: "0.1em", marginRight: "0.5rem" }} />}
            {verifyButtonText}
          </div>
        </BorderButton>
      </div>
      {(!address || !zip || !city) && <Message>{verifyText}</Message>}
    </>
  );
}

const Message = ({ children, className = "" }) => (
  <div className={`flex items-center rounded-md bg-[#edecfc] p-3 text-["#32257f"] ${className}`}>
    <InfoIcon className="mt-1" color="#32257f" />
    <div className="ml-2">{children}</div>
  </div>
);

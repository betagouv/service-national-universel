import React, { useState } from "react";
import { Spinner } from "reactstrap";
import GhostButton from "./GhostButton";

export default function VerifyAddress({ address, zip, city, onSuccess, onFail }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const getSuggestions = async (text) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api-adresse.data.gouv.fr/search/?autocomplete=1&q=${text}`, {
        mode: "cors",
        method: "GET",
      });
      const res = await response.json();
      const arr = res.features.filter((e) => e.properties.type !== "municipality");

      setLoading(false);
      if (arr.length > 0) setSuggestion({ ok: true, status: "FOUND", ...arr[0] });
      else setSuggestion({ ok: false, status: "NOT_FOUND" });
    } catch (e) {
      setLoading(false);
    }
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
      <div>
        <b className="mb-8">Est-ce que c&apos;est la bonne adresse ?</b>
        <p>{suggestion.properties.name}</p>
        <p>{`${suggestion.properties.postcode}, ${suggestion.properties.city}`}</p>
        <div className="grid grid-cols-2 gap-4">
          <GhostButton
            onClick={() => {
              setSuggestion(null);
              onSuccess();
            }}
            name="Non"
          />
          <GhostButton
            onClick={() => {
              setSuggestion(null);
              onFail();
            }}
            name="Oui"
          />
        </div>
      </div>
    );
  }
  return (
    <GhostButton
      name={
        <div>
          {loading && <Spinner size="sm" key={"verifaddress"} style={{ borderWidth: "0.1em", marginRight: "0.5rem" }} />}
          Vériﬁer mon adresse
        </div>
      }
      onClick={() => {
        if (!address || !zip || !city || loading) return;
        getSuggestions(`${address}, ${city} ${zip}`);
      }}
    />
  );
}

import React, { useEffect, useState } from "react";
import { Spinner } from "reactstrap";
import InfoIcon from "../../../components/InfoIcon";
import { getSuggestions, formatResult } from "../../../services/api-adresse";
import Button from "../../../components/dsfr/ui/buttons/Button";
import GhostButton from "../../../components/dsfr/ui/buttons/GhostButton";

export default function VerifyAddress({ address, zip, city, onSuccess, onFail, disabled = false, isVerified = false, buttonClassName = "", buttonContainerClassName = "" }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const handleClick = async (address, city, zip) => {
    if (disabled || !address || !zip || !city || loading) return;
    setLoading(true);
    const updatedSuggestion = await getSuggestions(address, city, zip);
    setSuggestion(updatedSuggestion);
    setLoading(false);
  };

  useEffect(() => {
    setSuggestion(null);
  }, [address, zip, city]);

  if (suggestion) {
    if (!suggestion.ok) {
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="text-center text-sm text-red-500">L&apos;adresse saisie n&apos;a pas été trouvée.</div>
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
          className="my-1 w-full">
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
  <div className={`flex items-center rounded-md bg-[#edecfc] p-3 text-["#32257f"] ${className}`}>
    <InfoIcon className="mt-1" color="#32257f" />
    <div className="ml-2">{children}</div>
  </div>
);

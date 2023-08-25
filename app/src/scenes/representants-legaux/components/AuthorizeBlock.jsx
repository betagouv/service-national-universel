import RadioButton from "./RadioButton";
import { booleanToString } from "../commons";
import ErrorMessage from "../../../components/dsfr/forms/ErrorMessage";
import React from "react";

export default function AuthorizeBlock({ title, value, onChange, children, className, error }) {
  const options = [
    { value: "true", label: "J'autorise" },
    { value: "false", label: "Je n'autorise pas" },
  ];

  function onValueChange(e) {
    onChange(e === "true");
  }

  return (
    <div className={className}>
      <RadioButton label={title} options={options} onChange={onValueChange} value={booleanToString(value)} />
      {error && <ErrorMessage className="mb-2">{error}</ErrorMessage>}
      <div>{children}</div>
    </div>
  );
}

import React from "react";
import { Input as DSFRInput } from "@snu/ds/dsfr";

export default function Input({
  value,
  onChange,
  hintText = null,
  name = null,
  label = null,
  state = "default",
  stateRelatedMessage = null,
  placeholder = null,
  iconId = null,
  disabled = false,
  type = "text",
  autocomplete = "off",
  className = "",
  onBlur = null,
  ...otherProps
}) {
  return (
    <DSFRInput
      id={name}
      hintText={hintText}
      className={className}
      label={label}
      state={state}
      stateRelatedMessage={stateRelatedMessage}
      iconId={iconId}
      disabled={disabled}
      nativeInputProps={{ value, name, placeholder, type, autoComplete: autocomplete, onChange: (e) => onChange(e.target.value), ...otherProps }}
      textArea={type == "textarea"}
      autoComplete={autocomplete}
      onBlur={onBlur}
    />
  );
}

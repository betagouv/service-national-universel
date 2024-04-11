import React from "react";
import {
  RadioButtons,
  RadioButtonsProps,
} from "@codegouvfr/react-dsfr/RadioButtons";

export type BoolOptions = {
  label?: string;
  value?: string;
};

export const booleanOptions: BoolOptions[] = [
  {
    label: "Oui",
    value: "true",
  },
  {
    label: "Non",
    value: "false",
  },
];

type OwnProps = {
  options: BoolOptions[];
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => any;
  otherProps: RadioButtonsProps;
};

export default function BooleanRadioButtons({
  options = [{}, {}],
  value: currentValue,
  onChange,
  ...otherProps
}: OwnProps) {
  const optionsWithDefault = options.map((option, i) => ({
    ...booleanOptions[i],
    ...option,
  }));
  const formattedOptions = optionsWithDefault.map(({ label, value }) => ({
    label,
    nativeInputProps: {
      value,
      checked: value === currentValue,
      onChange,
    },
  }));

  return <RadioButtons {...otherProps} options={formattedOptions} />;
}

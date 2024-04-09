import React from "react";

export const booleanOptions = (
  callback: (e: React.ChangeEvent<HTMLInputElement>) => any,
) => [
  {
    label: "Oui",
    nativeInputProps: {
      value: "true",
      onChange: callback,
    },
  },
  {
    label: "Non",
    nativeInputProps: {
      value: "false",
      onChange: callback,
    },
  },
];

export default {
  booleanOptions,
};

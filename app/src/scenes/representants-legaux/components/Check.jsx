import React from "react";
import { Checkbox } from "@snu/ds/dsfr";

export default function Check({ checked, onChange, className = "", children, error }) {
  return (
    <Checkbox
      className={`${className}`}
      state={error && "error"}
      stateRelatedMessage={error}
      options={[
        {
          label: children,
          nativeInputProps: {
            checked,
            onChange: (e) => onChange(e.target.checked),
          },
        },
      ]}
    />
  );
}

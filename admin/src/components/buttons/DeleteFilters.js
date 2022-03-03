import React from "react";
import { SelectedFilters } from "@appbaseio/reactivesearch";

export default function DeleteFilters() {
  return (
    <SelectedFilters
      render={(props) => {
        const { selectedValues, setValue } = props;
        const clearFilter = () => {
          Object.keys(selectedValues).map((component) => {
            setValue(component, null);
          });
        };
        return (
          <button className="!bg-snu-purple-300 hover:shadow-lg text-white" onClick={clearFilter}>
            Supprimer la sélection
          </button>
        );
      }}
    />
  );
}

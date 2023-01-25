import React from "react";

import StructureView from "./wrapper";
import Informations from "../components/Informations";

export default function DetailsView() {
  return (
    <StructureView tab="details">
      <div className="flex gap-4">{/* Cartes */}</div>
      <Informations />
    </StructureView>
  );
}

import React from "react";

import { Header, Page } from "@snu/ds/admin";
import ImportCentres from "./ZImportCentres";
import ImportCentresSessions from "./ZImportCentresSession";

export default function Import() {
  return (
    <Page>
      <Header title="Import des centres et sessions" breadcrumb={[{ title: "Séjours" }, { title: "Classes" }, { title: "Import" }]} />
      <ImportCentres />
      <ImportCentresSessions />
    </Page>
  );
}

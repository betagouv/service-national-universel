import React from "react";

import { Header, Page } from "@snu/ds/admin";
import ImportCentres from "./ImportCentres";
import ImportCentresSessions from "./ImportCentresSession";

export default function Import() {
  return (
    <Page>
      <Header title="Import des centres et sessions" breadcrumb={[{ title: "Séjours" }, { title: "Classes" }, { title: "Import" }]} />
      <ImportCentres />
      <ImportCentresSessions />
    </Page>
  );
}

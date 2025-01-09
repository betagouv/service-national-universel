import React from "react";

import { Header, Page } from "@snu/ds/admin";

import ImportCentres from "./importCentres";
import ImportCentresSessions from "./importCentresSession";

export const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

export default function Import() {
  return (
    <Page>
      <Header title="Import des centres et sessions" breadcrumb={[{ title: "Séjours" }, { title: "Classes" }, { title: "Import" }]} />
      <ImportCentres />
      <ImportCentresSessions />
    </Page>
  );
}

import React from "react";
import { Box, BoxHeader } from "../components/commons";
import { PlainButton } from "../components/Buttons";

export default function SchemaEditor({ className = "", onExportDetail, department, region, cohort }) {
  return (
    <Box className={className}>
      <BoxHeader title={"Gérer les volontaires de " + department}>
        <PlainButton onClick={onExportDetail}>Exporter</PlainButton>
      </BoxHeader>
      <div className="">
        blabla...
      </div>
    </Box>
  );
}

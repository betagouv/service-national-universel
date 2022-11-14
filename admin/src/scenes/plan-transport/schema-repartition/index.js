import React from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import PlanTransportBreadcrumb from "../components/PlanTransportBreadcrumb";
import { Box } from "../components/commons";

export default function SchemaRepartition() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Plan de transport", to: "/plan-de-transport" }, { label: "Schéma de répartition" }]} />
      <div className="p-[30px]">
        <div className="flex items-center justify-between">
          <PlanTransportBreadcrumb region={{ label: "Bourgogne-Franche-Comté" }} department={{ label: "Côte d'Or" }} />
          <Box>
            Séjour du <b>3 au 15 juillet 2022</b>
          </Box>
        </div>
        <div className="flex my-[40px]">
          <div className="flex flex-col grow">
            <Box className="grow-[1_1_50%] mb-[8px]">Volontaires</Box>
            <Box className="grow-[1_1_50%] mt-[8px]">Affectation des volontaires</Box>
          </div>
          <Box className="grow mx-[16px]">Disponibilité des places</Box>
          <Box className="grow">Centres</Box>
        </div>
        <Box>Gérer les volontaires</Box>
      </div>
    </div>
  );
}

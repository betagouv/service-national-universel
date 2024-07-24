import React from "react";
import { Checkbox } from "@mui/material";

export default function YoungListHeader({ currentTab }) {
  const firstColumn = {
    width: "5%",
    label: (
      <Checkbox
        sx={{
          paddingY: 0,
          "& .MuiSvgIcon-root": {
            fontSize: 24,
            color: "#6b7280",
          },
          "&.Mui-checked .MuiSvgIcon-root": {
            color: "#2563eb",
          },
          "&:hover": {
            backgroundColor: "transparent",
          },
          "& .MuiTouchRipple-root": {
            display: "none",
          },
        }}
      />
    ),
  };
  const tabContent = {
    consent: [firstColumn, { width: "25%", label: "Élèves" }, { width: "30%", label: "Classes" }, { width: "30%", label: "Statuts" }, { width: "10%", label: "Consentements" }],
    validation: [firstColumn, { width: "25%", label: "Élèves" }, { width: "30%", label: "Classes" }, { width: "30%", label: "Statuts" }, { width: "10%", label: "Inscriptions" }],
    image: [firstColumn, { width: "40%", label: "Élèves" }, { width: "45%", label: "Classes" }, { width: "10%", label: "Droits à l'image" }],
    general: [
      { width: "30%", label: "Élèves" },
      { width: "20%", label: "Cohortes" },
      { width: "20%", label: "Classes" },
      { width: "20%", label: "Statuts", className: "flex justify-center" },
      { width: "10%", label: "Actions" },
    ],
  };
  const headers = tabContent[currentTab] || tabContent.general;

  return (
    <tr className={`flex items-center py-3 px-4 text-xs font-[500] leading-5 uppercase text-gray-500 bg-gray-50 cursor-default`}>
      {headers.map((header, index) => (
        <th key={index} className={`w-[${header.width}] ${header.className || ""}`}>
          {header.label}
        </th>
      ))}
    </tr>
  );
}

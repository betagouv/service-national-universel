import dayjs from "@/utils/dayjs.utils";
import * as XLSX from "xlsx";

import { EtablissementType } from "snu-lib";

export interface EtablissementExport extends EtablissementType {
  nb_classe: number;
  nb_young: number;
  referentEtablissement: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  }[];
}

export function exportExcelSheet(etablissements: EtablissementExport[]) {
  const sheetData = etablissements.map((e) => ({
    id: e._id.toString(),
    name: e.name,
    uai: e.uai,
    academy: e.academy,
    region: e.region,
    department: e.department,
    zip: e.zip,
    city: e.city,
    address: e.address,
    type: e.type.join(", "),
    sector: e.sector.join(", "),
    nb_classe: e.nb_classe,
    nb_young: e.nb_young,
    // chef d'établissement
    referentEtablissement: e.referentEtablissement.length ? `${e.referentEtablissement[0]?.firstName} ${e.referentEtablissement[0]?.lastName}` : "",
    phone: e.referentEtablissement.length ? e.referentEtablissement[0].phone : "",
    email: e.referentEtablissement.length ? e.referentEtablissement[0].email : "",
    // coordinateurs
    coordinateur1FullName: e.coordinateurs ? `${e.coordinateurs[0]?.firstName} ${e.coordinateurs[0]?.lastName}` : "",
    coordinateur1Phone: e.coordinateurs ? e.coordinateurs[0]?.phone : "",
    coordinateur1Email: e.coordinateurs ? e.coordinateurs[0]?.email : "",
    coordinateur2FullName: e.coordinateurs && e.coordinateurs.length > 1 ? `${e.coordinateurs[1]?.firstName} ${e.coordinateurs[1]?.lastName}` : "",
    coordinateur2Phone: e.coordinateurs && e.coordinateurs.length > 1 ? e.coordinateurs[1]?.phone : "",
    coordinateur2Email: e.coordinateurs && e.coordinateurs.length > 1 ? e.coordinateurs[1]?.email : "",
    updatedAt: dayjs(e.updatedAt).format("DD/MM/YYYY HH:mm"),
    createdAt: dayjs(e.createdAt).format("DD/MM/YYYY HH:mm"),
  }));

  const headers = [
    "ID",
    "Nom",
    "UAI",
    "Académie",
    "Région",
    "Département",
    "Code postal",
    "Ville",
    "Adresse",
    "Type",
    "Secteur",
    "Nb de classes",
    "Nb d'élèves",
    "Chef d'établissement",
    "Tél",
    "Email",
    "Coordinateur 1",
    "Tél",
    "Email",
    "Coordinateur 2",
    "Tél",
    "Email",
    "Dernière modification",
    "Date de création",
  ];

  const sheet = XLSX.utils.json_to_sheet(sheetData);
  XLSX.utils.sheet_add_aoa(sheet, [headers], { origin: "A1" });

  // --- create workbook
  const workbook = XLSX.utils.book_new();
  // ⚠️ Becareful, sheet name length is limited to 31 characters
  XLSX.utils.book_append_sheet(workbook, sheet, "Liste des établissements");
  const fileName = "etablissements.xlsx";
  return { workbook, fileName };
}

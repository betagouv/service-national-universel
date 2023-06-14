import React, { useState } from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import plausibleEvent from "../../../../../../services/plausible";
import ModalConfirm from "../../../../../../components/modals/ModalConfirm";
import { MISSION_STATUS, REFERENT_ROLES, region2department, translate } from "snu-lib";
import { useSelector } from "react-redux";
import ButtonSecondary from "../../../../../../components/ui/buttons/ButtonSecondary";
import api from "../../../../../../services/api";
import dayjs from "dayjs";

export default function ExportMissionStatusReport({ filter }) {
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [loadingText, setLoadingText] = useState("0 %");
  const user = useSelector((state) => state.Auth.user);

  const onClick = () => {
    plausibleEvent("Dashboard/CTA - Exporter Detail missions");
    setModal({
      isOpen: true,
      onConfirm: run,
      title: "Téléchargement",
      message:
        "En téléchargeant ces informations, vous vous engagez à les supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)",
    });
  };

  async function run() {
    if (user.role === REFERENT_ROLES.REFERENT_REGION) {
      if (!filter?.region?.length) {
        filter.region = [user.region];
      }
      if (!filter?.department?.length) {
        filter.department = region2department[user.region];
      }
    }
    if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
      if (!filter?.department?.length) {
        filter.department = user.department.map((s) => s);
      }
    }

    // starting the process...
    setLoading(true);
    setLoadingText("en cours...");

    try {
      let linesFilter = [];
      let queryFilter = {};
      if (filter.department) {
        queryFilter.department = filter.department;
        linesFilter.push({ Type: "Département", Valeur: filter.department.join(", ") });
      }
      if (filter.region) {
        queryFilter.region = filter.region;
        linesFilter.push({ Type: "Région", Valeur: filter.region.join(", ") });
      }
      if (filter.isJvaMission === "true" || filter.isJvaMission === "false") {
        queryFilter.isJvaMission = [filter.isJvaMission];
        linesFilter.push({ Type: "source", Valeur: filter.isJvaMission === "true" ? "JVA" : "SNU" });
      }
      if (filter.fromDate) {
        const date = dayjs(filter.fromDate).format("YYYY/MM/DD");
        queryFilter.fromDate = [date];
        linesFilter.push({ Type: "Date de début", Valeur: date });
      }
      if (filter.toDate) {
        const date = dayjs(filter.toDate).format("YYYY/MM/DD");
        queryFilter.toDate = [date];
        linesFilter.push({ Type: "Date de fin", Valeur: date });
      }
      const query = {
        page: 0,
        filters: queryFilter,
        sort: { field: "createdAt", order: "desc" },
      };
      const result = await api.post("/elasticsearch/mission/export", query);
      const lines = await aggregateMissionsStatusData(result.data);

      const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      const sheetData = XLSX.utils.json_to_sheet(lines);
      const sheetFilter = XLSX.utils.json_to_sheet(linesFilter);
      const wb = { Sheets: { ["Données"]: sheetData, Filtres: sheetFilter }, SheetNames: ["Données", "Filtres"] };
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: fileType });
      setLoading(false);
      const now = new Date();
      const exportDate = `${now.getFullYear()}${now.getMonth() + 1}${("0" + now.getDate()).slice(-2)}`;
      const exportTime = `${now.getHours()}${now.getMinutes()}`;
      FileSaver.saveAs(data, `${exportDate}_${exportTime}_DetailMission.xlsx`);
    } catch (err) {
      console.log("EXPORT ERROR: ", err);
    }
  }

  return (
    <>
      <ButtonSecondary onClick={onClick} disabled={loading}>
        Exporter le détail des missions {loading ? `(${loadingText})` : ""}
      </ButtonSecondary>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
}

export async function aggregateMissionsStatusData(data) {
  const aggregation = {};

  for (const row of data) {
    let agg = aggregation[row.department];
    if (agg === undefined) {
      aggregation[row.department] = {
        region: row.region,
        department: row.department,
        rows: [],
      };
      agg = aggregation[row.department];
    }

    // agg.rows.push(row);
    if (agg[row.status] === undefined) {
      agg[row.status] = { count: 0, placesTotal: 0, placesLeft: 0 };
    }
    agg[row.status].count++;
    agg[row.status].placesTotal += row.placesTotal;
    agg[row.status].placesLeft += row.placesLeft;
  }

  return Object.values(aggregation).map((row) => {
    let line = {
      ["Région"]: row.region,
      ["Département"]: row.department,
    };
    for (const status of Object.values(MISSION_STATUS)) {
      line[translate(status) + " - Nombre de missions déposées"] = row[status]?.count || 0;
      line[translate(status) + " - Nombre de places totales"] = row[status]?.placesTotal || 0;
      line[translate(status) + " - Nombre de places disponibles"] = row[status]?.placesLeft || 0;
      line[translate(status) + " - Nombre de places occupées"] = (row[status]?.placesTotal || 0) - (row[status]?.placesLeft || 0);
    }

    return line;
  });
}

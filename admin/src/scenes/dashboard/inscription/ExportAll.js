import React, { useState } from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

import { departmentLookUp, department2region } from "../../../utils";
import LoadingButton from "../../../components/buttons/LoadingButton";
import api from "../../../services/api";

export default () => {
  const [loading, setLoading] = useState(false);
  async function run() {
    setLoading(true);
    const lines = [];

    const dates = [];
    const d = new Date("2021-02-22");
    const limit = new Date();
    limit.setDate(limit.getDate() - 7);

    while (d < limit) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 7);
    }
    lines.push(["Région", "Numéro dtp", "Département", "Cible", ...dates.map((e) => e.toISOString().slice(0, 10))]);
    const keys = Object.keys(departmentLookUp).sort((a, b) => a - b);
    for (let i = 0; i < keys.length; i++) {
      const dptCode = keys[i];
      const dptName = departmentLookUp[dptCode];
      const region = department2region[dptName];

      const queries = [];
      queries.push({ index: "young", type: "_doc" });
      queries.push({
        query: {
          bool: {
            must: { match_all: {} },
            filter: [
              { term: { "cohort.keyword": "2021" } },
              { term: { "department.keyword": dptName } },
              { terms: { "status.keyword": ["WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED"] } },
            ],
          },
        },
        aggs: { range: { date_range: { field: "lastStatusAt", ranges: dates.map((e) => ({ to: e })) } } },
        size: 0,
      });
      const { responses } = await api.esQuery(queries);
      const val = responses[0].aggregations.range.buckets.map((e) => e.doc_count);
      const line = [region, dptCode, dptName, "", ...val];
      lines.push(line);
    }
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const ws = XLSX.utils.json_to_sheet(lines);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    setLoading(false);
    FileSaver.saveAs(data, "Global.xlsx");
  }

  return (
    <LoadingButton onClick={run} loading={loading}>
      Exporter le rapport
    </LoadingButton>
  );
};

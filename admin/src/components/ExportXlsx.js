import React, { useState, useEffect } from "react";
import { ReactiveComponent } from "@appbaseio/reactivesearch";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { translate } from "../utils";
import LoadingButton from "./buttons/LoadingButton";

export default function ExportComponent({ title, collection, react, transform, transformAll = null, defaultQuery = () => ({ query: { query: { match_all: {} } }, size: 10000 }) }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (
      !confirm(
        "En téléchargeant ces informations, vous vous engagez à les supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)"
      )
    )
      return;
    setExporting(true);
  };

  if (exporting) {
    return (
      <ReactiveComponent
        defaultQuery={defaultQuery}
        componentId="EXPORT"
        react={react}
        render={({ setQuery, data, loading }) => {
          return (
            <Loading
              setQuery={setQuery}
              transformAll={transformAll}
              data={data}
              loading={loading}
              onFinish={() => setExporting(false)}
              collection={collection}
              transform={transform}
            />
          );
        }}
      />
    );
  }

  return <LoadingButton onClick={handleExport}>{title}</LoadingButton>;
}

function Loading({ onFinish, collection, data, loading, transform, transformAll }) {
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (loading === false) setRun(true);
  }, [loading]);

  useEffect(() => {
    if (run) {
      const d = new Date();
      const date = ("0" + d.getDate()).slice(-2);
      const month = ("0" + (d.getMonth() + 1)).slice(-2);
      const year = d.getFullYear();
      const minutes = ("0" + d.getMinutes()).slice(-2);
      const hours = ("0" + d.getHours()).slice(-2);
      const secondes = ("0" + d.getSeconds()).slice(-2);
      const fileName = `${collection}_${year}${month}${date}_${hours}h${minutes}m${secondes}s.xlsx`;

      exportData(fileName, data, transform, transformAll);
      onFinish();
    }
  }, [run]);

  return <LoadingButton loading={loading}></LoadingButton>;
}

async function exportData(fileName, entities, transform, transformAll) {
  if (!entities.length) return;

  const data = transformAll ? await transformAll(entities) : entities;

  let columns = Object.keys(objectWithMostFields(data.map((e) => (transform ? transform(e) : e))));
  const csv = [];

  // Add a first line with query parameters.
  csv.push(columns);

  for (let j = 0; j < data.length; j++) {
    const obj = transform ? transform(data[j]) : data[j];
    const arr = columns.map((key) => `${translate(obj[key]) || ""}`);
    csv.push(arr);
  }

  // console.log(csv);
  // const result = XLSX.utils.aoa_to_sheet(csv);
  // const wb = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(wb, result, "test");
  // XLSX.writeFile(wb, fileName);

  const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
  const ws = XLSX.utils.json_to_sheet(csv);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const resultData = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(resultData, fileName + fileExtension);
}

function objectWithMostFields(objArr) {
  const maxKeys = {};

  objArr.map((obj) => {
    Object.keys(obj).map((e) => {
      if (!maxKeys.hasOwnProperty(e)) {
        maxKeys[e] = obj[e];
      }
    });
  });
  return maxKeys;
}

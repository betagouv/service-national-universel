import React, { useState, useEffect, useRef } from "react";
import { ReactiveComponent } from "@appbaseio/reactivesearch";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { translate, ES_NO_LIMIT } from "../utils";
import LoadingButton from "./buttons/LoadingButton";
import ModalConfirm from "./modals/ModalConfirm";
import api from "../services/api";

export default function ExportComponent({
  title,
  exportTitle,
  index,
  react,
  transform,
  transformAll = null,
  defaultQuery = () => ({ query: { query: { match_all: {} } }, size: ES_NO_LIMIT }),
}) {
  const [exporting, setExporting] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const query = useRef(defaultQuery().query);

  const onClick = () => {
    setModal({
      isOpen: true,
      onConfirm: () => setExporting(true),
      title: "Téléchargement",
      message:
        "En téléchargeant ces informations, vous vous engagez à les supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)",
    });
  };

  if (exporting) {
    return (
      <ReactiveComponent
        defaultQuery={defaultQuery}
        componentId="EXPORT"
        react={react}
        onQueryChange={(prev, next) => {
          query.current = next.query;
        }}
        render={(props) => {
          const { setQuery, data, loading } = props;
          return (
            <Loading
              setQuery={setQuery}
              currentQuery={query.current}
              transformAll={transformAll}
              data={data}
              loading={loading}
              onFinish={() => setExporting(false)}
              index={index}
              exportTitle={exportTitle}
              transform={transform}
            />
          );
        }}
      />
    );
  }

  return (
    <>
      <LoadingButton onClick={onClick}>{title}</LoadingButton>
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

function Loading({ onFinish, loading, exportTitle, transform, transformAll, currentQuery, index }) {
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
      const fileName = `${exportTitle}_${year}${month}${date}_${hours}h${minutes}m${secondes}s.xlsx`;

      getAllResults(index, transform, transformAll, currentQuery).then((csv) => {
        exportData(fileName, csv);
        onFinish();
      });
    }
  }, [run]);

  return <LoadingButton loading={loading || run}></LoadingButton>;
}

async function getAllResults(collection, transform, transformAll, currentQuery) {
  const result = await api.post("/es/export", {
    query: currentQuery,
    index: collection,
  });
  if (!result.data.length) return;

  const data = transformAll ? await transformAll(result.data) : result.data;

  let columns = Object.keys(objectWithMostFields(data.map((e) => (transform ? transform(e) : e))));
  const csv = [];

  // Add a first line with query parameters.
  csv.push(columns);

  for (let j = 0; j < data.length; j++) {
    const obj = transform ? transform(data[j]) : data[j];
    const arr = columns.map((key) => translate(obj[key]) || "");
    csv.push(arr);
  }
  return csv;
}

async function exportData(fileName, csv) {
  const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
  const ws = XLSX.utils.aoa_to_sheet(csv);
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

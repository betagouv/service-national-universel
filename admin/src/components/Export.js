import React, { useState, useEffect } from "react";
import { ReactiveComponent } from "@appbaseio/reactivesearch";

export default function ExportComponent({ title, collection, react, transform }) {
  const [exporting, setExporting] = useState(false);

  if (exporting) {
    return (
      <ReactiveComponent
        componentId="EXPORT"
        react={react}
        defaultQuery={() => ({ query: { query: { match_all: {} } }, size: 10000 })}
        render={({ setQuery, data, loading }) => {
          return <Loading setQuery={setQuery} data={data} loading={loading} onFinish={() => setExporting(false)} collection={collection} transform={transform} />;
        }}
      />
    );
  }

  return <button onClick={() => setExporting(true)}>{title}</button>;
}

function Loading({ onFinish, collection, data, loading, transform }) {
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
      const fileName = `${collection}_${year}${month}${date}_${hours}h${minutes}m${secondes}s.csv`;

      exportData(fileName, data, transform);
      onFinish();
    }
  }, [run]);

  const style = {
    border: "2px solid transparent",
    borderTop: "2px solid #720c32",
    borderRadius: "50%",
    width: "16px",
    height: "16px",
    animation: "spin 2s linear infinite",
    display: "inline-block",
  };
  return (
    <div>
      <span className="spin" style={style} /> Chargement en cours
    </div>
  );
}

async function exportData(fileName, entities, transform) {
  if (!entities.length) return;

  let columns = Object.keys(objectWithMostFields(entities.map((e) => (transform ? transform(e) : e))));

  const csv = [];

  // Add a first line with query parameters.
  csv.push(columns.join(";"));

  for (let j = 0; j < entities.length; j++) {
    const obj = transform ? transform(entities[j]) : entities[j];
    const arr = columns.map((key) => `"${obj[key] || ""}"`);
    csv.push(arr.join(";"));
  }
  initiateFileDownload(csv.join("\n"), fileName);
}

function initiateFileDownload(csv, fileName) {
  let blob = new Blob([csv]);
  if (window.navigator.msSaveOrOpenBlob)
    // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
    window.navigator.msSaveBlob(blob, fileName);
  else {
    let a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(blob, {
      type: "text/plain;charset=UTF-8",
    });
    a.download = fileName;
    document.body.appendChild(a);
    a.click(); // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
    document.body.removeChild(a);
  }
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

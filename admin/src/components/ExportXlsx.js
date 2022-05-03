import React, { useState, useEffect, useRef } from "react";
import { ReactiveComponent } from "@appbaseio/reactivesearch";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import LoadingButton from "./buttons/LoadingButton";
import ModalConfirm from "./modals/ModalConfirm";
import api from "../services/api";
import dayjs from "dayjs";
import { translate } from "../utils";

export default function ExportComponent({
  handleClick,
  title,
  exportTitle,
  index,
  react,
  transform,
  searchType = "export",
  defaultQuery = () => ({ query: { query: { match_all: {} } } }),
  fields = [],
}) {
  const [exporting, setExporting] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const query = useRef(defaultQuery().query);
  const [checkedFields, setCheckedFields] = useState([]);

  const handleCheck = (event) => {
    event.persist();
    setCheckedFields((previousList) => {
      const newList = [...previousList];
      if (event.target?.checked) {
        if (!newList.includes(event.target.value)) newList.push(event.target.value);
      } else {
        newList.filter((e) => e !== event.target.value);
      }
      return newList;
    });
  };

  const onClick = () => {
    handleClick?.();
    setModal({
      isOpen: true,
      onConfirm: () => setExporting(true),
      title: "Téléchargement",
      message: (
        <div>
          <p>
            En téléchargeant ces informations, vous vous engagez à les supprimer après consultation en application des dispositions légales sur la protection des données
            personnelles (RGPD, CNIL)
          </p>
          {fields.map((field) => (
            <div className="flex items-center gap-1" key={field}>
              <input id={`checkbox ${field}`} className="!min-w-0 !m-0 cursor-pointer" value={field} type="checkbox" onChange={handleCheck} />
              <label htmlFor={`checkbox ${field}`} className="cursor-pointer mb-0">
                {field}
              </label>
            </div>
          ))}
        </div>
      ),
    });
  };

  useEffect(() => {
    if (searchType === "_msearch") {
      query.current = defaultQuery().query;
    }
  }, [defaultQuery()]);

  if (exporting) {
    return (
      <ReactiveComponent
        defaultQuery={() => ({ ...defaultQuery(), size: 1 })}
        componentId="EXPORT"
        react={react}
        onQueryChange={(prev, next) => {
          if (searchType !== "_msearch") {
            query.current = next.query;
          }
        }}
        render={(props) => {
          const { setQuery, data, loading } = props;
          return (
            <Loading
              setQuery={setQuery}
              currentQuery={query.current}
              data={data}
              loading={loading}
              onFinish={() => setExporting(false)}
              index={index}
              exportTitle={exportTitle}
              transform={transform}
              searchType={searchType}
              fields={checkedFields}
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

function Loading({ onFinish, loading, exportTitle, transform, currentQuery, index, searchType, fields }) {
  const STATUS_LOADING = "Récupération des données";
  const STATUS_TRANSFORM = "Mise en forme";
  const STATUS_EXPORT = "Création du fichier";
  const [status, setStatus] = useState(null);
  const [data, setData] = useState([]);
  console.log("Loading", { fields });
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (loading === false) setRun(true);
  }, [loading]);

  useEffect(() => {
    if (!run) return;

    if (!status) {
      setStatus(STATUS_LOADING);
    } else if (status === STATUS_LOADING) {
      getAllResults(index, currentQuery, searchType).then((results) => {
        setData(results);
        setStatus(STATUS_TRANSFORM);
      });
    } else if (status === STATUS_TRANSFORM) {
      toArrayOfArray(data, transform, fields).then((results) => {
        setData(results);
        setStatus(STATUS_EXPORT);
      });
    } else if (status === STATUS_EXPORT) {
      const fileName = `${exportTitle}_${dayjs().format("YYYY-MM-DD_HH[h]mm[m]ss[s]")}.xlsx`;

      exportData(fileName, data);
      onFinish();
    }
  }, [run, status]);

  return (
    <div>
      <LoadingButton loading={loading || run} loadingText={status}></LoadingButton>
    </div>
  );
}

async function toArrayOfArray(results, transform, fields) {
  let data = results;
  if (fields?.length > 0) {
    data = data.reduce((prev, current) => {
      const d = fields
        .filter((key) => key in current) // line can be removed to make it inclusive
        .reduce((obj, key) => ((obj[key] = current[key]), obj), {});

      return [...prev, d];
    }, []);
  }
  let columns = Object.keys(data[0] ?? []);
  data = transform ? await transform(data) : data;
  return [columns, ...data.map((item) => Object.values(item))];
}

async function getAllResults(index, query, searchType) {
  let result;
  if (searchType === "_msearch") {
    result = await api.esQuery(index, query);
    if (!result.responses.length) return [];
    return result.responses[0];
  } else {
    result = await api.post(`/es/${index}/export`, { query });
    if (!result.data.length) return [];
    return result.data;
  }
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

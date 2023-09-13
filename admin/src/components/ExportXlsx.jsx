import React, { useState, useEffect, useRef } from "react";
import { ReactiveComponent } from "@appbaseio/reactivesearch";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import LoadingButton from "./buttons/LoadingButton";
import LoadingButtonV2 from "./buttons/LoadingButtonV2";
import ModalConfirm from "./modals/ModalConfirm";
import api from "../services/api";
import dayjs from "@/utils/dayjs.utils";

export default function ExportComponent({
  handleClick,
  title,
  exportTitle,
  index,
  react,
  transform,
  searchType = "export",
  defaultQuery = () => ({ query: { query: { match_all: {} } } }),
  fieldsToExport = "*",
  setIsOpen,
  customCss = { override: false },
  icon,
}) {
  const [exporting, setExporting] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const query = useRef(defaultQuery().query);
  const onClick = () => {
    handleClick?.();
    setModal({
      isOpen: true,
      onConfirm: () => setExporting(true),
      title: "Téléchargement",
      message:
        "En téléchargeant ces informations, vous vous engagez à les supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)",
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
              onFinish={() => {
                setExporting(false);
                if (setIsOpen) setIsOpen(false);
              }}
              index={index}
              exportTitle={exportTitle}
              transform={transform}
              searchType={searchType}
              fieldsToExport={fieldsToExport}
              customCss={customCss}
            />
          );
        }}
      />
    );
  }

  return (
    <div className={setIsOpen && "w-full"}>
      {customCss?.override ? (
        <LoadingButtonV2 onClick={onClick} style={customCss.button}>
          <div className={icon && "flex items-center gap-2"}>
            {icon ? icon : null}
            {title}
          </div>
        </LoadingButtonV2>
      ) : (
        <LoadingButton onClick={onClick}>{title}</LoadingButton>
      )}
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
    </div>
  );
}

function Loading({ onFinish, loading, exportTitle, transform, currentQuery, index, searchType, fieldsToExport, customCss }) {
  const STATUS_LOADING = "Récupération des données";
  const STATUS_TRANSFORM = "Mise en forme";
  const STATUS_EXPORT = "Création du fichier";
  const [status, setStatus] = useState(null);
  const [data, setData] = useState([]);

  const [run, setRun] = useState(false);

  useEffect(() => {
    if (loading === false) setRun(true);
  }, [loading]);

  useEffect(() => {
    if (!run) return;

    if (!status) {
      setStatus(STATUS_LOADING);
    } else if (status === STATUS_LOADING) {
      getAllResults(index, currentQuery, searchType, fieldsToExport).then((results) => {
        setData(results);
        setStatus(STATUS_TRANSFORM);
      });
    } else if (status === STATUS_TRANSFORM) {
      toArrayOfArray(data, transform).then((results) => {
        setData(results);
        setStatus(STATUS_EXPORT);
      });
    } else if (status === STATUS_EXPORT) {
      const fileName = `${exportTitle}_${dayjs().format("YYYY-MM-DD_HH[h]mm[m]ss[s]")}`;

      exportData(fileName, data);
      onFinish();
    }
  }, [run, status]);

  return (
    <div className={fieldsToExport !== "*" && "w-full"}>
      {customCss?.override ? (
        <LoadingButtonV2 loading={loading || run} loadingText={status} style={customCss.loadingButton}></LoadingButtonV2>
      ) : (
        <LoadingButton loading={loading || run} loadingText={status}></LoadingButton>
      )}
    </div>
  );
}

async function toArrayOfArray(results, transform) {
  const data = transform ? await transform(results) : results;
  let columns = Object.keys(data[0] ?? []);
  return [columns, ...data.map((item) => Object.values(item))];
}

async function getAllResults(index, query, searchType, fieldsToExport) {
  let result;
  if (searchType === "_msearch") {
    result = await api.esQuery(index, query);
    if (!result.responses.length) return [];
    return result.responses[0];
  } else {
    result = await api.post(`/es/${index}/export`, { query, fieldsToExport });
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

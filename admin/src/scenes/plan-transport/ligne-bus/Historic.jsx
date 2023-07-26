import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import Breadcrumbs from "../../../components/Breadcrumbs";
import HistoryComponent from "../../../components/views/HistoricServerDriven";
import API from "../../../services/api";
import { Title } from "../components/commons";
import Select from "../components/Select";
import { cohortList } from "../util";
import { createEvent } from "../../../utils";
import { useHistory } from "react-router-dom";
import Loader from "../../../components/Loader";
import { ROLES } from "snu-lib";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { BsDownload } from "react-icons/bs";
import { useState } from "react";

let filterOptionsCache = null;

export default function Historic() {
  const [loading, setLoading] = React.useState(false);
  const user = useSelector((state) => state.Auth.user);
  const urlParams = new URLSearchParams(window.location.search);
  const [cohort, setCohort] = React.useState(urlParams.get("cohort") || "Février 2023 - C");
  const [data, setData] = React.useState([]);
  const [pagination, setPagination] = React.useState({ count: 0, page: 0, pageCount: 0 });
  const [currentPage, setCurrentPage] = React.useState(0);
  const [filters, setFilters] = React.useState({ op: [], userId: [], path: [], query: "" });
  const [options, setOptions] = React.useState(filterOptionsCache);
  const [exporting, setExporting] = React.useState(false);
  const history = useHistory();

  useEffect(() => {
    (async function () {
      try {
        if (filterOptionsCache) {
          setOptions(filterOptionsCache);
        } else {
          const { ok, data } = await API.get("/ligne-de-bus/patches/filter-options");
          if (ok) {
            filterOptionsCache = data;
            setOptions(data);
          } else {
            console.log("Error: unable to load options...");
          }
        }
      } catch (err) {
        console.log("Error: unable to load options...", err);
      }
    })();
  }, []);

  useEffect(() => {
    getPatches();
  }, [cohort, currentPage]);

  useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0);
    } else {
      getPatches();
    }
  }, [filters]);

  // console.log("🚀 ~ file: Historic.js:17 ~ Historic ~ data", data);
  const formattedData = formatHistory(data, user.role);

  // Insert fetch and format logic here
  async function getPatches(forExport = false) {
    if (!forExport) {
      setLoading(true);
    }
    try {
      let query = { page: currentPage };
      if (filters.op && filters.op.length > 0) {
        query.op = filters.op.join(",");
      }
      if (filters.author && filters.author.length > 0) {
        query.userId = filters.author.join(",");
      }
      if (filters.path && filters.path.length > 0) {
        query.path = filters.path.join(",");
      }
      if (filters.query && filters.query.trim().length > 0) {
        query.query = filters.query.trim();
      }

      if (forExport) {
        query.nopagination = "true";
      }

      const queryString = Object.keys(query)
        .map((key) => key + "=" + query[key])
        .join("&");
      const { ok, data, pagination } = await API.get(`/ligne-de-bus/patches/${cohort}?${queryString}`);
      if (!ok) return null;
      if (forExport) {
        return data;
      } else {
        setData(data);
        setPagination(pagination);
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (!forExport) {
        setLoading(false);
      }
    }
  }

  function changePage(page) {
    setCurrentPage(page);
  }

  async function exportHistoric() {
    if (!exporting) {
      setExporting(true);
      const data = await getPatches(true);
      const formattedData = data.map((row) => {
        return {
          ["Identifiant ligne"]: row.lineId,
          Ligne: row.refName,
          Action: row.op,
          Date: new Date(row.date),
          ["Propriété"]: row.path,
          ["Valeur originale"]: row.originalValue,
          ["Nouvelle valeur"]: row.value,
          ["Identifiant utilisateur"]: row.user ? row.user._id : "?",
          ["Nom utilisateur"]: row.user ? row.user.firstName + " " + row.user.lastName : "?",
          ["Role utilisateur"]: row.user ? row.user.role : "?",
        };
      });
      exportExcel("Historique-Ligne-Bus-" + new Date().toISOString(), formattedData);
      setExporting(false);
    }
  }

  async function exportExcel(fileName, data) {
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const resultData = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(resultData, fileName + fileExtension);
  }

  const exportButton =
    user.role === ROLES.ADMIN ? (
      <button className="text-grey-700 flex h-10 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium" onClick={exportHistoric}>
        <BsDownload className="text-gray-400" />
        {exporting ? <Loader size="20px" /> : "Exporter"}
      </button>
    ) : null;

  return (
    <>
      <Breadcrumbs items={[{ label: "Plan de transport", to: `/ligne-de-bus?cohort=${cohort}` }, { label: "Historique du plan de transport" }]} />
      <div className="w-full px-8 pt-3 pb-4">
        <div className="flex items-center justify-between pb-6">
          <Title>Historique du plan de transport</Title>
          <Select
            options={cohortList}
            value={cohort}
            onChange={(e) => {
              setCohort(e);
              history.replace({ search: `?cohort=${e}` });
            }}
          />
        </div>
        <HistoryComponent
          loading={loading}
          data={formattedData}
          refName="Ligne"
          path={"ligne-de-bus"}
          pagination={pagination}
          changePage={changePage}
          filters={filters}
          changeFilters={setFilters}
          filterOptions={options}
          extraTool={exportButton}
        />
      </div>
    </>
  );
}

export function formatHistory(data, role) {
  if (data) {
    return data.map((e) => createEvent(e, e.value, e.originalValue, role));
  } else {
    return [];
  }
}

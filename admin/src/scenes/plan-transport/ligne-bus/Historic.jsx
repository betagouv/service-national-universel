import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import HistoryComponent from "../../../components/views/HistoricServerDriven";
import API from "../../../services/api";
import { createEvent } from "../../../utils";
import Loader from "../../../components/Loader";
import { ROLES } from "snu-lib";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { BsDownload } from "react-icons/bs";

let filterOptionsCache = null;

export default function Historic() {
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.Auth.user);
  const urlParams = new URLSearchParams(window.location.search);
  const [cohort, setCohort] = useState(urlParams.get("cohort"));
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ count: 0, page: 0, pageCount: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState({ op: [], userId: [], path: [], query: "" });
  const [options, setOptions] = useState(filterOptionsCache);
  const [exporting, setExporting] = useState(false);

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

  const formattedData = formatHistory(data, user.role);

  // Insert fetch and format logic here
  async function getPatches(forExport = false) {
    if (!cohort) return;
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
      console.log(pagination);
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
  );
}

export function formatHistory(data, role) {
  if (data) {
    return data.map((e) => createEvent(e, e.value, e.originalValue, role));
  } else {
    return [];
  }
}

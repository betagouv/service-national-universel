import React, { useState } from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { toastr } from "react-redux-toastr";

import { departmentLookUp, department2region, departmentToAcademy, translate, translateModelFields } from "../../../utils";
import LoadingButton from "../../../components/buttons/LoadingButton";
import api from "../../../services/api";
import ModalConfirm from "../../../components/modals/ModalConfirm";

// TODO (fix): Export not only for 2021.
export default function ExportAll({ filter }) {
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [loadingText, setLoadingText] = useState();

  const onClick = () => {
    setModal({
      isOpen: true,
      onConfirm: run,
      title: "Téléchargement",
      message:
        "En téléchargeant ces informations, vous vous engagez à les supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)",
    });
  };

  async function run() {
    if (!filter?.cohort?.length) return toastr.error("Merci de selectionner au moins une cohorte ");
    if (!filter?.status?.length) return toastr.error("Merci de selectionner au moins un statut");

    // starting the process...
    setLoading(true);

    // get all the inscriptions goals for the selected cohorts
    const inscriptionGoalsRequest = (filter?.cohort || []).map((cohort) => api.get(`/inscription-goal/${encodeURI(cohort)}`));
    let inscriptionGoals = await Promise.all([...inscriptionGoalsRequest]);
    inscriptionGoals = inscriptionGoals?.reduce((previous, current) => {
      if (current.ok && current.data?.length) {
        previous.push(...current.data);
      }
      return previous;
    }, []);
    const lines = [];

    lines.push(["Académie", "Région", "Numéro dpt", "Département", "Objectif", ...(filter?.status || []).map((e) => translate(e))]);
    const keys = Object.keys(departmentLookUp)
      // remove the special case for Corse
      ?.filter((number) => number !== "20")
      // get all the academy if there is no filter specified, else get only the department of the academy filtered
      ?.filter((number) => !filter?.academy?.length || filter?.academy?.includes(departmentToAcademy[departmentLookUp[number]]))
      // get all the region if there is no filter specified, else get only the department of the region filtered
      ?.filter((number) => !filter?.region?.length || filter?.region?.includes(department2region[departmentLookUp[number]]))
      // get all the department if there is no filter specified, else get only the department filtered
      ?.filter((number) => !filter?.department?.length || filter?.department?.includes(departmentLookUp[number]))
      ?.sort((a, b) => a - b);
    for (let i = 0; i < keys.length; i++) {
      const dptCode = keys[i];
      const dptName = departmentLookUp[dptCode];
      const region = department2region[dptName];
      const academy = departmentToAcademy[dptName];

      const body = {
        query: {
          bool: {
            must: { match_all: {} },
            filter: [{ terms: { "cohort.keyword": filter?.cohort } }, { term: { "department.keyword": dptName } }, { terms: { "status.keyword": filter?.status } }],
          },
        },
        aggs: { status: { terms: { field: "status.keyword" } } },
        size: 0,
      };
      const { responses } = await api.esQuery("young", body);
      if (responses.length) {
        const status = api.getAggregations(responses[0]);
        const goal = inscriptionGoals.filter((g) => g.department === dptName)?.reduce((p, c) => p + (c.max || 0), 0);
        const line = [academy, region, dptCode, dptName, goal, ...(filter?.status || []).map((filterStatus) => status[filterStatus] || 0)];
        lines.push(line);
      }
      setLoadingText(`${((i / keys.length) * 100).toFixed(0)} %`);
    }
    const linesFilter = [["filtre", "valeur(s)"]];
    Object.keys(filter)?.forEach((f) => {
      linesFilter.push([translateModelFields("young", f), filter[f]?.map(translate)?.join(", ")]);
    });

    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const sheetData = XLSX.utils.aoa_to_sheet(lines);
    const sheetFilter = XLSX.utils.aoa_to_sheet(linesFilter);
    const wb = { Sheets: { Données: sheetData, Filtres: sheetFilter }, SheetNames: ["Données", "Filtres"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    setLoading(false);
    const now = new Date();
    const exportDate = `${now.getFullYear()}${now.getMonth() + 1}${("0" + now.getDate()).slice(-2)}`;
    const exportTime = `${now.getHours()}${now.getMinutes()}`;
    FileSaver.saveAs(data, `${exportDate}_${exportTime}_Global.xlsx`);
  }

  return (
    <>
      <LoadingButton onClick={onClick} loading={loading} loadingText={loadingText}>
        Exporter le rapport
      </LoadingButton>
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

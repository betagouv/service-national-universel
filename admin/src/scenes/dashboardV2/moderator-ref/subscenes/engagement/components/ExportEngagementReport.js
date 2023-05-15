import React, { useState } from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import plausibleEvent from "../../../../../../services/plausible";
import { YOUNG_STATUS, department2region, departmentLookUp, departmentToAcademy, region2department, translate, translateInscriptionStatus } from "snu-lib";
import ButtonPrimary from "../../../../../../components/ui/buttons/ButtonPrimary";
import ModalConfirm from "../../../../../../components/modals/ModalConfirm";
import { REFERENT_ROLES } from "snu-lib";
import { useSelector } from "react-redux";
import ButtonLight from "../../../../../../components/ui/buttons/ButtonLight";

export default function ExportEngagementReport({ filter }) {
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

    console.log(filter);

    // starting the process...
    setLoading(true);

    // get all the inscriptions goals for the selected cohorts
    // const inscriptionGoalsRequest = (filter?.cohort || []).map((cohort) => api.get(`/inscription-goal/${encodeURI(cohort)}`));
    // let inscriptionGoals = await Promise.all([...inscriptionGoalsRequest]);
    // inscriptionGoals = inscriptionGoals?.reduce((previous, current) => {
    //   if (current.ok && current.data?.length) {
    //     previous.push(...current.data);
    //   }
    //   return previous;
    // }, []);
    // const lines = [];
    //
    // lines.push(["Académie", "Région", "Numéro dpt", "Département", "Objectif", ...Object.values(YOUNG_STATUS).map((e) => translateInscriptionStatus(e))]);
    // const keys = Object.keys(departmentLookUp)
    //   // remove the special case for Corse
    //   ?.filter((number) => number !== "20")
    //   // get all the academy if there is no filter specified, else get only the department of the academy filtered
    //   ?.filter((number) => !filter?.academy?.length || filter?.academy?.includes(departmentToAcademy[departmentLookUp[number]]))
    //   // get all the region if there is no filter specified, else get only the department of the region filtered
    //   ?.filter((number) => !filter?.region?.length || filter?.region?.includes(department2region[departmentLookUp[number]]))
    //   // get all the department if there is no filter specified, else get only the department filtered
    //   ?.filter((number) => !filter?.department?.length || filter?.department?.includes(departmentLookUp[number]))
    //   ?.sort((a, b) => a - b);
    // console.log(keys);
    // for (let i = 0; i < keys.length; i++) {
    //   const dptCode = keys[i];
    //   const dptName = departmentLookUp[dptCode];
    //   const region = department2region[dptName];
    //   const academy = departmentToAcademy[dptName];
    //
    //   const body = {
    //     query: {
    //       bool: {
    //         must: { match_all: {} },
    //         filter: [{ terms: { "cohort.keyword": filter?.cohort } }, { term: { "department.keyword": dptName } }],
    //       },
    //     },
    //     aggs: { status: { terms: { field: "status.keyword" } } },
    //     size: 0,
    //   };
    //   const { responses } = await api.esQuery("young", body);
    //   if (responses.length) {
    //     const status = api.getAggregations(responses[0]);
    //     const goal = inscriptionGoals.filter((g) => g.department === dptName)?.reduce((p, c) => p + (c.max || 0), 0);
    //     const line = [academy, region, dptCode, dptName, goal, ...Object.values(YOUNG_STATUS).map((filterStatus) => status[filterStatus] || 0)];
    //     lines.push(line);
    //   }
    //   setLoadingText(`${((i / keys.length) * 100).toFixed(0)} %`);
    // }
    // const linesFilter = [["filtre", "valeur(s)"]];
    // Object.keys(filter)?.forEach((f) => {
    //   linesFilter.push([translateModelFields("young", f), filter[f]?.map(translate)?.join(", ")]);
    // });

    const lines = [];
    const linesFilter = [];

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
    FileSaver.saveAs(data, `${exportDate}_${exportTime}_DetailMission.xlsx`);
    setLoadingText(`0 %`);
  }

  return (
    <>
      <ButtonLight className="bg-gray-100 rounded text-gray-900 text-xs font-medium py-[7px] px-[10px] hover:bg-gray-200" onClick={onClick} disabled={loading}>
        Exporter le détail des missions {loading ? `(${loadingText})` : ""}
      </ButtonLight>
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

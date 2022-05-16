import React from "react";
import { toastr } from "react-redux-toastr";
import { NavLink, useHistory, useParams } from "react-router-dom";
import Bus from "../../../assets/icons/Bus";
import ClipboardList from "../../../assets/icons/ClipboardList";
import Menu from "../../../assets/icons/Menu";
import PencilAlt from "../../../assets/icons/PencilAlt";
import ShieldCheck from "../../../assets/icons/ShieldCheck";
import SelectAction from "../../../components/SelectAction";
import { environment } from "../../../config";
import api from "../../../services/api";
import ModalExportMail from "../components/modals/ModalExportMail";
import FicheSanitaire from "./fiche-sanitaire";
import General from "./general";
import Pointage from "./pointage";
import { ES_NO_LIMIT } from "snu-lib";
import { formatDateFRTimezoneUTC, translate } from "../../../utils";
import dayjs from "dayjs";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

export default function CenterYoungIndex() {
  if (environment === "production") return null;

  const [modalExportMail, setModalExportMail] = React.useState({ isOpen: false });
  const [filter, setFilter] = React.useState();

  function updateFilter(n) {
    setFilter({ ...filter, ...n });
  }

  console.log(filter);
  const history = useHistory();
  const { id, sessionId, currentTab } = useParams();

  React.useEffect(() => {
    const listTab = ["general", "tableau-de-pointage", "fiche-sanitaire"];
    if (!listTab.includes(currentTab)) history.push(`/centre/${id}/${sessionId}/general`);
  }, [currentTab]);

  const exportData = async () => {
    let body = {
      query: {
        bool: {
          must: [],
          filter: [{ terms: { "status.keyword": ["VALIDATED", "WITHDRAWN", "WAITING_LIST"] } }, { term: { "sessionPhase1Id.keyword": sessionId } }],
        },
      },
      sort: [
        {
          "lastName.keyword": "asc",
        },
      ],
      track_total_hits: true,
      size: ES_NO_LIMIT,
    };

    if (filter?.search) {
      body.query.bool.must.push({
        bool: {
          should: [
            {
              multi_match: {
                query: filter?.search,
                fields: ["email.keyword", "firstName.folded", "lastName.folded", "city.folded", "zip"],
                type: "cross_fields",
                operator: "and",
              },
            },
            {
              multi_match: {
                query: filter?.search,
                fields: ["email.keyword", "firstName.folded", "lastName.folded", "city.folded", "zip"],
                type: "phrase",
                operator: "and",
              },
            },
            {
              multi_match: {
                query: filter?.search,
                fields: ["firstName.folded", "lastName.folded", "city.folded", "zip"],
                type: "phrase_prefix",
                operator: "and",
              },
            },
          ],
          minimum_should_match: "1",
        },
      });
    }
    if (filter?.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
    if (filter?.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });
    if (filter?.status?.length) body.query.bool.filter.push({ terms: { "status.keyword": filter.status } });
    if (filter?.statusPhase1?.length) body.query.bool.filter.push({ terms: { "statusPhase1.keyword": filter.statusPhase1 } });
    if (filter?.cohesionStayPresence?.length) body.query.bool.filter.push({ terms: { "cohesionStayPresence.keyword": filter.cohesionStayPresence } });

    const data = await getAllResults("young", body);
    const csv = await toArrayOfArray(data, transformData);
    await toXLSX(`young_pointage_${dayjs().format("YYYY-MM-DD_HH[h]mm[m]ss[s]")}.xlsx`, csv);
  };

  return (
    <>
      <div className="m-4">
        <div className="flex items-center justify-between">
          <div className="font-bold text-2xl mb-4">Volontaires</div>
          <SelectAction
            title="Exporter les volontaires"
            alignItems="right"
            buttonClassNames="bg-blue-600"
            textClassNames="text-white font-medium text-sm"
            rightIconClassNames="text-blue-300"
            optionsGroup={[
              {
                title: "Télécharger",
                items: [
                  {
                    action: async () => {
                      await exportData();
                    },
                    render: (
                      <div className="group flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <ClipboardList className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
                        <div style={{ fontFamily: "Marianne" }} className="text-sm text-gray-700">
                          Informations complètes
                        </div>
                      </div>
                    ),
                  },
                ],
              },
              {
                title: "Envoyer par mail",
                items: [
                  {
                    action: async () => {
                      setModalExportMail({
                        isOpen: true,
                        onSubmit: async (emails) => {
                          const { ok } = await api.post(`/session-phase1/${sessionId}/share`, { emails });
                          if (!ok) toastr.error("Oups, une erreur s'est produite");
                          toastr.success("Un mail a été envoyé à tous les destinataires renseignés");
                          setModalExportMail({ isOpen: false });
                        },
                      });
                    },
                    render: (
                      <div className="group flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <Bus className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
                        <div className="text-sm text-gray-700">Informations transports</div>
                      </div>
                    ),
                  },
                ],
              },
            ]}
          />
        </div>
        <div className=" flex flex-1 flex-col lg:flex-row">
          <nav className="flex flex-1 gap-1">
            <TabItem icon={<Menu />} title="Général" to={`/centre/${id}/${sessionId}/general`} />
            <TabItem icon={<PencilAlt />} title="Tableau de pointage" to={`/centre/${id}/${sessionId}/tableau-de-pointage`} />
            <TabItem icon={<ShieldCheck />} title="Fiche sanitaire" to={`/centre/${id}/${sessionId}/fiche-sanitaire`} />
          </nav>
        </div>
        <div className="bg-white pt-4">
          {currentTab === "general" && <General filter={filter} updateFilter={updateFilter} />}
          {currentTab === "tableau-de-pointage" && <Pointage />}
          {currentTab === "fiche-sanitaire" && <FicheSanitaire />}
        </div>
      </div>
      <ModalExportMail isOpen={modalExportMail?.isOpen} onCancel={() => setModalExportMail({ isOpen: false, value: null })} onSubmit={modalExportMail?.onSubmit} />
    </>
  );
}

const TabItem = ({ to, title, icon }) => (
  <NavLink
    to={to}
    activeClassName="!text-snu-purple-800 bg-white border-none"
    className="text-[13px] px-3 py-2 cursor-pointer text-gray-600 rounded-t-lg bg-gray-50 border-t-[1px] border-r-[1px] border-l-[1px] border-gray-200 hover:text-snu-purple-800">
    <div className="flex items-center gap-2">
      {icon} {title}
    </div>
  </NavLink>
);

const transformData = (data) => {
  return data.map((value) => {
    return {
      Prénom: value.firstName,
      Nom: value.lastName,
      "Date de naissance": formatDateFRTimezoneUTC(value.birthdateAt),
      Ville: value.city,
      Département: value.department,
      "Présence à l'arrivée": !value.cohesionStayPresence ? "Non renseignée" : value.cohesionStayPresence === "true" ? "Présent" : "Absent",
      "Présence JDM": !value.presenceJDM ? "Non renseignée" : value.presenceJDM === "true" ? "Présent" : "Absent",
      Départ: !value.departSejourAt ? "Non renseignée" : formatDateFRTimezoneUTC(value.departSejourAt),
      " Fiche Sanitaire": !value.cohesionStayMedicalFileReceived ? "Non renseignée" : value.cohesionStayMedicalFileReceived === "true" ? "Réceptionnée" : "Non réceptionnée",
      "Statut phase 1": translate(value.statusPhase1),
    };
  });
};

async function toArrayOfArray(results, transform) {
  const data = transform ? await transform(results) : results;
  let columns = Object.keys(data[0] ?? []);
  return [columns, ...data.map((item) => Object.values(item))];
}

async function getAllResults(index, query) {
  const result = await api.post(`/es/${index}/export`, query);
  if (!result.data.length) return [];
  return result.data;
}

async function toXLSX(fileName, csv) {
  const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
  const ws = XLSX.utils.aoa_to_sheet(csv);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const resultData = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(resultData, fileName + fileExtension);
}

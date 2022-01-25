import React, { useState } from "react";
import useSWR from "swr";
import API from "../services/api";

const initColumns = [
  { key: "number", visible: true, name: "Numéro", type: Number },
  { key: "title", visible: true, name: "Titre", type: String },
  { key: "category", visible: true, name: "Categorie", type: String, map: { TECHNICAL: "Technique", QUESTION: "Question", EMPTY: "Aucune" } },
  { key: "subject", visible: true, name: "Sujet", type: String },
  { key: "canal", visible: true, name: "Canal", type: String },
  { key: "group", visible: true, name: "Groupe", type: String },
  { key: "priority", visible: true, name: "Priorité", type: String, map: { LOW: "Basse", NORMAL: "Normale", HIGH: "Haute" } },
  {
    key: "status",
    visible: true,
    name: "Statut",
    type: String,
    map: { new: "Nouveau", open: "Ouvert", closed: "Fermé", "pending reminder": "En attente", "pending close": "En attente de fermeture", merged: "Mergé" },
  },
  { key: "emitterExternal", visible: true, name: "Émetteur externe", type: Boolean },
  { key: "emitterDepartment", visible: true, name: "Département de l'émetteur", type: String },
  { key: "emitterRegion", visible: true, name: "Région de l'émetteur", type: String },
  { key: "emitterAcademy", visible: true, name: "Académie de l'émetteur", type: String },
  { key: "addressedToAgent", visible: true, name: "Adressé à l'agent", type: String },
  { key: "firstResponseAt", visible: true, name: "Première réponse", type: Date },
  { key: "timeUntilFirstResponse", visible: true, name: "Temps avant la première réponse", type: Date },
  { key: "lastContactEmitterAt", visible: true, name: "Dernière réponse de l'émetteur", type: Date },
  // { key: 'lastContactAgentAt', visible: true, name: 'Dernière réponse de l\'agent' },
  { key: "agentResponseCount", visible: true, name: "Nombre de réponses de l'agent", type: Number },
  { key: "lastAgentInChargeUpdateAt", visible: true, name: "Dernière réponse de l'agent en charge", type: Date },
  { key: "tags", visible: true, name: "Tags", type: [String] },
  { key: "closedAt", visible: true, name: "Fermé le", type: Date },
  { key: "createdAt", visible: true, name: "Clos le", type: Date },
];

const TicketsTable = () => {
  const { data } = useSWR(API.getUrl({ path: "/support-center/ticket" }));
  console.log({ data });
  const tickets = data.data;

  const [columns, setColumns] = useState(() => JSON.parse(localStorage.getItem("snu-tickets-table")) || initColumns);

  return (
    <div className="overflow-auto m-4">
      <table className="min-w-full border-collapse">
        <thead className="bg-white border-b">
          <tr className="relative">
            {columns
              .filter((c) => c.visible)
              .map(({ key, name }) => (
                <th key={key} scope="col" className="text-sm font-medium text-gray-900 px-6 py-4 text-left border-2 resize-x overflow-auto sticky top-0 min-w-[70px]">
                  {name}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket, index) => {
            return (
              <React.Fragment key={ticket._id}>
                <tr className={`${index % 2 === 1 ? "bg-gray-100" : "bg-white"}  hover:bg-gray-200 border-b`}>
                  {columns
                    .filter((c) => c.visible)
                    .map(({ key }) => (
                      <td key={key} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 overflow-auto">
                        {ticket[key]}
                      </td>
                    ))}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsTable;

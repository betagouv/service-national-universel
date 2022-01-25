import { useState } from "react";
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

  const [columns, setColumns] = useState(() => JSON.parse(localStorage.getItem("snu-tickets-table")) || initColumns);

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-white border-b">
                <tr>
                  <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                    #
                  </th>
                  <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                    First
                  </th>
                  <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                    Last
                  </th>
                  <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                    Handle
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-100 border-b">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1</td>
                  <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">Mark</td>
                  <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">Otto</td>
                  <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">@mdo</td>
                </tr>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2</td>
                  <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">Jacob</td>
                  <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">Thornton</td>
                  <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">@fat</td>
                </tr>
                <tr className="bg-gray-100 border-b">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">3</td>
                  <td colSpan="2" className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap text-center">
                    Larry the Bird
                  </td>
                  <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">@twitter</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketsTable;

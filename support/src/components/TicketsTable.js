import React, { useEffect, useMemo, useRef, useState } from "react";
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

const TicketsTable = ({ onTicketClick }) => {
  const { data } = useSWR(API.getUrl({ path: "/support-center/ticket" }));
  const tickets = data?.data || [];

  const [columns] = useState(() => JSON.parse(localStorage.getItem("snu-tickets-table")) || initColumns);
  const tableRef = useRef(null);

  return (
    <div ref={tableRef} className="p-4 h-full">
      <div className="relative overflow-auto h-full">
        <div className="bg-white flex sticky top-0 border-b w-min">
          {columns
            .filter((c) => c.visible)
            .map(({ key, name }) => (
              <ResizableColumn height={tableRef?.current?.getBoundingClientRect().height} key={key} columnKey={key}>
                {name}
              </ResizableColumn>
            ))}
        </div>
        {tickets.map((ticket, index) => {
          return (
            <React.Fragment key={ticket._id}>
              <div
                data-ticketid={ticket._id}
                onClick={onTicketClick}
                className={`${index % 2 === 1 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200 border-b  flex cursor-pointer w-min`}
              >
                {columns
                  .filter((c) => c.visible)
                  .map(({ key }) => (
                    <div key={key} data-key={key} className={`px-6 py-4 whitespace-nowrap text-sm border-r font-medium text-gray-900 truncate flex-shrink-0 flex-grow-0 `}>
                      {ticket[key]}
                    </div>
                  ))}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const ResizableColumn = ({ height, children, columnKey }) => {
  const col = useRef(null);
  const xPosition = useRef(null);
  const currentWidth = useRef(null);
  const colWidthRef = useRef(null);
  const [colWidth, setColWidth] = useState(() => {
    const savedWidth = window.localStorage.getItem(`snu-col-${columnKey}-width`);
    if (!!savedWidth && !isNaN(savedWidth)) return Math.max(0, parseInt(savedWidth, 10));
    return null;
  });

  const mouseDownHandler = function (e) {
    // Get the current mouse position
    xPosition.current = e.clientX;

    // Calculate the current width of column
    currentWidth.current = col.current.getBoundingClientRect().width;

    // Attach listeners for document's events
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };

  const mouseMoveHandler = function (e) {
    // Determine how far the mouse has been moved
    const dx = e.clientX - xPosition.current;
    // Update the width of column
    setColWidth(currentWidth.current + dx);
    colWidthRef.current = currentWidth.current + dx;
  };

  // When user releases the mouse, remove the existing event listeners
  const mouseUpHandler = function () {
    window.localStorage.setItem(`snu-col-${columnKey}-width`, colWidthRef.current);
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };

  const style = useMemo(() => {
    if (!!colWidth) return { width: colWidth };
    return {};
  }, [colWidth]);

  useEffect(() => {
    const newWidth = colWidth || col.current.getBoundingClientRect().width;
    for (const cell of [...document.querySelectorAll(`[data-key='${columnKey}']`)]) {
      if (cell.style) {
        cell.style.width = `${newWidth}px`;
      }
    }
  }, [colWidth]);

  return (
    <div ref={col} scope="col" className="text-sm font-medium bg-white text-gray-900 px-6 py-2 text-left h-auto border flex-shrink-0 flex-grow-0 relative" style={style}>
      {children}
      <div className="resizer" onMouseDown={mouseDownHandler} style={{ height }}></div>
      <div className="absolute h-[1px] bottom-[-1px] right-0 left-0 bg-coolGray-200"></div>
    </div>
  );
};

export default TicketsTable;

import React from "react";
import { classNames, getStatusColor } from "@/utils";
import { STATUS } from "@/constants";

export default function Tab({ filter, setFilter, statusArr, toTreatTicket }) {
  const TabButton = ({ name, status, onClick }) => {
    const color = getStatusColor(status);
    const count = statusArr?.find((item) => item.key === status)?.doc_count || 0;
    return (
      <button
        className={classNames(
          status === filter.status ? "border-indigo-500 text-accent-color" : "border-transparent text-gray-500",
          "flex items-center gap-2 border-b-2 px-1 pb-4"
        )}
        onClick={onClick}
      >
        <span className="text-sm font-medium">{name}</span>
        {name !== "Tous" && <span className={`rounded-full py-0.5 px-2.5 text-xs ${color}`}>{name === "À traiter" ? toTreatTicket : count}</span>}
      </button>
    );
  };

  return (
    <div className="mb-4 mr-[30px] ml-6 flex gap-9 border-b border-gray-200">
      <TabButton name="À traiter" status={STATUS.TOTREAT} onClick={() => setFilter({ ...filter, status: STATUS.TOTREAT, page: 1 })} />
      <TabButton name="Nouveau" status={STATUS.NEW} onClick={() => setFilter({ ...filter, status: STATUS.NEW, page: 1 })} />
      <TabButton name="Ouvert" status={STATUS.OPEN} onClick={() => setFilter({ ...filter, status: STATUS.OPEN, page: 1 })} />
      <TabButton name="En attente" status={STATUS.PENDING} onClick={() => setFilter({ ...filter, status: STATUS.PENDING, page: 1 })} />
      <TabButton name={"Fermé"} status={STATUS.CLOSED} onClick={() => setFilter({ ...filter, status: STATUS.CLOSED, page: 1 })} />
      <TabButton name="Brouillon" status={STATUS.DRAFT} onClick={() => setFilter({ ...filter, status: STATUS.DRAFT, page: 1 })} />
      <TabButton name="Tous" status="all" onClick={() => setFilter({ ...filter, status: "all", page: 1 })} />
    </div>
  );
}

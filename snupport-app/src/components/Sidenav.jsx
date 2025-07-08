import React, { useState } from "react";
import { HiOutlineCollection, HiOutlineTicket, HiOutlineUserGroup, HiOutlineViewGrid } from "react-icons/hi";

import { classNames } from "../utils";

export default function Sidenav() {
  const [active, setActive] = useState(1);

  const SidebarItem = ({ name, icon, lists }) => {
    return (
      <div>
        <div className="ml-6 mb-1 flex items-center gap-2">
          <span className="text-2xl text-gray-400">{icon}</span>
          <span className="text-sm font-medium uppercase text-gray-500">{name}</span>
        </div>
        <div className="ml-14 flex flex-col divide-y divide-gray-300/50">
          {lists.map((list, index) => (
            <button
              type="button"
              className="flex items-center justify-between gap-2 bg-white p-3 transition-colors hover:bg-gray-50"
              onClick={() => setActive(list.id)}
              key={index}
            >
              <span className={classNames(active === list.id ? "font-bold text-accent-color" : "font-medium text-gray-900", "text-left text-base")}>{list.name}</span>
              {list?.total && <span className="flex-none rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-600">{list.total}</span>}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-[276px] flex-none flex-col gap-[28px] overflow-y-auto bg-white py-7">
      <SidebarItem
        name="Tickets"
        icon={<HiOutlineTicket />}
        lists={[
          { id: 1, name: "Boîte de réception", total: 5 },
          { id: 2, name: "Mes tickets assignés" },
          { id: 3, name: "J’ai modifié", total: "19" },
          { id: 4, name: "Favoris", total: "20+" },
          { id: 5, name: "Archives" },
          { id: 6, name: "Corbeille" },
        ]}
      />
      <SidebarItem
        name="Phase 0"
        icon={<HiOutlineUserGroup />}
        lists={[
          { id: 7, name: "Etrangers" },
          { id: 8, name: "Inscription tardive" },
          { id: 9, name: "Jeune de 14 ans" },
        ]}
      />
      <SidebarItem
        name="Phase 1"
        icon={<HiOutlineViewGrid />}
        lists={[
          { id: 10, name: "Lorem ipsum" },
          { id: 11, name: "Soleros dopsim" },
        ]}
      />
      <SidebarItem
        name="Phase 2"
        icon={<HiOutlineCollection />}
        lists={[
          { id: 12, name: "Soleros dopsim" },
          { id: 13, name: "Lorem ipsum" },
        ]}
      />
    </div>
  );
}

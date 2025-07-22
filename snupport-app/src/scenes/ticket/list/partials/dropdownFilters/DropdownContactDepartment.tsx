import React, { useState, useEffect } from "react";
import { Popover, Transition } from "@headlessui/react";
import { HiTrash } from "react-icons/hi";
import { HiChevronDown } from "react-icons/hi";
import Checkbox from "../Checkbox";
import { departmentLookUp } from "@/utils/region-and-departments.utils";
import API from "@/services/api";
import { capture } from "@/sentry";

export default function DropdownContactDepartment({ name, selectedContactDepartment, setSelectedContactDepartment, status }) {
  const [ticketCounts, setTicketCounts] = useState({});

  const handleChangeState = (contactDepartment, value) => {
    if (value) return setSelectedContactDepartment([...new Set([...selectedContactDepartment, contactDepartment])]);

    return setSelectedContactDepartment(selectedContactDepartment.filter((item) => item !== contactDepartment));
  };

  const fetchTicketCounts = async () => {
    try {
      const response = await API.post({ path: "/ticket/search", body: { contactDepartment: Object.values(departmentLookUp) } });
      if (response.ok) {
        const { aggregations } = response;
        if (aggregations?.contactDepartment && Array.isArray(aggregations.contactDepartment)) {
          const counts = aggregations.contactDepartment.reduce((acc, item) => {
            const buckets = item.status?.buckets || [];

            if (status === "TOTREAT") {
              acc[item.key] = buckets.reduce((sum, bucket) => {
                return bucket.key !== "CLOSED" && bucket.key !== "DRAFT" ? sum + bucket.doc_count : sum;
              }, 0);
            } else {
              const statusBucket = buckets.find((bucket) => bucket.key === status);
              acc[item.key] = statusBucket ? statusBucket.doc_count : 0;
            }

            return acc;
          }, {});

          setTicketCounts(counts);
        }
      }
    } catch (error) {
      capture("Error fetching ticket counts:", error);
    }
  };

  useEffect(() => {
    fetchTicketCounts();
  }, [status]);

  return (
    <div>
      <Popover className="relative grow">
        <Popover.Button className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white py-2 pl-4 pr-3">
          <span className="text-left text-sm text-grey-text">{name}</span>
          <HiChevronDown className="text-xl text-gray-500" />
        </Popover.Button>

        <Transition
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Popover.Panel
            className="absolute z-10 mt-2 flex w-full min-w-[224px] origin-top-left flex-col overflow-y-scroll rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5"
            style={{ height: "403px" }}
          >
            <div className="flex justify-end">
              <button
                className="p-2 text-m text-indigo-600 hover:text-indigo-300 hover:bg-gray-100 rounded-md"
                onClick={() => setSelectedContactDepartment(Object.values(departmentLookUp))}
              >
                Select All
              </button>
              <button className="p-2 text-m text-red-500 hover:text-red-300 hover:bg-gray-100 rounded-md mr-1" onClick={() => setSelectedContactDepartment([])}>
                <HiTrash />
              </button>
            </div>
            {Object.entries(departmentLookUp)
              .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
              .map(([key, value]) => (
                <Checkbox
                  key={key}
                  name={`${key} - ${value} (${ticketCounts[value] || 0})`}
                  state={selectedContactDepartment.includes(value)}
                  setState={(v) => handleChangeState(value, v)}
                />
              ))}
          </Popover.Panel>
        </Transition>
      </Popover>
      <div className="mt-2 grid grid-cols-1 gap-1" style={{ maxHeight: "110px", overflowY: "auto" }}>
        {selectedContactDepartment.map((c) => (
          <span key={c} className="rounded-xl bg-purple-100 px-1 text-center font-medium text-purple-800">
            {c} ({ticketCounts[c] || 0})
          </span>
        ))}
      </div>
    </div>
  );
}

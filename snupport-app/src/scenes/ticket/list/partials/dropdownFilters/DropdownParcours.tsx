import React from "react";
import { Popover, Transition } from "@headlessui/react";
import { HiChevronDown } from "react-icons/hi";
import Checkbox from "../Checkbox";
import { PARCOURSLIST } from "@/constants";

export default function DropdownParcours({ name, selectedParcours, setSelectedParcours }) {
  const handleChangeState = (parcours, value) => {
    if (value) return setSelectedParcours([...new Set([...selectedParcours, parcours])]);

    return setSelectedParcours(selectedParcours.filter((item) => item !== parcours));
  };

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
            style={{ height: "80px" }}
          >
            {PARCOURSLIST.map((value) => (
              <Checkbox key={value} name={value === "VOLONTAIRE" ? "HTS" : value} state={selectedParcours?.includes(value)} setState={(v) => handleChangeState(value, v)} />
            ))}
          </Popover.Panel>
        </Transition>
      </Popover>
      <div className="mt-2 grid grid-cols-1 gap-1">
        {selectedParcours?.map((c) => (
          <span key={c} className=" rounded-xl bg-purple-100 px-1 text-center font-medium text-purple-800">
            {c === "VOLONTAIRE" ? "HTS" : c}
          </span>
        ))}
      </div>
    </div>
  );
}

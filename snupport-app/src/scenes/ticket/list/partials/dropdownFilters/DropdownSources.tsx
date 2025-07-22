import React from "react";
import { Popover, Transition } from "@headlessui/react";
import { HiChevronDown } from "react-icons/hi";
import Checkbox from "../Checkbox";
import { SOURCES } from "@/constants";
import { translateSource } from "@/utils";

export default function DropdownSources({ name, selectedSources, setSelectedSources }) {
  const handleChangeState = (source, value) => {
    if (value) return setSelectedSources([...new Set([...selectedSources, source])]);

    return setSelectedSources(selectedSources.filter((item) => item !== source));
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
          <Popover.Panel className="absolute z-10 mt-2 flex w-full min-w-[224px] origin-top-left flex-col rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
            <Checkbox name="✉️  Mail" state={selectedSources.includes(SOURCES.MAIL)} setState={(v) => handleChangeState(SOURCES.MAIL, v)} />
            <Checkbox name="📋️  Formulaire" state={selectedSources.includes(SOURCES.FORM)} setState={(v) => handleChangeState(SOURCES.FORM, v)} />
            <Checkbox name="🖥️  Plateforme" state={selectedSources.includes(SOURCES.PLATFORM)} setState={(v) => handleChangeState(SOURCES.PLATFORM, v)} />
            <Checkbox name="💬️  Chat" state={selectedSources.includes(SOURCES.CHAT)} setState={(v) => handleChangeState(SOURCES.CHAT, v)} />
          </Popover.Panel>
        </Transition>
      </Popover>
      <div className="mt-2 grid grid-cols-1 gap-1">
        {selectedSources?.map((c) => (
          <span key={c} className=" rounded-xl bg-purple-100 px-1 text-center font-medium text-purple-800">
            {translateSource[c]}
          </span>
        ))}
      </div>
    </div>
  );
}

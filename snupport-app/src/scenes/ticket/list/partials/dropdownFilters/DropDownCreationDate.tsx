import React, { Fragment } from "react";
import { DayPicker } from "react-day-picker";
import { Popover, Transition } from "@headlessui/react";
import { HiChevronDown } from "react-icons/hi";
import { MONTHS } from "@/utils/date";
import { toUtc, toUtcLocally, today } from "@/utils/dayjs.utils";

export default function DropdownCreationDate({ name, selectedCreationDate, setSelectedCreationDate }) {
  const onChange = (creationDate) => {
    setSelectedCreationDate(creationDate);
  };
  const defaultMonth = selectedCreationDate?.from ? toUtcLocally(selectedCreationDate?.from) : today();
  const selected = {
    from: selectedCreationDate?.from ? toUtcLocally(selectedCreationDate?.from) : undefined,
    to: selectedCreationDate?.to ? toUtcLocally(selectedCreationDate?.to) : undefined,
  };
  const formatMonthCaption = (day: Date) => {
    return MONTHS[day.getMonth()];
  };

  const formatWeekdayName = (day: Date) => {
    return day.toLocaleDateString("fr", { weekday: "long" }).substring(0, 3);
  };

  return (
    <div>
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white py-2 pl-4 pr-3">
              <span className="text-left text-sm text-grey-text">{name}</span>
              <HiChevronDown className="text-xl text-gray-500" />
            </Popover.Button>
            <Transition
              as={Fragment}
              show={open}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute left-2 z-10 mt-2 translate-x-[15px] transform pt-2">
                <div className="flex flex-auto rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5">
                  <DayPicker
                    formatters={{ formatWeekdayName, formatMonthCaption }}
                    mode="range"
                    captionLayout="dropdown-buttons"
                    showOutsideDays
                    weekStartsOn={1}
                    defaultMonth={defaultMonth}
                    fromYear={2022}
                    toYear={2030}
                    selected={selected}
                    onSelect={(date) => {
                      return onChange({ from: date?.from ? toUtc(date.from) : undefined, to: date?.to ? toUtc(date.to) : undefined });
                    }}
                  />
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
      <div className="mt-2 grid grid-cols-1 gap-1">
        {selectedCreationDate?.from && <span className="rounded-xl bg-purple-100 px-1 text-center font-medium text-purple-800">Date sélectionnée</span>}
      </div>
    </div>
  );
}

import { Transition, Popover } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import DatePicker from "../../../../../../components/ui/forms/DatePicker";
import { HiChevronDown } from "react-icons/hi";
import dayjs from "dayjs";

export default function CustomFilter({ setFromDate, setToDate, notesPhase, setNotesPhase }) {
  const [selectedPeriod, setSelectedPeriod] = React.useState("30"); //15, 30, 7, lastmonth, custom
  const [dateRange, setDateRange] = React.useState({ from: minusDate(new Date(), 30), to: formatDate(new Date()) });

  useEffect(() => {
    setFromDate(dateRange.from);
    setToDate(dateRange.to);
  }, [dateRange]);

  return (
    <Popover className="relative">
      <Popover.Button className="inline-flex items-center gap-x-1 text-sm font-bold text-gray-500 outline-none">
        <span>Filtrer (2)</span>
        <HiChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1">
        <Popover.Panel className="absolute right-0 z-10 mt-2 flex w-screen max-w-min">
          <div className="w-60 shrink rounded-lg bg-white pt-3 pb-1 text-sm leading-6 shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="flex flex-col">
              <span className="mb-1 px-4 text-sm text-gray-500">Phase</span>
              <div className="flex cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-gray-50" onClick={() => setNotesPhase("all")}>
                <input
                  id="candidates"
                  aria-describedby="candidates-description"
                  name="candidates"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer"
                  readOnly
                  checked={notesPhase === "all"}
                />
                <span className="text-sm font-normal leading-5 text-gray-700">Tous</span>
              </div>
              <div className="flex cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-gray-50" onClick={() => setNotesPhase("inscription")}>
                <input
                  id="candidates"
                  aria-describedby="candidates-description"
                  name="candidates"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer"
                  readOnly
                  checked={notesPhase === "inscription"}
                />
                <span className="text-sm font-normal leading-5 text-gray-700">Inscription</span>
              </div>
              <div className="flex cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-gray-50" onClick={() => setNotesPhase("sejour")}>
                <input
                  id="candidates"
                  aria-describedby="candidates-description"
                  name="candidates"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer"
                  readOnly
                  checked={notesPhase === "sejour"}
                />
                <span className="text-sm font-normal leading-5 text-gray-700">Séjour</span>
              </div>
              <div className="flex cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-gray-50" onClick={() => setNotesPhase("engagement")}>
                <input
                  id="candidates"
                  aria-describedby="candidates-description"
                  name="candidates"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer"
                  readOnly
                  checked={notesPhase === "engagement"}
                />
                <span className="text-sm font-normal leading-5 text-gray-700">Engagement</span>
              </div>
              <hr className="my-2 text-gray-100" />
              <span className="mb-1 px-4 text-sm text-gray-500">Période</span>
              <div
                className="flex cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-gray-50"
                onClick={() => {
                  setDateRange({ from: minusDate(new Date(), 7), to: formatDate(new Date()) });
                  setSelectedPeriod("7");
                }}>
                <input
                  id="candidates"
                  aria-describedby="candidates-description"
                  name="candidates"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer"
                  readOnly
                  checked={selectedPeriod === "7"}
                />
                <span className="text-sm font-normal leading-5 text-gray-700">Les 7 derniers jours</span>
              </div>
              <div
                className="flex cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-gray-50"
                onClick={() => {
                  setDateRange({ from: minusDate(new Date(), 15), to: formatDate(new Date()) });
                  setSelectedPeriod("15");
                }}>
                <input
                  id="candidates"
                  aria-describedby="candidates-description"
                  name="candidates"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer"
                  readOnly
                  checked={selectedPeriod === "15"}
                />
                <span className="text-sm font-normal leading-5 text-gray-700">Les 15 derniers jours</span>
              </div>
              <div
                className="flex cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-gray-50"
                onClick={() => {
                  setDateRange({ from: minusDate(new Date(), 30), to: formatDate(new Date()) });
                  setSelectedPeriod("30");
                }}>
                <input
                  id="candidates"
                  aria-describedby="candidates-description"
                  name="candidates"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer"
                  readOnly
                  checked={selectedPeriod === "30"}
                />
                <span className="text-sm font-normal leading-5 text-gray-700">Les 30 derniers jours</span>
              </div>

              <div
                className="flex cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-gray-50"
                onClick={() => {
                  setDateRange(getLastMonthDate());
                  setSelectedPeriod("lastmonth");
                }}>
                <input
                  id="candidates"
                  aria-describedby="candidates-description"
                  name="candidates"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer"
                  readOnly
                  checked={selectedPeriod === "lastmonth"}
                />
                <span className="text-sm font-normal leading-5 text-gray-700">Le mois dernier</span>
              </div>
              <DatePickerPopOver selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} setDateRange={setDateRange} dateRange={dateRange} />
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}

const DatePickerPopOver = ({ selectedPeriod, setSelectedPeriod, dateRange, setDateRange }) => {
  const [range, setRange] = useState(
    selectedPeriod === "custom"
      ? {
          from: new Date(dateRange.from),
          to: new Date(dateRange.to),
        }
      : { from: undefined, to: undefined },
  );

  useEffect(() => {
    if (range?.from && range?.to) {
      range.from.setMinutes(range.from.getMinutes() - range.from.getTimezoneOffset());
      range.to.setMinutes(range.to.getMinutes() - range.to.getTimezoneOffset());
      setDateRange({
        from: formatDate(range.from),
        to: formatDate(range.to),
      });
      setSelectedPeriod("custom");
    } else {
      setDateRange({ from: minusDate(new Date(), 30), to: formatDate(new Date()) });
      setSelectedPeriod("30");
    }
  }, [range]);

  return (
    <Popover className="relative">
      <Popover.Button className="flex w-full cursor-pointer items-center gap-3 px-4 py-1.5 outline-none hover:bg-gray-50">
        <input
          id="candidates"
          aria-describedby="candidates-description"
          name="candidates"
          type="checkbox"
          className="h-4 w-4 cursor-pointer"
          readOnly
          checked={selectedPeriod === "custom"}
        />
        {range?.from && range?.to ? (
          <span className="text-left text-sm font-bold leading-5 text-gray-700">
            Du {dayjs(range?.from).locale("fr").format("DD/MM/YYYY")} au {dayjs(range?.to).locale("fr").format("DD/MM/YYYY")}
          </span>
        ) : (
          <span className="text-sm font-normal leading-5 text-gray-700">Une date spécifique</span>
        )}
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1">
        <Popover.Panel className="absolute right-0 z-10 mt-2 flex w-screen max-w-min">
          <div className="flex flex-auto rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/5 ">
            <DatePicker
              mode="range"
              fromYear={2022}
              toYear={2023}
              value={range}
              onChange={(range) => {
                setRange({
                  from: range?.from,
                  to: range?.to,
                });
              }}
            />
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

const minusDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return formatDate(result);
};

const getLastMonthDate = () => {
  const today = new Date();
  const lastMonth = today.getMonth() - 1;
  const lastMonthFirstDate = new Date(today.getFullYear(), lastMonth, 1);
  lastMonthFirstDate.setDate(lastMonthFirstDate.getDate() + 1);
  const lastMonthLastDate = new Date(today.getFullYear(), lastMonth + 1, 1);
  return { from: formatDate(lastMonthFirstDate), to: formatDate(lastMonthLastDate) };
};

const formatDate = (date) => {
  const result = new Date(date);
  return result.toISOString().split("T")[0];
};

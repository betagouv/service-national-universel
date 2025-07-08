import { Popover, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { HiChevronDown } from "react-icons/hi";
import { translateRoleBDC } from "../../utils";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import dayjs from "dayjs";

import { useSelector } from "react-redux";
import API from "../../services/api";
import { TH } from "../../components/Table";

export default function Shortcut() {
  const [searches, setSearches] = useState([]);
  const [filter, setFilter] = useState({ contactGroup: [], beginningDate: null, endingDate: null });
  const { user } = useSelector((state) => state.Auth);

  const update = async (input) => {
    try {
      const body = {
        q: input || undefined,
        beginningDate: filter.beginningDate || undefined,
        endingDate: filter.endingDate || undefined,
        contactGroup: filter.contactGroup,
      };
      const { ok, data } = await API.post({ path: "/kb-search", body });
      if (ok) setSearches(data);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const exportData = async () => {
    try {
      const fomatedData = searches.map((search) => {
        return {
          "Date de la recherche": dayjs(search.createdAt).format("DD/MM/YYYY HH:mm"),
          Rôle: translateRoleBDC[search.role],
          Recherche: search.search,
          Résultats: search.resultsNumber,
        };
      });
      const sheet = {
        name: "Recherches",
        data: fomatedData,
      };

      const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      const fileExtension = ".xlsx";

      const wb = XLSX.utils.book_new();
      let ws = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const resultData = new Blob([excelBuffer], { type: fileType });
      FileSaver.saveAs(resultData, `Recherches_bcd_${dayjs().format("YYYY-MM-DD_HH[h]mm[m]ss[s]")}` + fileExtension);
    } catch (e) {
      console.log(e);
      toast.error("Erreur !");
    }
  };

  useEffect(() => {
    update();
  }, [filter]);

  return (
    <section className="max-w-[95%]">
      <Header user={user} />
      <div className="mb-2 flex items-start justify-between gap-3">
        <DropdownContactGroup name="Rôles" selectedContactGroup={filter.contactGroup} setSelectedContactGroup={(contactGroup) => setFilter({ ...filter, contactGroup })} />
        <span className="mt-2 text-gray-500 ">Date de début : </span>
        <input
          type="date"
          className="w-[200px] rounded-md border border-gray-300 bg-white pl-4  pr-3 text-gray-500"
          onChange={(e) => setFilter({ ...filter, beginningDate: e.target.value })}
        />
        <span className="mt-2 text-gray-500">Date de fin : </span>
        <input
          type="date"
          className="w-[200px] rounded-md border border-gray-300 bg-white pl-4  pr-3 text-gray-500"
          onChange={(e) => setFilter({ ...filter, endingDate: e.target.value })}
        />
      </div>
      <div className="mb-4 flex justify-between gap-3 ">
        <SearchBar update={update} />
        <button className="rounded bg-snu-purple-600 px-4 font-bold text-white hover:bg-snu-purple-800" onClick={exportData}>
          Exporter
        </button>
      </div>
      <Table searches={searches} user={user} />
    </section>
  );
}

const DropdownContactGroup = ({ name, setSelectedContactGroup, selectedContactGroup }) => {
  const handleChangeState = (role, value) => {
    if (value) return setSelectedContactGroup([...new Set([...selectedContactGroup, role])]);
    return setSelectedContactGroup(selectedContactGroup.filter((item) => item !== role));
  };

  const Checkbox = ({ name, state, setState }) => {
    return (
      <label className="flex items-center justify-between py-2 pl-4 pr-3 transition-colors hover:bg-gray-50">
        <span className="text-sm font-medium text-gray-700">{name}</span>
        <input type="checkbox" checked={state} onChange={(e) => setState(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
      </label>
    );
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
            {Object.keys(translateRoleBDC).map((role) => (
              <Checkbox key={role} name={translateRoleBDC[role]} state={selectedContactGroup.includes(role)} setState={(v) => handleChangeState(role, v)} />
            ))}
          </Popover.Panel>
        </Transition>
      </Popover>
      <div className=" mb-2 grid grid-cols-1 gap-1">
        {selectedContactGroup.map((c) => (
          <span key={c} className=" mt-1 rounded-xl bg-purple-100 px-1 text-center font-medium text-purple-800">
            {translateRoleBDC[c]}
          </span>
        ))}
      </div>
    </div>
  );
};

const Header = () => {
  return (
    <div className="mb-[38px] max-w-full">
      <div className="mb-2 flex items-center justify-between pl-[22px]">
        <div>
          <span className="text-sm font-medium uppercase text-gray-500">Base de connaissance</span>
          <h4 className="mt-1.5 text-3xl font-bold text-black-dark">Historique des recherches</h4>
        </div>
      </div>
      <p className="max-w-screen-md pl-[22px] text-sm text-gray-500"></p>
    </div>
  );
};

const SearchBar = ({ update }) => {
  const [input, setInput] = useState("");

  return (
    <div className="flex h-[38px] w-full divide-x divide-gray-300 overflow-hidden rounded-md border border-gray-300">
      <input
        onClick={() => {
          setInput("");
        }}
        onChange={(e) => {
          setInput(e.target.value);
          update(e.target.value);
        }}
        value={input}
        type="text"
        className="w-full flex-1 border-0 text-sm text-gray-600 placeholder:text-[#979797] focus:border-transparent"
        placeholder="Entrez votre recherche ..."
      />
    </div>
  );
};
const Table = ({ searches }) => {
  return (
    <Fragment>
      <div className="mb-28 max-w-full rounded-lg bg-white shadow">
        <div className={` grid  grid-cols-[140px_1fr_120px_170px] rounded-t-lg border-b border-gray-200  bg-gray-50 `}>
          <TH text="Role" />

          <TH text="Recherche" />
          <TH text="Nombre de résultats" className=" mx-1 flex-none px-0" />

          <TH text="Date" className=" mx-1 flex-none px-0" />
        </div>

        <div className="flex flex-col">
          {searches.map((search, index) => (
            <div className={`grid  grid-cols-[140px_1fr_120px_170px] items-center last:rounded-b-lg odd:bg-white even:bg-gray-50`} key={index}>
              <p className="flex-1 break-all py-4 pl-4 text-sm text-gray-900">{translateRoleBDC[search.role]}</p>

              <p className="flex-[2] overflow-hidden px-6 py-4 text-sm text-gray-900">{search.search}</p>
              <p className="flex-1 break-all py-4  text-sm text-gray-900">{search.resultsNumber}</p>
              <p className="flex-1 break-all py-4  text-sm text-gray-900">
                {new Date(search.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
};

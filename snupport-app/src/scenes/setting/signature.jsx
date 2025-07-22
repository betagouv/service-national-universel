import { Menu, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { HiDotsVertical } from "react-icons/hi";
import DropdownButton from "../../components/DropdownButton";
import { classNames, translateRole, filterObjectByKeys } from "../../utils";

import { HiPlus, HiX } from "react-icons/hi";
import { useSelector } from "react-redux";
import TextEditor from "../../components/TextEditor";
import API from "../../services/api";
import Modal from "./components/Modal";
import { TH } from "../../components/Table";

export default function Shortcut() {
  const [shortcuts, setShortcuts] = useState([]);
  const [filter] = useState({ contactGroup: [] });
  const { user } = useSelector((state) => state.Auth);

  const update = async (input) => {
    try {
      const body = filterObjectByKeys({ q: input, contactGroup: filter.contactGroup, isSignature: true }, ["q", "contactGroup", "isSignature"], { dropEmptyValue: true });
      const { ok, data } = await API.post({ path: "/shortcut/search", body });
      if (ok) setShortcuts(data);
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    update();
  }, [filter]);

  const createShortcut = async (shortcut) => {
    try {
      console.log(shortcut);
      const { ok } = await API.post({ path: "/shortcut", body: { ...shortcut, isSignature: true } });
      if (ok) {
        await update();
        toast.success("Le shortcut a été créé");
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const updateShortcut = async (shortcut) => {
    try {
      const body = filterObjectByKeys(shortcut, ["content", "dest", "keyword", "name", "text", "status", "userVisibility"]);
      const { ok } = await API.patch({ path: `/shortcut/${shortcut._id}`, body });
      if (ok) {
        await update();
        toast.success("Le shortcut a été modifié");
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const deleteShortcut = async (shortcuts) => {
    try {
      const { ok } = await API.delete({ path: `/shortcut/${shortcuts._id}` });
      if (ok) {
        await update();
        toast.success("Le shortcut a été supprimé");
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <section className="max-w-[95%]">
      <Header createShortcut={createShortcut} user={user} />
      <Table shortcuts={shortcuts} deleteShortcut={deleteShortcut} updateShortcut={updateShortcut} createShortcut={createShortcut} user={user} />
    </section>
  );
}

const FilterDropdown = ({ icon, name, buttonClass, children, onClick }) => {
  return (
    <Menu as="div" className="relative inline-block transition-all">
      {({ open }) => (
        <>
          <Menu.Button className={` text-gray-400 ${buttonClass}`}>
            <span className="sr-only">Open options</span>
            <span className="text-xl" onClick={onClick}>
              {icon}
            </span>
            <span className={classNames(open ? "text-gray-700" : "text-gray-400", "text-sm font-medium transition-colors")}>{name}</span>
          </Menu.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 flex w-56 origin-top-right flex-col rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {children}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

const Header = ({ createShortcut, user }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-[38px] max-w-full">
      <div className="mb-2 flex items-center justify-between pl-[22px]">
        <div>
          <span className="text-sm font-medium uppercase text-gray-500">Tickets</span>
          <h4 className="mt-1.5 text-3xl font-bold text-black-dark">Signatures</h4>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-[38px] rounded-md bg-accent-color px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Nouveau
        </button>
      </div>

      <p className="max-w-screen-md pl-[22px] text-sm text-gray-500">
        Les signatures sont des blocs de texte pré-enregistrés permettant d'ajouter automatiquement une signature à vos tickets selon le rôle du destinataire du ticket.
      </p>
      <ModalCreation open={open} setOpen={setOpen} createShortcut={createShortcut} user={user} />
    </div>
  );
};

const Table = ({ shortcuts, updateShortcut, deleteShortcut, user }) => {
  const [selectedShortcut, setSelectedShortcut] = useState(undefined);
  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      <div className="mb-28 max-w-full rounded-lg bg-white shadow">
        <div className={` grid  rounded-t-lg border-b border-gray-200 bg-gray-50 ${user.role === "AGENT" ? "grid-cols-[180px_1fr_160px_70px]" : "grid-cols-[200px_1fr]"}`}>
          <TH text="Module" />

          <TH text="Contenu" />
          {user.role === "AGENT" && (
            <>
              <TH text="Destinataire" className=" mx-1 flex-none px-0" />
            </>
          )}
        </div>

        <div className="flex flex-col">
          {shortcuts.map((shortcut, index) => (
            <div
              className={`grid  items-center last:rounded-b-lg odd:bg-white even:bg-gray-50 ${
                user.role === "AGENT" ? "grid-cols-[180px_1fr_160px_70px]" : "grid-cols-[200px_1fr]"
              }`}
              key={index}
            >
              <p className="flex-1 break-all py-4 pl-4 text-sm text-gray-900">{shortcut.name}</p>

              <p className="flex-[2] overflow-hidden px-6 py-4 text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: shortcut.text }}></p>

              {user.role === "AGENT" && (
                <>
                  <div>
                    {shortcut.dest?.map((dest, index) => (
                      <p key={index} className="flex-1 break-all text-sm text-gray-900">
                        {translateRole[dest]}
                      </p>
                    ))}
                  </div>
                  <div className="flex flex-none px-1 pl-2  ">
                    <div className="text-sm font-medium text-accent-color transition-colors hover:text-indigo-500">
                      <FilterDropdown
                        name=""
                        icon={<HiDotsVertical />}
                        onClick={() => {
                          setSelectedShortcut(shortcut);
                        }}
                      >
                        <DropdownButton name="Éditer" handleClick={() => setOpen(true)} />
                      </FilterDropdown>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <ModalModification open={open} setOpen={setOpen} selectedShortcut={selectedShortcut} updateShortcut={updateShortcut} deleteShortcut={deleteShortcut} />
    </Fragment>
  );
};

const defaultAttributes = [{ id: 0, name: "" }];

const ModalCreation = ({ open, setOpen, createShortcut, user }) => {
  const [name, setName] = useState("");
  const [completeName, setCompleteName] = useState("");
  const [htmlText, setHtmlText] = useState("");
  const [department, setDepartment] = useState(user.departments[0]);
  const [keywords, setKeywords] = useState(defaultAttributes);
  const [dest, setDest] = useState([]);
  const [slateContent, setSlateContent] = useState();

  useEffect(() => {
    let t = name;
    const keywordNames = keywords.map((keyword) => keyword.name);
    if (keywordNames.length > 0) {
      t += `(${keywordNames.join(";")})`;
    }
    setCompleteName(t);
  }, [keywords, name]);

  return (
    <Modal open={open} setOpen={setOpen} user={user}>
      <h5 className="mb-[36px] text-center text-2xl font-bold text-gray-900">Edition d’un module de texte</h5>
      <div className="mb-[34px]">
        <label className="mb-1 inline-block text-sm font-medium text-gray-700">Nom du module*</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-gray-300 bg-white py-2.5 px-3.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
          placeholder="Nom du module"
        />
      </div>
      <div className="mb-5">
        <label className="mb-1 inline-block text-sm font-medium text-gray-700">Mots clé*</label>
        {keywords.map((keyword) => (
          <Keyword
            key={keyword.id}
            onChange={(e) => {
              setKeywords((prev) => prev.map((elem) => (elem.id === e.id ? e : elem)));
            }}
            onDelete={() => setKeywords((prev) => prev.filter((elem) => elem.id !== keyword.id))}
            name={keyword.name}
            id={keyword.id}
          />
        ))}
        <div className="mt-2 mb-5 flex items-center gap-2 ">
          <button className="flex items-center justify-center gap-1 text-sm hover:underline" onClick={() => setKeywords((prev) => [...prev, { name: "", id: Date.now() }])}>
            <HiPlus /> Ajouter un mot clé.
          </button>
        </div>
        <label className="mb-1 inline-block text-sm font-medium text-gray-700">Destinataires*</label>
        <div className="grid grid-cols-4">
          {Object.entries(translateRole).map(([englishRole, frenchRole]) => (
            <div key={englishRole} className="text-sm text-gray-700">
              <input
                id={frenchRole}
                type="checkbox"
                className="text-royalblue-600 focus:border-royalblue-300 focus:ring-royalblue-200 mr-1 rounded border-gray-300 shadow-sm focus:ring focus:ring-opacity-50 focus:ring-offset-0"
                onClick={() => {
                  const newDest = dest.includes(englishRole) ? dest.filter((r) => r !== englishRole) : [...dest, englishRole];
                  setDest(newDest);
                }}
              />
              <label htmlFor={frenchRole}>{frenchRole}</label>
            </div>
          ))}
        </div>
        {user.role === "REFERENT_DEPARTMENT" && (
          <div className="mb-1 inline-block text-sm font-medium text-gray-700">
            <label>Département</label>
            <select
              type="text"
              placeholder="Département"
              className="w-full flex-1 rounded border border-gray-300 bg-white py-2.5 px-3.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
              onChange={(e) => setDepartment(e.target.value)}
            >
              {user.departments.map((department, index) => (
                <option key={index} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mb-9">
        <label className="mb-1 inline-block text-sm font-medium text-gray-700">Contenu*</label>
        <TextEditor htmlText={htmlText} setHtmlText={setHtmlText} slateContent={slateContent} setSlateContent={setSlateContent} />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-[38px] flex-1 rounded-md border border-gray-300 px-4 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={() => {
            let shortcut = { name: name, text: htmlText, content: slateContent, dest: dest, isSignature: true };
            if (user.role === "REFERENT_DEPARTMENT") {
              shortcut.userDepartment = department;
            }
            createShortcut(shortcut);
            // console.log("111", shortcut);
            setOpen(false);
          }}
          className="h-[38px] flex-1 rounded-md bg-accent-color  px-4 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Enregistrer
        </button>
      </div>
    </Modal>
  );
};

const ModalModification = ({ open, setOpen, selectedShortcut, updateShortcut, deleteShortcut }) => {
  // const [enabled, setEnabled] = useState(false);
  const reg = /\(.*\)/i;
  const [name, setName] = useState("");
  const [htmlText, setHtmlText] = useState("");
  const [dest, setDest] = useState([]);
  const [slateContent, setSlateContent] = useState();

  useEffect(() => {
    setName(selectedShortcut?.name.replace(reg, ""));
    setHtmlText(selectedShortcut?.text);
    setDest(selectedShortcut?.dest || []);
  }, [JSON.stringify(selectedShortcut)]);

  return (
    <Modal open={open} setOpen={setOpen}>
      <h5 className="mb-[36px] text-center text-2xl font-bold text-gray-900">Edition d’un module de texte</h5>
      <div className="mb-[34px]">
        <label className="mb-1 inline-block text-sm font-medium text-gray-700">Nom du module*</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-gray-300 bg-white py-2.5 px-3.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
          placeholder="Nom du module"
        />
      </div>
      <div className="mb-9">
        <label className="mb-1 inline-block text-sm font-medium text-gray-700">Contenu*</label>
        <TextEditor htmlText={htmlText} setHtmlText={setHtmlText} draftMessageHtml={selectedShortcut?.text} slateContent={slateContent} setSlateContent={setSlateContent} />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            deleteShortcut(selectedShortcut);
            setOpen(false);
          }}
          className="h-[38px] flex-1 rounded-md border border-custom-red px-4 text-sm font-medium text-custom-red transition-colors hover:bg-red-50"
        >
          Supprimer
        </button>
        <button
          type="button"
          onClick={() => {
            updateShortcut({ _id: selectedShortcut._id, name, text: htmlText, content: slateContent, dest: dest });
            setOpen(false);
          }}
          className="h-[38px] flex-1 rounded-md bg-accent-color  px-4 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Enregistrer
        </button>
      </div>
    </Modal>
  );
};

const Keyword = ({ name: defaultName, onChange, onDelete, id }) => {
  const [name, setName] = useState(defaultName);
  useEffect(() => {
    name?.length && onChange({ name, id });
  }, [name]);

  return (
    <div className="my-3 flex flex-col gap-2 sm:mb-0 sm:flex-row sm:items-end">
      <div className="flex flex-1 flex-row gap-2">
        <input
          defaultValue={name}
          type="text"
          className="h-10 flex-1 rounded-lg border-gray-200 text-sm text-gray-800 placeholder:text-gray-500 focus:border-gray-300 focus:ring-0"
          placeholder="Nom"
          onChange={(e) => setName(e.target.value)}
        />

        <button className="flex h-10 flex-none items-center justify-center text-gray-800 transition-colors hover:text-red-600" onClick={onDelete}>
          <HiX />
        </button>
      </div>
    </div>
  );
};

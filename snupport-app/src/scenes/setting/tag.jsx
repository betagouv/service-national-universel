import React, { Fragment, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { HiSelector } from "react-icons/hi";
import { useSelector } from "react-redux";
import API from "../../services/api";
import { filterObjectByKeys } from "../../utils";

import Modal from "./components/Modal";
import { TH } from "../../components/Table";

const SearchBar = ({ update }) => {
  const [input, setInput] = useState("");

  return (
    <div className=" flex h-[38px] w-full min-w-[300px]  divide-x divide-gray-300 overflow-hidden rounded-md border border-gray-300">
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

export default function Label() {
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const { user } = useSelector((state) => state.Auth);

  useEffect(() => {
    update();
  }, []);

  const update = async (q) => {
    try {
      const { data } = await API.get({ path: `/tag/search`, query: { q: q || undefined } });
      await getAggregations(data);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const getAggregations = async (tags) => {
    try {
      const { data } = await API.post({ path: "ticket/stats/tags", body: { period: 1000 } });
      setTags(
        tags.map((tag) => {
          const t = data.find((agg) => agg.key === tag._id);
          return { ...tag, count: t?.doc_count || 0 };
        })
      );
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleSort = () => {
    if (tags[0].count > tags[tags.length - 1].count) {
      setTags((previous) => [...previous.sort((a, b) => (a.count > b.count ? 1 : -1))]);
    } else {
      setTags((previous) => [...previous.sort((a, b) => (a.count < b.count ? 1 : -1))]);
    }
  };

  const createTag = async (tag) => {
    try {
      const { ok } = await API.post({ path: `/tag`, body: tag });
      if (ok) await update();
      toast.success("Etiquette créée");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const deleteTag = async (tag) => {
    try {
      const { ok } = await API.put({ path: `/tag/soft-delete/${tag._id}` });
      if (ok) await update();
      toast.success("Etiquette supprimée");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const updateTag = async (tag) => {
    try {
      const body = filterObjectByKeys(tag, ["name", "userVisibility"]);
      const { ok } = await API.patch({ path: `/tag/${tag._id}`, body });
      if (ok) await update();
      toast.success("Etiquette modifiée");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const userVisibilityTranslations = {
    ALL: "National",
    AGENT: "Agent",
    OLD: "Personne",
  };

  const userVisibilityClasses = {
    ALL: "bg-gradient-to-r from-blue-700 via-white to-red-500",
    AGENT: "bg-gray-200",
    OLD: "bg-red-100",
  };

  return (
    <Fragment>
      <div className="mb-[38px] flex items-end justify-between pl-[22px]">
        <ModalCreate open={createModal} setOpen={setCreateModal} handleConfirm={(v) => createTag({ name: v })} />
        <div>
          <span className="text-sm font-medium uppercase text-gray-500">TICKETS</span>
          <h4 className="mt-1.5 text-3xl font-bold text-black-dark">Etiquettes</h4>
        </div>
        <div className="flex  gap-4">
          <SearchBar update={update} />
          {user.role === "AGENT" && (
            <button
              onClick={() => setCreateModal(true)}
              type="button"
              className="h-[38px] rounded-md bg-accent-color px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Nouveau
            </button>
          )}
        </div>
      </div>
      <Fragment>
        <ModalUpdate
          open={!!selectedTag}
          setOpen={() => {
            setSelectedTag(null);
          }}
          handleDelete={(tag) => {
            deleteTag(tag);
            setSelectedTag(null);
          }}
          handleConfirm={(tag) => {
            updateTag(tag);
            setSelectedTag(null);
          }}
          tag={selectedTag}
        />
        <div className="mb-28 max-w-full rounded-lg bg-white shadow">
          <div className={` grid grid-cols-[1fr_\\200px] rounded-t-lg border-b border-gray-200 bg-gray-50 ${user.role === "AGENT" && "grid-cols-[1fr_120px_200px_80px_80px]"}`}>
            <TH text="Etiquette" />
            <TH text="Créé le" />
            <div className="flex flex-row content-center items-center">
              <TH text="Attribué" />
              <HiSelector className=" -ml-4 text-gray-700" onClick={() => handleSort()} />
            </div>
            {user.role === "AGENT" && (
              <>
                <TH text="Visibilité" className="px-0" />
                <TH text="Action" className="w-[128px] flex-none" />
              </>
            )}
          </div>
          <div className="flex flex-col justify-between">
            {tags.map((tag) => {
              return (
                <div
                  className={` grid grid-cols-[1fr_\\200px] items-center last:rounded-b-lg odd:bg-white even:bg-gray-50 ${
                    user.role === "AGENT" && "grid-cols-[1fr_120px_190px_80px_80px]"
                  }`}
                  key={tag._id}
                >
                  <div className="flex-1 px-6 py-4">
                    <span className="rounded-md bg-purple-100 py-1.5 px-2.5 text-base font-medium text-purple-800">{tag.name}</span>
                  </div>
                  <span className="flex-1 text-sm text-gray-500">
                    {new Date(tag.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <p className="flex-1 px-6 py-4 text-sm text-gray-500">{tag.count}</p>
                  {user.role === "AGENT" && (
                    <>
                      <div className={`rounded-full w-24 py-1 text-center text-xs font-semibold text-gray-900 ${userVisibilityClasses[tag.userVisibility]}`}>
                        <select
                          value={tag.userVisibility}
                          onChange={(e) => {
                            updateTag({ _id: tag._id, userVisibility: e.target.value });
                          }}
                          className="bg-transparent text-center cursor-pointer text-xs font-semibold text-gray-900 w-full h-full border-none outline-none pr-8"
                        >
                          {Object.entries(userVisibilityTranslations).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex w-[128px] flex-none items-center gap-5 px-6 py-4">
                        <button type="button" onClick={() => setSelectedTag(tag)} className="text-sm font-medium text-accent-color transition-colors hover:text-indigo-500">
                          Editer
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Fragment>
    </Fragment>
  );
}

const ModalCreate = ({ open, setOpen, handleConfirm }) => {
  const [input, setInput] = useState("");

  return (
    <Modal open={open} setOpen={setOpen}>
      <h5 className="mb-[36px] text-center text-2xl font-bold text-gray-900">Ajouter une étiquette</h5>

      <div className="mb-[34px]">
        <label className="mb-1 inline-block text-sm font-medium text-gray-700">Nom de l’étiquette*</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded border border-gray-300 bg-white py-2.5 px-3.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
          placeholder="Nom de l'étiquette"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-[38px] flex-1 rounded-md border border-gray-300 px-4 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Fermer
        </button>
        <button
          type="button"
          onClick={() => {
            handleConfirm(input);
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
const ModalUpdate = ({ open, setOpen, handleConfirm, handleDelete, tag }) => {
  const [str, setStr] = useState("");

  useEffect(() => {
    setStr(tag?.name || "");
  }, [tag]);

  return (
    <Modal open={open} setOpen={setOpen}>
      <h5 className="mb-[36px] text-center text-2xl font-bold text-gray-900">Modifier une étiquette</h5>
      <div className="mb-[34px]">
        <label className="mb-1 inline-block text-sm font-medium text-gray-700">Nom de l’étiquette*</label>
        <input
          type="text"
          value={str}
          onChange={(e) => setStr(e.target.value)}
          className="w-full rounded border border-gray-300 bg-white py-2.5 px-3.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
          placeholder="Nom de l'étiquette"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleDelete(tag)}
          className="h-[38px] flex-1 rounded-md border border-gray-300 px-4 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Supprimer
        </button>
        <button
          type="button"
          onClick={() => handleConfirm({ ...tag, name: str })}
          className="h-[38px] flex-1 rounded-md bg-accent-color  px-4 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Enregistrer
        </button>
      </div>
    </Modal>
  );
};

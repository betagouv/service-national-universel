import React, { useEffect, useState } from "react";
import { HiPlus, HiX } from "react-icons/hi";
import { toast } from "react-hot-toast";

import API from "@/services/api";

export default function CopyRecipientEditor({ copyRecipient, isVisible, setCopyRecipient, dest, setDest }) {
  const [defaultCopyRecipients, setDefaultCopyRecipients] = useState<{ _id: string; email: string }[]>([]);
  const [defaultDest, setDefaultDest] = useState<{ _id: string; email: string }[]>([]);
  const [inputDest, setInputDest] = useState("");
  const [inputCc, setInputCc] = useState("");

  useEffect(() => {
    updateCc();
  }, [inputCc]);

  useEffect(() => {
    updateDest();
  }, [inputDest]);

  async function updateCc() {
    if (!inputCc) return setDefaultCopyRecipients([]);
    const { ok, data } = await API.get({ path: `/contact/search`, query: { q: inputCc } });
    if (ok) setDefaultCopyRecipients(data);
  }

  async function updateDest() {
    if (!inputDest) return setDefaultDest([]);
    const { ok, data } = await API.get({ path: `/contact/search`, query: { q: inputDest } });
    if (ok) setDefaultDest(data);
  }

  const addCopyRecipient = async (value) => {
    try {
      setCopyRecipient([...copyRecipient, value]);
      setInputCc("");
    } catch (e) {
      toast.error("Erreur lors de l'ajout du destinataire", e);
    }
  };

  const removeCopyRecipient = async (value) => {
    try {
      setCopyRecipient(copyRecipient.filter((recipient) => recipient !== value));
    } catch (e) {
      toast.error("Erreur lors de la suppression du destinataire", e);
    }
  };

  return (
    <div className={` ${isVisible ? "" : "hidden"} mb-4 `}>
      <label className="text-xs text-gray-500">{"A"}</label>

      <div className="mt-2 mb-4 flex divide-x divide-gray-300 overflow-hidden rounded-md border border-gray-300">
        <input
          onClick={() => setInputDest("")}
          onChange={(e) => setInputDest(e.target.value)}
          value={inputDest}
          type="text"
          className="w-[200px] flex-1 border-0 text-sm text-gray-600 placeholder:text-[#979797] focus:border-transparent"
          placeholder={"A"}
        />
        <button
          className="flex h-10 w-11 flex-none items-center justify-center bg-white text-2xl text-gray-500 transition-colors hover:bg-gray-50"
          onClick={() => {
            setDest(inputDest);
            setInputDest("");
          }}
        >
          <HiPlus />
        </button>
      </div>
      <div className="relative ">
        <ul className="absolute z-10 mb-4 w-full  bg-white text-sm text-gray-600">
          {defaultDest.map((defaultD) => (
            <li
              className="z-10  cursor-pointer bg-white hover:bg-gray-50"
              key={defaultD._id}
              onClick={() => {
                setDest(defaultD.email);
                setInputDest("");
              }}
            >
              {defaultD.email}
            </li>
          ))}
        </ul>
      </div>

      {dest && (
        <div className="relative flex flex-wrap gap-2.5">
          <span className=" flex items-center gap-0.5 rounded-full bg-purple-100 py-0.5 pl-2.5 pr-1">
            <span className="text-sm font-medium text-purple-800">{dest}</span>
            <HiX onClick={() => setDest(null)} className="cursor-pointer text-base text-indigo-400" />
          </span>
        </div>
      )}
      <label className="text-xs text-gray-500">{"COPIE"}</label>

      <div className="mt-2 mb-4 flex divide-x divide-gray-300 overflow-hidden rounded-md border border-gray-300">
        <input
          onClick={() => setInputCc("")}
          onChange={(e) => setInputCc(e.target.value)}
          value={inputCc}
          type="text"
          className="w-[200px] flex-1 border-0 text-sm text-gray-600 placeholder:text-[#979797] focus:border-transparent"
          placeholder={"COPIE"}
        />
        <button
          className="flex h-10 w-11 flex-none items-center justify-center bg-white text-2xl text-gray-500 transition-colors hover:bg-gray-50"
          onClick={() => {
            setCopyRecipient([...copyRecipient, inputCc]);
            setInputCc("");
          }}
        >
          <HiPlus />
        </button>
      </div>
      <div className="relative ">
        <ul className="absolute z-10 mb-4 w-full  bg-white text-sm text-gray-600">
          {defaultCopyRecipients.map((defaultCopyRecipient) => (
            <li className="z-10  cursor-pointer bg-white hover:bg-gray-50" key={defaultCopyRecipient._id} onClick={() => addCopyRecipient(defaultCopyRecipient.email)}>
              {defaultCopyRecipient.email}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex flex-wrap gap-2.5">
        {copyRecipient.map((email, i) => (
          <span className=" flex items-center gap-0.5 rounded-full bg-purple-100 py-0.5 pl-2.5 pr-1" key={i}>
            <span className="text-sm font-medium text-purple-800">{email}</span>
            <HiX onClick={() => removeCopyRecipient(email)} className="cursor-pointer text-base text-indigo-400" />
          </span>
        ))}
      </div>
    </div>
  );
}

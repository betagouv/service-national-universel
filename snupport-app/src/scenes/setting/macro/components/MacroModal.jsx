import React, { useState } from "react";
import toast from "react-hot-toast";

import Modal from "../../components/Modal";
import Toggle from "../../components/Toggle";

import MacroAction from "./MacroAction";
import { defaultMacroAction } from "../utils";

const MacroModal = ({ open, setOpen, macro, setMacro, macroValues, onSave, onDelete, isLoading }) => {
  const [displayRequiredErrors, setDisplayRequiredErrors] = useState(false);

  const _onSave = () => {
    if (!macro?.name || !macro?.description || macro.macroAction.some(({ action, field, value }) => !action || !field || !value)) {
      setDisplayRequiredErrors(true);
      return toast.error("Veuillez remplir tous les champs");
    } else {
      setDisplayRequiredErrors(false);
      onSave(macro);
    }
  };

  const onDeleteAction = (index) => () => {
    setMacro({
      ...macro,
      macroAction: macro.macroAction.filter((_, i) => index !== i),
    });
  };

  const onAddNextAction = (index) => () => {
    setMacro({
      ...macro,
      macroAction: [...macro.macroAction.slice(0, index + 1), defaultMacroAction, ...macro.macroAction.slice(index + 1)],
    });
  };

  const updateAction = (index) => (key, value) => {
    setMacro({
      ...macro,
      macroAction: macro.macroAction.map((action, i) => {
        if (index === i) {
          const newAction = { ...action, [key]: value };
          if (key === "field") {
            newAction.value = "";
          }
          if (key === "action") {
            newAction.value = "";
            newAction.field = "";
          }
          return newAction;
        }
        return action;
      }),
    });
  };

  return (
    <Modal className="lg:max-w-[1000px]" open={open} setOpen={setOpen}>
      <div>
        <h5 className="mb-[36px] text-center text-2xl font-bold text-gray-900">{macro?._id ? "Edition d'une macro" : "Création d'une nouvelle macro"}</h5>
        {macro?.updatedBy && (
          <div className="mb-5 text-sm font-medium italic text-gray-700">
            {`Dernière mise à jour par ${macro.updatedBy?.firstName} le ${Intl.DateTimeFormat("fr-FR", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(macro.updatedAt))}`}
          </div>
        )}
        <div className="mb-7">
          <label className="mb-1 inline-block text-sm font-medium text-gray-700">Nom de la macro*</label>
          <input
            value={macro?.name}
            onChange={(e) => {
              setMacro({ ...macro, name: e.target.value });
            }}
            type="text"
            className={`w-full rounded border border-gray-300 bg-white py-2 px-3.5 pr-3 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400 ${
              displayRequiredErrors && !macro?.name && "border-[#CE0500] focus:border-[#CE0500]"
            }`}
            placeholder="Nom de la macro*"
          />
        </div>
        <div className="mb-7">
          <label className="mb-1 inline-block text-sm font-medium text-gray-700">Description*</label>
          <textarea
            value={macro?.description}
            onChange={(e) => {
              setMacro({ ...macro, description: e.target.value });
            }}
            className={`w-full rounded border border-gray-300 bg-white py-2 px-3.5 pr-3 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400 ${
              displayRequiredErrors && !macro?.description && "border-[#CE0500] focus:border-[#CE0500]"
            }`}
            placeholder="Description de la macro*"
          />
        </div>

        <div className="mb-7">
          <label className="inline-block text-sm font-medium text-gray-700">Actions*</label>
          {macro?.macroAction.map((action, index) => (
            <MacroAction
              key={action._id}
              action={action}
              onDelete={onDeleteAction(index)}
              onAddNext={onAddNextAction(index)}
              updateAction={updateAction(index)}
              macroValues={macroValues}
              displayRequiredErrors={displayRequiredErrors}
            />
          ))}
        </div>
        <div className="mb-9 flex items-center gap-2.5">
          <Toggle
            enabled={macro?.sendCurrentMessage}
            setEnabled={(sendCurrentMessage) => {
              setMacro({ ...macro, sendCurrentMessage });
            }}
          />
          <span className="text-base font-medium text-gray-700">Envoyer le message rédigé</span>
        </div>
        <div className="mb-9 flex items-center gap-2.5">
          <Toggle
            enabled={macro?.stayOnCurrentPage}
            setEnabled={(stayOnCurrentPage) => {
              setMacro({ ...macro, stayOnCurrentPage });
            }}
          />
          <span className="text-base font-medium text-gray-700">Rester sur la page</span>
        </div>
        <label className="mb-3 inline-block text-sm font-medium text-gray-700">Activation</label>
        <div className="mb-9 flex items-center gap-2.5">
          <Toggle
            enabled={macro?.isActive}
            setEnabled={(isActive) => {
              setMacro({ ...macro, isActive });
            }}
          />
          <span className="text-base font-medium text-gray-700">Macro activée</span>
        </div>

        <div className="flex gap-3">
          <button
            disabled={isLoading}
            onClick={() => {
              onDelete(macro._id);
            }}
            type="button"
            className="h-[38px] flex-1 rounded-md border border-gray-300 px-4 text-center text-sm font-medium text-custom-red transition-colors hover:bg-red-50"
          >
            Supprimer
          </button>
          <button
            disabled={isLoading}
            type="button"
            className="h-[38px] flex-1 rounded-md bg-accent-color  px-4 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            onClick={_onSave}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MacroModal;

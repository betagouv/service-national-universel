import React, { useState } from "react";
import toast from "react-hot-toast";
import TextEditor from "../../../../components/TextEditor";
import { sourceToIcon } from "../../../../utils";

import Modal from "../../components/Modal";
import TagsEditor from "../../../../components/TagEditor";
import AgentSelect from "../../../../components/AgentSelect";
import Label from "./Label";

const TemplateModal = ({ open, setOpen, template, setTemplate, onSave, isLoading }) => {
  const [displayRequiredErrors, setDisplayRequiredErrors] = useState(false);

  const _onSave = () => {
    if (!template?.name || !template?.description || !template?.message || !template?.canal) {
      setDisplayRequiredErrors(true);
      return toast.error("Veuillez remplir tous les champs");
    } else {
      setDisplayRequiredErrors(false);
      onSave(template);
    }
  };

  const setTags = (callback) => {
    setTemplate({ ...template, tags: callback(template.tags || []) });
  };

  return (
    <Modal className="lg:max-w-[1000px]" open={open} setOpen={setOpen}>
      <div>
        <h5 className="mb-[36px] text-center text-2xl font-bold text-gray-900">{template?._id ? "Edition d'un modèle de ticket" : "Création d'un nouveau modèle de ticket"}</h5>
        <div className="mb-7">
          <Label required>Nom du modèle de ticket</Label>
          <input
            value={template?.name}
            onChange={(e) => {
              setTemplate({ ...template, name: e.target.value });
            }}
            type="text"
            className={`w-full rounded border border-gray-300 bg-white py-2 px-3.5 pr-3 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400 ${
              displayRequiredErrors && !template?.name && "border-[#CE0500] focus:border-[#CE0500]"
            }`}
            placeholder="Nom du modèle de ticket*"
          />
        </div>
        <div className="mb-7">
          <Label required>Description du modèle de ticket</Label>
          <textarea
            value={template?.description}
            onChange={(e) => {
              setTemplate({ ...template, description: e.target.value });
            }}
            className={`w-full rounded border border-gray-300 bg-white py-2 px-3.5 pr-3 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400 ${
              displayRequiredErrors && !template?.description && "border-[#CE0500] focus:border-[#CE0500]"
            }`}
            placeholder="Description du modèle de ticket*"
          />
        </div>
        <hr className="mb-7" />
        <div className="mb-7">
          <Label className="font-bold">Objet du message</Label>
          <input
            value={template?.subject}
            onChange={(e) => {
              setTemplate({ ...template, subject: e.target.value });
            }}
            type="text"
            className="w-full rounded border border-gray-300 bg-white py-2 px-3.5 pr-3 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
            placeholder="Objet du message"
          />
        </div>
        <div className="mb-7">
          <Label required className="font-bold">
            Contenu du message
          </Label>
          <TextEditor
            hasError={displayRequiredErrors && !template?.message}
            draftMessageHtml={template?.message}
            setSlateContent={() => {}}
            setHtmlText={(value) => {
              setTemplate({ ...template, message: value });
            }}
          />
        </div>
        <div className="mb-7">
          <TagsEditor name="Étiquettes" labelClassName="inline-block !text-sm !text-gray-700 !font-bold" tags={template?.tags || []} setTags={setTags} />
        </div>
        <div className="mb-7 flex">
          <Label required className="w-[170px] font-bold">
            Canal de réception
          </Label>
          <div className="flex flex-1">
            <label className="w-[20%] text-sm text-gray-600">
              <input
                type="radio"
                name="canal"
                value="MAIL"
                checked={template?.canal === "MAIL"}
                className={`mr-1 h-4 rounded-xl border-gray-300 ${displayRequiredErrors && !template?.canal ? "border-[#CE0500]" : ""} text-indigo-500`}
                onChange={() => setTemplate({ ...template, canal: "MAIL" })}
              />
              {sourceToIcon.MAIL}
              <span className="ml-1">E-mail</span>
            </label>
            <label className="w-[20%] text-sm text-gray-600">
              <input
                type="radio"
                name="canal"
                value="PLATFORM"
                checked={template?.canal === "PLATFORM"}
                className={`mr-1 h-4 rounded-xl border-gray-300 ${displayRequiredErrors && !template?.canal ? "border-[#CE0500]" : ""} text-indigo-500`}
                onChange={() => setTemplate({ ...template, canal: "PLATFORM" })}
              />
              {sourceToIcon.PLATFORM}
              <span className="ml-1">Plateforme</span>
            </label>
          </div>
        </div>
        <div className="mb-11">
          <Label className="font-bold">Agent</Label>
          <AgentSelect value={template?.attributedTo} onChange={(value) => setTemplate({ ...template, attributedTo: value })} />
        </div>
        <div className="flex gap-3">
          <button
            disabled={isLoading}
            onClick={() => {
              setOpen(false);
            }}
            type="button"
            className="h-[38px] flex-1 rounded-md border border-gray-300 px-4 text-center text-sm font-medium transition-colors hover:bg-gray-50"
          >
            Annuler
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

export default TemplateModal;

import React from "react";

export default ({ templates, appliedTemplate, setAppliedTemplate, user }) => {
  return (
    <div className="w-[257px] flex-none overflow-auto border-l border-light-grey bg-gray-50 p-5">
      {user.role === "AGENT" && (
        <>
          <label className="text-[10px] font-medium uppercase text-grey-text">Utiliser un modèle de ticket</label>
          <select
            value={appliedTemplate?._id}
            className="mt-1 flex-none rounded border border-gray-300 bg-white py-2.5 px-3.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
            placeholder="Nom de l'agent"
            onChange={(e) => setAppliedTemplate(templates.find((template) => template._id === e.target.value))}
          >
            <option value="">Pas de modèle</option>
            {templates.map((template) => {
              return (
                <option key={template._id} value={template._id} label={template.name}>
                  {template.name}
                </option>
              );
            })}
          </select>
        </>
      )}
    </div>
  );
};

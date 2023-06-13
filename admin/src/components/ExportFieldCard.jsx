import React, { useState } from "react";

export default function ExportFieldCard({ category, selectedFields, setSelectedFields }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="cursor-pointer rounded-xl border-[1px] px-3 py-2.5">
      <div
        onClick={() => {
          if (!selectedFields.includes(category.id)) {
            const newValues = [...selectedFields, category.id];
            setSelectedFields(newValues);
          } else {
            const newValues = selectedFields.filter((item) => item !== category.id);
            setSelectedFields(newValues);
          }
        }}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">{category.title}</p>
          <input readOnly type="checkbox" checked={selectedFields.includes(category.id)} />
        </div>
        <div className={`text-xs text-gray-400 h-${isOpen ? "auto" : 16} overflow-hidden`}>
          {category.desc.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      </div>
      {category.desc.length > 4 && (
        <button className="text-center text-xs text-gray-500 hover:text-gray-700" onClick={() => setIsOpen(!isOpen)}>
          {!isOpen ? "Voir plus" : "Réduire"}
        </button>
      )}
    </div>
  );
}

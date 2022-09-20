import React, { useState } from "react";

export default function ExportFieldCard({ category, selectedFields, setSelectedFields }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border-2 border-gray-100 px-3 py-2 hover:shadow-ninaButton cursor-pointer">
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
        <div className="flex justify-between w-full">
          <div className="text-left text-lg w-3/4">{category.title}</div>
          <div className="h-4">
            <input type="checkbox" checked={selectedFields.includes(category.id)} />
          </div>
        </div>
        <div className={`w-full text-gray-400 text-left h-${isOpen ? "auto" : 16} overflow-hidden`}>
          {category.desc.map((e) => (
            <div key={e}>{e}</div>
          ))}
        </div>
      </div>
      {category.desc.length > 3 && (
        <button className="text-gray-500 text-center w-full hover:text-gray-800" onClick={() => setIsOpen(!isOpen)}>
          {!isOpen ? "Voir plus" : "Réduire"}
        </button>
      )}
    </div>
  );
}

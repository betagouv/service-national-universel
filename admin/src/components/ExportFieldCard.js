import React from "react";

export default function ExportFieldCard({ category, selectedFields, setSelectedFields }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="rounded-xl border-[1px] px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition">
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
        <div className={`text-gray-400 h-${isOpen ? "auto" : 16} overflow-hidden`}>
          {category.desc.map((e) => (
            <p key={e} className="text-xs">
              {e}
            </p>
          ))}
        </div>
      </div>
      {category.desc.length > 4 && (
        <button className="text-gray-500 text-xs text-center hover:text-gray-700" onClick={() => setIsOpen(!isOpen)}>
          {!isOpen ? "Voir plus" : "Réduire"}
        </button>
      )}
    </div>
  );
}

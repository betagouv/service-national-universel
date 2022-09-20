import React, { useState } from "react";
import { Field } from "formik";

export default function ExportFieldCard({ category, values, setFieldValue }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border-2 border-gray-100 px-3 py-2 hover:shadow-ninaButton cursor-pointer">
      <div
        onClick={() => {
          if (!values.checked.includes(category.id)) {
            const newValues = [...values.checked, category.id];
            setFieldValue("checked", newValues);
          } else {
            const newValues = values.checked.filter((item) => item !== category.id);
            setFieldValue("checked", newValues);
          }
        }}>
        <div className="flex justify-between w-full">
          <div className="text-left text-lg w-3/4">{category.title}</div>
          <div className="h-4">
            <Field type="checkbox" name="checked" value={category.id} />
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

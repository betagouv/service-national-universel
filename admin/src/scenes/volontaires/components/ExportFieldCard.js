import React, { useState } from "react";
import { Field } from "formik";

export default function ExportFieldCard({ field, values, setFieldValue }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div key={field.value} className="rounded-xl border-2 border-gray-100 px-3 py-2 hover:shadow-ninaButton cursor-pointer">
      <div
        onClick={() => {
          if (!values.checked.includes(field.value)) {
            const newValues = [...values.checked, field.value];
            setFieldValue("checked", newValues);
          } else {
            const newValues = values.checked.filter((item) => item !== field.value);
            setFieldValue("checked", newValues);
          }
        }}>
        <div className="flex justify-between w-full">
          <div className="text-left text-lg w-3/4">{field.title}</div>
          <div className="h-4">
            <Field type="checkbox" name="checked" value={field.value} />
          </div>
        </div>
        <div className={`w-full text-gray-400 text-left h-${isOpen ? "auto" : 16} overflow-hidden`}>
          {field.desc.map((e) => (
            <div key={e}>{e}</div>
          ))}
        </div>
      </div>
      {field.desc.length > 3 && (
        <button className="text-gray-500 text-center w-full hover:text-gray-800" onClick={() => setIsOpen(!isOpen)}>
          {!isOpen ? "Voir plus" : "Réduire"}
        </button>
      )}
    </div>
  );
}

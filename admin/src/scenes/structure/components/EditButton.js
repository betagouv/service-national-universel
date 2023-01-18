import React from "react";
import Pencil from "../../../assets/icons/Pencil";

export default function EditButton({ onClick, isEditing, setIsEditing, isLoading, onSubmit, defaultData, setData, setErrors }) {
  const style = (color) => {
    return `flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-${color}-100 text-${color}-600 bg-${color}-100 hover:border-${color}-600 disabled:opacity-50 disabled:cursor-not-allowed`;
  };

  if (isEditing)
    return (
      <div className="flex items-center gap-2">
        <button
          className={style("gray")}
          onClick={() => {
            setIsEditing(false);
            setData(defaultData);
            setErrors({});
          }}
          disabled={isLoading}>
          Annuler
        </button>
        <button className={style("blue")} onClick={onSubmit} disabled={isLoading}>
          <Pencil stroke="#2563EB" className="w-[12px] h-[12px] mr-[6px]" />
          Enregistrer les changements
        </button>
      </div>
    );

  return (
    <button
      className={style("blue")}
      onClick={() => {
        setIsEditing(true);
        onClick();
      }}
      disabled={isLoading}>
      <Pencil stroke="#2563EB" className="w-[12px] h-[12px]" />
      Modifier
    </button>
  );
}

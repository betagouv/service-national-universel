import React from "react";
import { HiOutlinePencil } from "react-icons/hi";

type Props = {
  form?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  disabled: boolean;
  reset: () => void;
};

export default function EditButton({ form, isEditing, setIsEditing, disabled, reset }: Props) {
  const style = "flex items-center gap-2 rounded-full text-xs font-medium px-3 py-2.5 border-[1px] disabled:opacity-50";

  if (isEditing)
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            reset();
          }}
          disabled={disabled}
          className={`${style} border-gray-100 text-gray-600 bg-gray-100 hover:border-gray-600`}>
          Annuler
        </button>
        <button form={form} type="submit" disabled={disabled} className={`${style} border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600`}>
          <HiOutlinePencil />
          Enregistrer les changements
        </button>
      </div>
    );

  return (
    <button type="button" onClick={() => setIsEditing(true)} disabled={disabled} className={`${style} border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600`}>
      <HiOutlinePencil />
      Modifier
    </button>
  );
}

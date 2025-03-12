import React, { useId } from "react";
import { HiOutlinePencil } from "react-icons/hi";
import ReactTooltip from "react-tooltip";

type Props = {
  form?: string;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  disabled: boolean;
  isLoading: boolean;
  onReset: () => void;
  tooltipMessage?: string;
};

export default function EditButton({
  form,
  isEditing,
  setIsEditing,
  disabled,
  isLoading,
  onReset,
  tooltipMessage = "Modification impossible",
}: Props) {
  const tooltipId = useId();
  const className =
    "flex items-center gap-2 rounded-full text-xs font-medium px-3 py-2.5 border-[1px] disabled:opacity-50";

  if (isEditing)
    return (
      <div className="flex items-center gap-2">
        <button
          type="reset"
          onClick={() => {
            setIsEditing(false);
            reset();
          }}
          disabled={isLoading}
          className={`${className} border-gray-100 text-gray-600 bg-gray-100 hover:border-gray-600`}
        >
          Annuler
        </button>
        <button
          form={form}
          type="submit"
          disabled={isLoading}
          className={`${className} border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600`}
        >
          <HiOutlinePencil />
          Enregistrer les changements
        </button>
      </div>
    );

  return (
    <>
      {disabled && (
        <ReactTooltip
          id={tooltipId}
          className="bg-white shadow-xl"
          arrowColor="white"
          disable={false}
        >
          <p className="text-gray-800">{tooltipMessage}</p>
        </ReactTooltip>
      )}
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        disabled={disabled}
        data-tip
        data-for={tooltipId}
        className={`${className} border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600 disabled:hover:border-blue-100`}
      >
        <HiOutlinePencil />
        Modifier
      </button>
    </>
  );
}

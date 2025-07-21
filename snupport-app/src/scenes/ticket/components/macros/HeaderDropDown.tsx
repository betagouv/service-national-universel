import React from "react";
import { useMacroSelection } from "./useMacro";
import { HiOutlineClipboardList } from "react-icons/hi";
import ReactTooltip from "react-tooltip";
import SearchableDropDown from "@/components/Select/SearchableDropDown";
import Loader from "@/components/Loader";

interface MacroDropdownProps {
  selectedTicket: string[];
  onClose?: () => void;
  onRefresh?: () => Promise<void>;
  handleAddMessage?: () => Promise<boolean>;
  className?: string;
}

export default function HeaderMacroDropdown(props: MacroDropdownProps) {
  const { macroOptions, isPending, isError, handleSelectMacro, canSelectMacro } = useMacroSelection(props);

  if (isPending) return <Loader />;
  if (isError) return <p>Erreur lors de la récupération des macros</p>;

  return (
    <div data-tip="Sélectionnez au moins un ticket" data-for="macro-tooltip" className="inline-block">
      <ReactTooltip
        id="macro-tooltip"
        disable={canSelectMacro}
        type="dark"
        place="top"
        effect="solid"
        className="custom-tooltip-radius !shadow-sm !text-white !text-xs !font-medium"
      />
      <SearchableDropDown
        options={macroOptions}
        value={null}
        onChange={(option) => handleSelectMacro(option.value, false)}
        placeholder="Macro"
        isSearchable={true}
        closeMenuOnSelect={true}
        noOptionsMessage="Aucune macro trouvée"
        className={props.className}
        size="md"
        badge={<HiOutlineClipboardList size={20} className="text-gray-500 ml-2" />}
        badgePosition="left"
        disabled={!canSelectMacro}
      />
    </div>
  );
}

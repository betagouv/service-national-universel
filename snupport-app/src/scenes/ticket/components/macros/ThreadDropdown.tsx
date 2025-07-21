import React, { useEffect } from "react";
import { useMacroSelection } from "./useMacro";
import { HiMagnifyingGlass } from "react-icons/hi2";
import SearchableDropDown from "@/components/Select/SearchableDropDown";
import Loader from "@/components/Loader";

interface MacroDropdownProps {
  selectedTicket: string[];
  onClose?: () => void;
  onRefresh?: () => Promise<void>;
  handleAddMessage?: () => Promise<boolean>;
  className?: string;
}

export default function ThreadMacroDropdown(props: MacroDropdownProps) {
  const { macroOptions, isPending, isError, handleSelectMacro, canSelectMacro } = useMacroSelection(props);

  if (isPending) return <Loader />;
  if (isError) return <p>Erreur lors de la récupération des macros</p>;

  return (
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
      disabled={!canSelectMacro}
      isOpen={true}
      menuPlacement="top"
      badge={<HiMagnifyingGlass size={20} className="text-gray-500 ml-2" />}
      badgePosition="left"
    />
  );
}

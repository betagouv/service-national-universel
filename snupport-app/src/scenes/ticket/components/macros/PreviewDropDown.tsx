import React from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useMacroSelection } from "./useMacro";
import SearchableDropDown from "@/components/Select/SearchableDropDown";
import Loader from "@/components/Loader";

interface MacroDropdownProps {
  selectedTicket: string[];
  onClose: (id: string) => void;
  onRefresh?: () => Promise<void>;
  handleAddMessage?: () => Promise<boolean>;
  className?: string;
  filtered?: boolean;
}

export default function PreviewMacroDropdown(props: MacroDropdownProps) {
  const { macroOptions, isPending, isError, canSelectMacro } = useMacroSelection(props);

  if (isPending) return <Loader />;
  if (isError) return <p>Erreur lors de la récupération des macros</p>;

  return (
    <SearchableDropDown
      options={macroOptions}
      onChange={(option) => props.onClose(option.value)}
      value={null}
      placeholder="Prévisualiser Macro"
      isSearchable={true}
      closeMenuOnSelect={true}
      noOptionsMessage="Aucune macro trouvée"
      className={props.className}
      size="md"
      disabled={!canSelectMacro}
      menuPlacement="top"
      badge={<HiMagnifyingGlass size={20} className="text-gray-500 ml-2" />}
      badgePosition="left"
    />
  );
}

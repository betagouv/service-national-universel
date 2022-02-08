import { Popover } from "@headlessui/react";
import { useState } from "react";
import ResizablePanel from "../ResizablePanel";
import TicketsFolder from "./TicketsFolder";

const TicketsFolders = ({ onFolderClick }) => {
  return (
    <ResizablePanel className={`flex-grow-0 flex-shrink-0 border-l-2 z-10 overflow-hidden flex w-80`} position="left" name="admin-tickets-left-panel">
      <div className="relative flex flex-col overflow-hidden w-full p-3">
        <aside className="rounded-lg w-full h-full bg-white drop-shadow-md p-3">
          <TicketsFolder onClick={onFolderClick} name="Boîte de réception" number="5" active />
          <TicketsFolder onClick={onFolderClick} name="Corbeille" number="5" />
          <div className="h-3 flex-shrink-0" />
          <Section />
        </aside>
      </div>
    </ResizablePanel>
  );
};

const Section = ({ onFolderClick }) => {
  const [showMoreButton, setShowMoreButton] = useState(false);

  return (
    <details className="w-full">
      <summary className="font-bold justify-between w-full relative" onMouseEnter={() => setShowMoreButton(true)} onMouseLeave={() => setShowMoreButton(false)}>
        <span className="inline-block mr-auto">Phase 1</span>
        <SectionButton setShowMoreButton={setShowMoreButton} showMoreButton={showMoreButton} />
      </summary>
      <TicketsFolder onClick={onFolderClick} name="Mon premier groupe" number="5" />
      <TicketsFolder onClick={onFolderClick} name="Mon deuxième groupe" number="5" />
    </details>
  );
};

const SectionButton = ({ setShowMoreButton, showMoreButton }) => (
  <Popover className={`${showMoreButton ? "visible" : "invisible pointer-events-none"} inline-block absolute right-2 cursor-pointer`} onMouseEnter={() => setShowMoreButton(true)}>
    <Popover.Button className=" bg-white border-none rounded-none shadow-none p-0 text-gray-300 inline-block cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-300 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
        />
      </svg>
    </Popover.Button>

    <Popover.Panel className="absolute z-50 right-0 -left-56 top-6" onMouseLeave={() => setShowMoreButton(false)}>
      <div className="flex flex-col gap-4 px-4 py-3 bg-white border border-gray-300 rounded-md">
        <span onClick={() => null} className="block text-sm font-medium text-gray-700 cursor-pointer">
          Ajouter un dossier
        </span>
        <span onClick={() => null} className="block text-sm font-medium text-gray-700 cursor-pointer">
          Ajouter un dossier intelligent
        </span>
        <span onClick={() => null} className="block text-sm font-medium text-gray-700 cursor-pointer">
          Ajouter une section
        </span>
        <span onClick={() => null} className="block text-sm font-medium text-red-400 cursor-pointer">
          Supprimer la section
        </span>
      </div>
    </Popover.Panel>
  </Popover>
);

export default TicketsFolders;

import React, { useState } from "react";
import { Popover } from "@headlessui/react";
import { fakeTicketsFolders } from "../../utils/ticketsFolders";
import ResizablePanel from "../ResizablePanel";
import TicketsFolder from "./TicketsFolder";

const foldersInSections = fakeTicketsFolders.reduce(
  (sections, folder) => {
    if (!sections.find(({ sectionName }) => sectionName === folder.section)) {
      sections.push({ sectionName: folder.section, folders: [] });
    }
    return sections.map((section) => {
      if (section.sectionName === folder.section) {
        return {
          ...section,
          folders: [...section.folders, folder],
        };
      }
      return section;
    });
  },
  [{ sectionName: "main", folders: [] }]
);

const TicketsFolders = () => {
  return (
    <ResizablePanel className={`z-10 flex w-80 shrink-0 grow-0 overflow-hidden border-l-2`} position="left" name="admin-tickets-left-panel">
      <div className="relative flex w-full flex-col overflow-hidden">
        <aside className="my-2 mr-1 ml-2 flex-1 rounded-lg bg-white p-3 drop-shadow-md">
          {foldersInSections.map((section) => (
            <React.Fragment key={section.sectionName}>
              <Section section={section} />
              <div className="h-3 shrink-0" />
            </React.Fragment>
          ))}
        </aside>
      </div>
    </ResizablePanel>
  );
};

const Section = ({ section }) => {
  const [showMoreButton, setShowMoreButton] = useState(false);

  if (section.sectionName === "main") {
    return section.folders.map((folder) => <TicketsFolder folder={folder} key={folder._id} />);
  }

  return (
    <details className="w-full" open>
      <summary className="relative w-full justify-between font-bold" onMouseEnter={() => setShowMoreButton(true)} onMouseLeave={() => setShowMoreButton(false)}>
        <span className="mr-auto inline-block">{section.sectionName}</span>
        <SectionButton setShowMoreButton={setShowMoreButton} showMoreButton={showMoreButton} />
      </summary>
      {section.folders.map((folder) => (
        <TicketsFolder folder={folder} key={folder._id} />
      ))}
    </details>
  );
};

const SectionButton = ({ setShowMoreButton, showMoreButton }) => (
  <Popover className={`${showMoreButton ? "visible" : "pointer-events-none invisible"} absolute right-2 inline-block cursor-pointer`} onMouseEnter={() => setShowMoreButton(true)}>
    <Popover.Button className=" inline-block cursor-pointer rounded-none border-none bg-white p-0 text-gray-300 shadow-none">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
        />
      </svg>
    </Popover.Button>

    <Popover.Panel className="absolute right-0 -left-56 top-6 z-50" onMouseLeave={() => setShowMoreButton(false)}>
      <div className="flex flex-col gap-4 rounded-md border border-gray-300 bg-white px-4 py-3">
        <span onClick={() => null} className="block cursor-pointer text-sm font-medium text-gray-700">
          Ajouter un dossier
        </span>
        <span onClick={() => null} className="block cursor-pointer text-sm font-medium text-gray-700">
          Ajouter un dossier intelligent
        </span>
        <span onClick={() => null} className="block cursor-pointer text-sm font-medium text-gray-700">
          Ajouter une section
        </span>
        <span onClick={() => null} className="block cursor-pointer text-sm font-medium text-red-400">
          Supprimer la section
        </span>
      </div>
    </Popover.Panel>
  </Popover>
);

export default TicketsFolders;

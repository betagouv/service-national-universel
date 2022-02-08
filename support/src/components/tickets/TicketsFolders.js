import React, { useState, useMemo } from "react";
import { Popover } from "@headlessui/react";
import { useRouter } from "next/router";
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
    <ResizablePanel className={`grow-0 shrink-0 border-l-2 z-10 overflow-hidden flex w-80`} position="left" name="admin-tickets-left-panel">
      <div className="relative flex flex-col overflow-hidden w-full p-3">
        <aside className="rounded-lg w-full h-full bg-white drop-shadow-md p-3">
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
  const router = useRouter();

  if (section.sectionName === "main") {
    return section.folders.map((folder) => <TicketsFolder folder={folder} key={folder._id} />);
  }

  const isOpen = useMemo(() => section.folders.map((f) => f._id).includes(router.query?.inbox), [router.query?.inbox]);

  return (
    <details className="w-full" open={isOpen}>
      <summary className="font-bold justify-between w-full relative" onMouseEnter={() => setShowMoreButton(true)} onMouseLeave={() => setShowMoreButton(false)}>
        <span className="inline-block mr-auto">{section.sectionName}</span>
        <SectionButton setShowMoreButton={setShowMoreButton} showMoreButton={showMoreButton} />
      </summary>
      {section.folders.map((folder) => (
        <TicketsFolder folder={folder} key={folder._id} />
      ))}
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

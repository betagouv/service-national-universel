import React, { useMemo, useState } from "react";
import { Popover } from "@headlessui/react";
import { useRouter } from "next/router";

const FoldersSection = ({ section }) => {
  const [showMoreButton, setShowMoreButton] = useState(false);

  if (section.sectionName === "main") {
    return section.folders.map((folder) => <Folder folder={folder} key={folder._id} />);
  }

  return (
    <details className="mt-4 w-full" open>
      <summary className="relative w-full justify-between font-bold" onMouseEnter={() => setShowMoreButton(true)} onMouseLeave={() => setShowMoreButton(false)}>
        <span className="mr-auto inline-block">{section.sectionName}</span>
        <SectionButton setShowMoreButton={setShowMoreButton} showMoreButton={showMoreButton} />
      </summary>
      {section.folders.map((folder) => (
        <Folder folder={folder} key={folder._id} />
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

const Folder = ({ folder }) => {
  const router = useRouter();
  const isActive = useMemo(() => (router.query?.inbox || "inbox") === folder._id, [router.query?.inbox]);

  const onClick = () => {
    router.query.inbox = folder._id;
    router.push(router, undefined, { shallow: true });
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex w-full flex-nowrap justify-between rounded-md border-none px-3 font-normal shadow-none ${isActive ? "bg-snu-purple-900" : "bg-white text-gray-900"}`}
    >
      <span className="flex-nowrap truncate whitespace-nowrap">{folder.name}</span>
      <em className={`rounded-full bg-gray-100 px-3 font-normal not-italic ${isActive ? "text-gray-900" : "text-gray-600"}`}>{folder.number}</em>
    </button>
  );
};

export default FoldersSection;

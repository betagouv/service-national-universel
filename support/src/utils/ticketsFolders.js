export const defaultTicketsFolders = [
  {
    _id: "inbox",
    name: "Boîte de réception",
    section: "main",
    number: 150,
  },
  {
    _id: "trash",
    name: "Corbeille",
    filters: [{ status: "trashed" }],
    section: "main",
    number: 5,
  },
];

export const fakeTicketsFolders = [
  ...defaultTicketsFolders,
  {
    _id: "123",
    name: "Premier dossier",
    section: "Phase 1",
    number: 10,
  },
  {
    _id: "456",
    name: "Deuxième dossier",
    section: "Phase 1",
    filters: [{ status: "trashed" }],
    number: 15,
  },
];

export const foldersInSections = fakeTicketsFolders.reduce(
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

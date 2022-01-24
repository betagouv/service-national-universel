import { useState } from "react";
import Header from "../../../components/Header";
import Layout from "../../../components/Layout";
import TicketsPreview from "../../../components/TicketsPreview";
import TicketsFolders from "../../../components/TicketsFolders";
import TicketsRightDrawer from "../../../components/TicketsRightDrawer";
import withAuth from "../../../hocs/withAuth";

const KnowledgeBase = () => {
  const [activeFolder, setActiveFolder] = useState(JSON.parse(localStorage.getItem("snu-tickets-active-folder-id")) || null);

  const onFolderClick = (e) => {
    setActiveFolder(e.target.dataset.id);
  };

  return (
    <>
      <Layout title="Tickets" className="flex flex-col">
        <Header>🚧 Tickets (EN COURS DE DÉVELOPPEMENT) 🚧</Header>
        <div className="relative bg-coolGray-200 flex border-t-2 h-full w-full flex-grow flex-shrink overflow-hidden">
          <TicketsFolders activeFolder={activeFolder} onFolderClick={onFolderClick} />
          <div className="flex flex-grow flex-col">
            <div className="flex flex-grow flex-col"></div>
            <TicketsPreview />
          </div>
          <TicketsRightDrawer />
        </div>
      </Layout>
    </>
  );
};

export default withAuth(KnowledgeBase);

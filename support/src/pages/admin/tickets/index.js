import Header from "../../../components/Header";
import Layout from "../../../components/Layout";
import TicketsBottomDrawer from "../../../components/TicketsBottomDrawer";
import TicketsLeftDrawer from "../../../components/TicketsLeftDrawer";
import TicketsRightDrawer from "../../../components/TicketsRightDrawer";
import withAuth from "../../../hocs/withAuth";

const KnowledgeBase = () => {
  return (
    <>
      <Layout title="Tickets" className="flex flex-col">
        <Header>🚧 Tickets (EN COURS DE DÉVELOPPEMENT) 🚧</Header>
        <div className="relative bg-coolGray-200 flex border-t-2 h-full w-full flex-grow flex-shrink overflow-hidden">
          <TicketsLeftDrawer />
          <div className="flex flex-grow flex-col">
            <div className="flex flex-grow flex-col"></div>
            <TicketsBottomDrawer />
          </div>
          <TicketsRightDrawer />
        </div>
      </Layout>
    </>
  );
};

export default withAuth(KnowledgeBase);

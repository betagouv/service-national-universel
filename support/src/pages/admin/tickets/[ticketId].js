import { useRouter } from "next/router";
import useSWR from "swr";
import Header from "../../../components/Header";
import Layout from "../../../components/Layout";
import Loader from "../../../components/Loader";
import Ticket from "../../../components/tickets/Ticket";
import withAuth from "../../../hocs/withAuth";
import API from "../../../services/api";

const TicketWithTicketId = () => {
  const router = useRouter();

  const { data } = useSWR(API.getUrl({ path: `/support-center/ticket/${router.query?.ticketId}` }));
  const ticket = data?.data;
  return (
    <>
      <Layout title="Ticket" className="flex flex-col">
        <Header>🚧 Ticket 🚧</Header>
        {ticket ? <Ticket ticket={ticket} fullScreen /> : <Loader />}
      </Layout>
    </>
  );
};

const TicketFromTicketId = () => {
  const router = useRouter();

  if (!router.query?.ticketId) {
    return (
      <>
        <Layout title="Ticket" className="flex flex-col">
          <Header>🚧 Ticket 🚧</Header>
          <Loader />
        </Layout>
      </>
    );
  }

  return <TicketWithTicketId />;
};

export default withAuth(TicketFromTicketId);

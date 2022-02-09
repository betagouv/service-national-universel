import { useRouter } from "next/router";
import ResizablePanel from "../ResizablePanel";
import TicketHeader from "./TicketHeader";

const Ticket = ({ ticket }) => {
  const router = useRouter();

  const handleTicketClose = () => router.back();

  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden bg-white">
      <TicketHeader fullScreen ticket={ticket} handleTicketClose={handleTicketClose} />
      <div className="relative flex flex-1 overflow-hidden border-t">
        <ResizablePanel position="left" className="relative flex bg-gray-100" name="ticket-fullscreen">
          <div className="flex grow">User infos</div>
        </ResizablePanel>
        <div className="flex w-full flex-col overflow-hidden p-4">
          <main className="flex-1 shrink overflow-y-scroll">
            {ticket.messages.map((message) => (
              <article key={message._id} className={`mb-2 w-4/5 rounded border p-4 ${message.zammadEmitterRole === "Customer" ? "bg-gray-100" : "ml-auto"}`}>
                <p className="ticket-message whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.body }} />
              </article>
            ))}
          </main>
          <footer className="flex w-full flex-col">
            <textarea className="my-4 w-full grow rounded border p-4" placeholder="Votre réponse..."></textarea>
            <div className="flex justify-evenly">
              <button className="border border-gray-300 bg-transparent font-normal text-gray-500 shadow-none" disabled>
                Pièce-jointe
              </button>
              <button className="ml-2 border border-gray-300 bg-transparent font-normal text-gray-500 shadow-none" disabled>
                Base de connaissance
              </button>
              <button className="ml-auto">Envoyer</button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Ticket;

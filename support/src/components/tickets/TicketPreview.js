import TicketHeader from "./TicketHeader";

const TicketPreview = ({ ticket, onTicketClose, onTicketOpen }) => {
  return (
    <div className="flex w-full flex-1 overflow-hidden">
      <div className="ml-1 mr-2 mb-2 mt-1 flex flex-1 overflow-hidden rounded-lg bg-white drop-shadow-md">
        <aside className="w-60 bg-gray-100"></aside>
        <div className="flex w-full flex-col overflow-hidden p-4">
          <TicketHeader ticket={ticket} onTicketClose={onTicketClose} onTicketOpen={onTicketOpen} />
          <main className="flex-1 shrink overflow-y-scroll border-t pt-2">
            {ticket.messages.map((message) => (
              <article key={message._id} className={`mb-2 w-4/5 rounded border p-4 ${message.zammadEmitterRole === "Customer" ? "bg-gray-100" : "ml-auto"}`}>
                <p className="ticket-message whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.body }} />
              </article>
            ))}
          </main>
          <footer className="flex w-full flex-col">
            <textarea className="my-2 w-full grow rounded border p-4" placeholder="Votre réponse..."></textarea>
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

export default TicketPreview;

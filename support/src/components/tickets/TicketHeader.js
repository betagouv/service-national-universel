const TicketHeader = ({ ticket, fullScreen = false, handleTicketClose, handleTicketOpen }) => {
  return (
    <header className={`mb-2 flex w-full justify-between bg-white ${fullScreen ? "py-4 pr-4" : ""}`}>
      {!!fullScreen && (
        <button onClick={handleTicketClose} className="w-16 border-none bg-transparent p-0 text-xl text-gray-500 shadow-none">
          {"<"}
        </button>
      )}
      <div className="mr-auto flex-col">
        <div className="opacity-50">
          #{ticket.number} · {new Date(ticket.createdAt).toLocaleDateString("fr", { day: "numeric", month: "long", year: "numeric" })}
        </div>
        <b>{ticket.title}</b>
      </div>
      {!fullScreen && (
        <div className="flex shrink-0 grow-0 items-center justify-center">
          <svg
            className="h-4 w-4 shrink-0 cursor-pointer p-0.5"
            viewBox="0 0 14 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            data-ticketid={ticket._id}
            onClick={handleTicketOpen}
          >
            <path
              d="M13 4.78369V1.78369M13 1.78369H10M13 1.78369L9.25 5.53369M1 10.7837V13.7837M1 13.7837H4M1 13.7837L4.75 10.0337"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none"
            />
          </svg>
          <svg
            data-ticketid={ticket._id}
            onClick={handleTicketClose}
            xmlns="http://www.w3.org/2000/svg"
            className="ml-2 h-4 w-4 shrink-0 cursor-pointer"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path className="pointer-events-none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
      {!!fullScreen && (
        <select className="rounded px-4">
          {["Ouvert", "Fermé"].map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      )}
    </header>
  );
};

export default TicketHeader;

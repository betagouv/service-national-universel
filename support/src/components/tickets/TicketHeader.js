import CrossIcon from "../icons/CrossIcon";
import FullScreenIcon from "../icons/FullScreenIcon";

const TicketHeader = ({ ticket, fullScreen = false, onTicketClose, onTicketOpen }) => {
  return (
    <header className={`mb-2 flex w-full justify-between bg-white ${fullScreen ? "py-4 pr-4" : ""}`}>
      {!!fullScreen && (
        <button onClick={onTicketClose} className="w-16 border-none bg-transparent p-0 text-xl text-gray-500 shadow-none">
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
          <FullScreenIcon
            onClick={(e) => {
              e.stopPropagation();
              onTicketOpen(ticket._id);
            }}
          />
          <CrossIcon
            onClick={(e) => {
              e.stopPropagation();
              onTicketClose(ticket._id);
            }}
          />
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

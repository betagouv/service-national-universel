const TicketsFolder = ({ name, onClick, number, active, id }) => {
  return (
    <button
      onClick={onClick}
      data-id={id}
      className={`inline-flex rounded-md border-none shadow-none w-full px-3 justify-between font-normal ${active ? "bg-snu-purple-900" : "bg-white text-gray-900"}`}
    >
      {name}
      <em className={`font-normal not-italic px-3 rounded-full bg-gray-100 ${active ? "text-gray-900" : "text-gray-600"}`}>{number}</em>
    </button>
  );
};

export default TicketsFolder;

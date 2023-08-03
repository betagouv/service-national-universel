const RedIcon = ({ icon, onSelect, showText, className }) => (
  <div
    key={icon}
    className={`mx-10 my-5 inline-flex w-12 flex-col items-center justify-center ${onSelect ? "cursor-pointer" : ""} ${className || ""}`}
    onClick={() => onSelect?.(icon)}
  >
    <span className={`material-icons mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-red-600 text-center text-2xl text-white`}>{icon}</span>
    {showText && <span className={`align-text-bottom text-xs`}>{icon}</span>}
  </div>
);

export default RedIcon;

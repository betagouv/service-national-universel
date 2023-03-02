import React from "react";
import { BiChevronDown } from "react-icons/bi";

export const SortOptionComponent = ({ sortOptions, sortSelected, setSortSelected }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef();

  const handleClick = (value) => {
    setSortSelected(value);
    setIsOpen(false);
  };
  React.useEffect(() => {
    if (!ref) return;
    const handleClickOutside = (event) => {
      if (ref?.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);
  return (
    <div className="relative" ref={ref}>
      <div className="flex flex-row items-center gap-2 cursor-pointer" onClick={() => setIsOpen((isOpen) => !isOpen)}>
        <div>{sortSelected.label}</div>
        <BiChevronDown size={20} />
      </div>
      {isOpen && (
        <div className="absolute bg-white shadow-sm">
          {sortOptions.map((item) => (
            <div key={item.value} onClick={() => handleClick(item)} className="flex flex-row items-center gap-2 p-2 cursor-pointer hover:bg-gray-100">
              <div>{item.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React from "react";
import { BiChevronDown } from "react-icons/bi";

const SortOption = ({ sortOptions, paramData, setParamData }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef();
  const refOptions = React.useRef();

  const handleClick = (value) => {
    setParamData((old) => ({ ...old, sort: value }));
    setIsOpen(false);
  };
  React.useEffect(() => {
    if (!paramData?.sort) setParamData((old) => ({ ...old, sort: sortOptions[0] }));
    if (!ref || !refOptions) return;
    const handleClickOutside = (event) => {
      if (ref?.current && !ref.current.contains(event.target) && refOptions?.current && !refOptions.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);
  return (
    <div className="relative">
      <div className="flex flex-row items-center gap-2 cursor-pointer  w-fit" onClick={() => setIsOpen((isOpen) => !isOpen)} ref={ref}>
        <div>{paramData?.sort?.label}</div>
        <BiChevronDown size={20} />
      </div>
      {isOpen && (
        <div className="absolute bg-white shadow-sm" ref={refOptions}>
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

export default SortOption;

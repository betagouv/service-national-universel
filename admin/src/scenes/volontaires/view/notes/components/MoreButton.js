import React, { useRef, useState, useEffect } from "react";
import dots from "../../../../../assets/dots.svg";

const circleStyle = "flex justify-center items-center rounded-full";

const MoreButton = ({ className, actions = [] }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleMenu}
        className={`w-[40px] h-[40px] p-[3px] ${circleStyle} border-2 bg-[#E5E7EB] hover:bg-[#D1D5DB] active:border-[#3B82F6] ${isMenuOpen && "!border-[#3B82F6]"} ${className}`}>
        <div className={`w-[32px] h-[32px] ${circleStyle}`}>
          <img src={dots} alt="icon button" />
        </div>
      </button>
      <div className={`${isMenuOpen ? "block" : "hidden"} absolute right-0 top-11 bg-white rounded-md shadow-md z-10`}>
        {actions.map(({ label, onClick }) => (
          <div className="whitespace-nowrap px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={onClick}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoreButton;

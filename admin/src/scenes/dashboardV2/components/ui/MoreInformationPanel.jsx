import React, { useState } from "react";
import InformationCircle from "../../../../assets/icons/InformationCircle";

export default function MoreInfoPanel({ children, className = "" }) {
  const [open, setOpen] = useState(false);
  const panel = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (panel.current && !panel.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  function click(event) {
    event.stopPropagation();
    event.preventDefault();
    setOpen(!open);
  }

  return (
    <div className={`relative ${className}`}>
      <InformationCircle className="mx-2 cursor-pointer text-gray-400" onClick={click} />
      <div ref={panel} className={`${open ? "block" : "hidden"} absolute left-[50%] bottom-[30px] w-max translate-x-[-50%] rounded-xl bg-[#FFFFFF] shadow`}>
        {children}
      </div>
    </div>
  );
}

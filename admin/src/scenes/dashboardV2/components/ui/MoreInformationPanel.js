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
    setOpen(!open);
  }

  return (
    <div className={`relative ${className}`}>
      <InformationCircle className="text-gray-400 mx-2 cursor-pointer" onClick={click} />
      <div ref={panel} className={`${open ? "block" : "hidden"} absolute bg-[#FFFFFF] rounded-xl shadow left-[50%] translate-x-[-50%] bottom-[30px]`}>
        {children}
      </div>
    </div>
  );
}

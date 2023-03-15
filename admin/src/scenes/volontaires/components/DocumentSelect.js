import React, { useRef, useState, useEffect } from "react";
import { BiChevronDown } from "react-icons/bi";
import { BsDownload } from "react-icons/bs";
import { CiMail } from "react-icons/ci";

const DocumentSelect = ({ title, onClickMail, onClickPdf }) => {
  const ref = useRef();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);
  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setOpen((open) => !open)}
        className="cursor-pointer flex flex-row justify-center items-center gap-2 text-blue-700 border-[1px] rounded-full border-blue-700 px-3 py-2 ml-2">
        <div className="text-xs font-medium">{title}</div>
        <BiChevronDown />
      </div>
      <div
        className={`absolute ${
          open ? "flex" : "hidden"
        } flex-col items-center justify-center bg-white border-[1px] border-gray-300 rounded-md text-gray-700 z-10 mt-2 overflow-hidden`}>
        <div
          onClick={() => {
            onClickPdf();
            setOpen(false);
          }}
          className="flex flex-row justify-start items-center gap-2 w-64 py-2.5 px-2 border-b-[1px] hover:text-white hover:bg-blue-600 cursor-pointer">
          <BsDownload />
          <div>Télécharger</div>
        </div>
        <div
          className="flex flex-row justify-start items-center gap-2 w-64 py-2.5 px-2 hover:text-white hover:bg-blue-600 cursor-pointer"
          onClick={() => {
            onClickMail();
            setOpen(false);
          }}>
          <CiMail />
          <div>Envoyer par mail</div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSelect;

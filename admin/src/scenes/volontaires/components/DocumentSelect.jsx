import React, { useRef, useState, useEffect } from "react";
import { BiChevronDown } from "react-icons/bi";
import { BsDownload } from "react-icons/bs";
import { CiMail } from "react-icons/ci";
import { useSelector } from "react-redux";
import { ROLES } from "snu-lib";

const DocumentSelect = ({ title, onClickMail, onClickPdf }) => {
  const user = useSelector((state) => state.Auth.user);
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
        className="flex cursor-pointer items-center justify-center gap-2 rounded-full border-[1px] border-blue-700 px-4 py-1 text-blue-700">
        <span className="text-sm font-medium">{title}</span>
        <BiChevronDown />
      </div>
      <div
        className={`absolute ${
          open ? "flex" : "hidden"
        } z-10 mt-2 flex-col items-center justify-center overflow-hidden rounded-md border-[1px] border-gray-300 bg-white text-gray-700`}>
        <div
          onClick={() => {
            onClickPdf();
            setOpen(false);
          }}
          className="flex w-64 cursor-pointer flex-row items-center justify-start gap-2 border-b-[1px] py-2.5 px-2 hover:bg-blue-600 hover:text-white">
          <BsDownload />
          <div>Télécharger</div>
        </div>
        {![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role) && (
          <div
            className="flex w-64 cursor-pointer flex-row items-center justify-start gap-2 py-2.5 px-2 hover:bg-blue-600 hover:text-white"
            onClick={() => {
              onClickMail();
              setOpen(false);
            }}>
            <CiMail />
            <div>Envoyer par mail</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentSelect;

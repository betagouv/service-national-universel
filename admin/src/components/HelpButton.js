import React from "react";
import { supportURL } from "../config";

export default function HelpButton() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="fixed bottom-2 right-2 ">
      <div className="w-10 h-10 shadow-sm rounded-full bg-white boreder-red-400 cursor-pointer flex justify-center items-center text-blue-600" onClick={() => setOpen((e) => !e)}>
        <div>?</div>
      </div>
      <div
        className={`${
          open ? "block" : "hidden"
        } group-hover:block min-w-[250px] rounded-lg bg-white transition absolute right-3 bottom-11 border-3 border-red-600 shadow-sm overflow-hidden`}>
        <div className="my-2 text-xs px-3 text-coolGray-600">
          <p>Besoin d&apos;aide ?</p>
        </div>
        <hr className="m-0 border-t-coolGray-100" />
        <a href={supportURL} target="_blank" rel="noreferrer">
          <div className="group text-coolGray-800 cursor-pointer p-3 hover:bg-coolGray-100 hover:text-coolGray-800 flex items-center gap-2 text-coolGray-800 hover:text-coolGray-800">
            Base de connaissance
          </div>
        </a>
        <a href="/besoin-d-aide" target="_blank" rel="noreferrer">
          <div className="group text-coolGray-800 cursor-pointer p-3 hover:bg-coolGray-100 hover:text-coolGray-800 flex items-center gap-2 text-coolGray-800 hover:text-coolGray-800">
            Support
          </div>
        </a>
      </div>
    </div>
  );
}

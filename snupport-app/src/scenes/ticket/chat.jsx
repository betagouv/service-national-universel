import React, { Fragment, useState } from "react";
import { HiOutlineArrowsExpand, HiOutlineChevronUp, HiOutlineX } from "react-icons/hi";

import ChatModal from "./components/ChatModal";
import ChatMaximize from "./components/ChatMaximize";
import { toast } from "react-hot-toast";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximize, setIsMaximize] = useState(false);

  const Item = ({ text, read = false }) => {
    const WindowButton = ({ icon, handleClick }) => (
      <button className={classNames(read ? "text-purple-snu" : "text-light-purple", "text-lg")} onClick={handleClick}>
        {icon}
      </button>
    );

    return (
      <div className={classNames(read ? "bg-light-purple" : "bg-purple-snu", "flex h-11 items-center gap-6 rounded-t-md pl-5 pr-3.5")}>
        <span className={classNames(read ? "text-purple-snu" : "text-white", "text-base font-semibold")}>{text}</span>
        <div className="flex items-center gap-2.5">
          <WindowButton icon={<HiOutlineChevronUp />} handleClick={() => setIsOpen(true)} />
          <WindowButton icon={<HiOutlineArrowsExpand />} handleClick={() => setIsMaximize(true)} />
          <WindowButton icon={<HiOutlineX />} handleClick={() => toast.error("En cours de développement")} />
        </div>
      </div>
    );
  };

  return (
    <Fragment>
      {isOpen && <ChatModal setIsOpen={setIsOpen} setIsMaximize={setIsMaximize} />}
      {isMaximize && <ChatMaximize setIsMaximize={setIsMaximize} />}

      <div className="sticky bottom-0 z-10 flex justify-end gap-[26px]">
        <Item text="Problème à l’inscription depuis ..." read={false} />
        <Item text="Problème à l’inscription depuis ..." read={true} />
      </div>
    </Fragment>
  );
}

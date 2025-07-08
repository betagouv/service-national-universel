import { Menu, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useRef } from "react";
import {
  HiChevronDown,
  HiLocationMarker,
  HiMail,
  HiOutlineArrowsExpand,
  HiOutlineChevronDown,
  HiOutlineDocumentAdd,
  HiOutlineQuestionMarkCircle,
  HiOutlineX,
  HiPlus,
  HiViewBoards,
  HiX,
} from "react-icons/hi";

import { toast } from "react-hot-toast";
import ChatBox from "./ChatBox";
import DropdownButton from "./DropdownButton";

export default function ChatModal({ setIsOpen, setIsMaximize }) {
  const modalRef = useRef();

  function useOutside(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setIsOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  useOutside(modalRef, setIsOpen);

  return (
    <div className="absolute inset-0 z-20 bg-purple-snu/80">
      <div className="absolute bottom-0 left-1/2 flex h-[calc(100%-24px)] w-[1008px] -translate-x-1/2 overflow-hidden rounded-t-[10px] bg-white" ref={modalRef}>
        <LeftSide />
        <RightSide setIsOpen={setIsOpen} setIsMaximize={setIsMaximize} />
      </div>
    </div>
  );
}

const LeftSide = () => {
  return (
    <div className="flex w-[310px] flex-col justify-between gap-[26px] bg-gray-50 py-5 px-8">
      <div>
        <span className="text-gray-500">Volontaire</span>
        <p className="mb-5 text-lg font-bold text-gray-900">Michel Dupont</p>

        <div className="grid grid-cols-[auto_1fr] items-center gap-x-1.5 gap-y-2">
          <HiViewBoards className="text-xl text-gray-400" />
          <span className="text-sm text-gray-500">Phase 0</span>
          <HiLocationMarker className="text-xl text-gray-400" />
          <span className="text-sm text-gray-500">Noisy-le-Grand (93160)</span>
          <HiMail className="text-xl text-gray-400" />
          <span className="text-sm text-gray-500">michel.dupont@hotmail.fr</span>
        </div>

        <hr className="my-[22px] border-gray-300" />

        <select className="mb-5 block w-full rounded-md border-[#7DDDC0] bg-[#D1FAE5] py-2 pl-4 pr-10 text-sm font-semibold focus:border-[#7DDDC0]">
          <option>Fermé</option>
          <option>Fermé 2</option>
          <option>Fermé 3</option>
        </select>

        <label className="text-xs text-gray-500">Etiquettes</label>

        <div className="mt-2 mb-4 flex divide-x divide-gray-300 overflow-hidden rounded-md border border-gray-300">
          <input type="text" className="w-[200px] flex-1 border-0 text-sm text-gray-600 placeholder:text-[#979797] focus:border-transparent" placeholder="Commencez à taper" />
          <button className="flex h-10 w-11 flex-none items-center justify-center bg-white text-2xl text-gray-500 transition-colors hover:bg-gray-50">
            <HiPlus />
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <span className="flex items-center gap-0.5 rounded-full bg-purple-100 py-0.5 pl-2.5 pr-1">
            <span className="text-sm font-medium text-purple-800">Phase 1</span>
            <HiX className="text-base text-indigo-400" />
          </span>
          <span className="flex items-center gap-0.5 rounded-full bg-purple-100 py-0.5 pl-2.5 pr-1">
            <span className="text-sm font-medium text-purple-800">Badge</span>
            <HiX className="text-base text-indigo-400" />
          </span>
          <span className="flex items-center gap-0.5 rounded-full bg-purple-100 py-0.5 px-2.5">
            <span className="text-sm font-medium text-purple-800">+3</span>
          </span>
        </div>
      </div>

      <div>
        <div className="relative mb-4 flex items-center justify-center">
          <hr className="absolute w-full border-gray-300" />
          <span className="z-10 w-max bg-gray-50 px-3 text-xs font-bold text-grey-text">Notes internes</span>
        </div>

        <p className="mb-[22px] text-xs text-gray-500">
          <span className="font-medium">Hervé</span> : Ca semble un problème classique.
        </p>

        <textarea
          rows="4"
          className="mb-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-600 transition-colors placeholder:text-[#979797] focus:border-gray-400"
          placeholder="Note interne"
        />

        <div className="flex gap-1">
          <button className="h-[34px] grow rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            Enregistrer
          </button>
          <button className="h-[34px] grow rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            Créer un ticket
          </button>
        </div>
      </div>
    </div>
  );
};

const RightSide = ({ setIsOpen, setIsMaximize }) => {
  const Button = ({ text, icon, handleClick }) => (
    <button
      className="flex h-[inherit] grow items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-2.5 transition-colors hover:bg-gray-50"
      onClick={handleClick}
    >
      {icon && <span className="text-2xl text-gray-400">{icon}</span>}
      <span className="text-sm font-medium text-grey-text">{text}</span>
    </button>
  );

  const WindowButton = ({ icon, handleClick }) => (
    <button className="text-2xl text-grey-text transition-colors hover:text-gray-600" onClick={handleClick}>
      {icon}
    </button>
  );

  return (
    <div className="flex flex-1 flex-col pt-[22px] pr-8 pl-9 pb-7">
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div>
          <p className="mb-1 text-sm text-gray-500">#4583 • Problème technique • 7 juillet 2021</p>
          <p className="font-bold text-gray-900">💬️ Problème à l’inscription depuis un mobile</p>
        </div>
        <div className="flex items-center gap-4">
          <WindowButton icon={<HiOutlineChevronDown />} handleClick={() => setIsOpen(false)} />
          <WindowButton
            icon={<HiOutlineArrowsExpand />}
            handleClick={() => {
              setIsOpen(false);
              setIsMaximize(true);
            }}
          />
          <WindowButton icon={<HiOutlineX />} handleClick={() => toast.error("En cours de développement")} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto py-3.5">
        <ChatBox
          name="Michel Dupont"
          time="Il y a 1 heure"
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius."
          sender={false}
        />
        <ChatBox
          name="Hervé Matoux"
          time="Il y a 1 heure"
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor."
          attachment="Fiche de renseignements.pdf"
          sender={true}
        />
      </div>

      <textarea
        rows="2"
        className="mb-5 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-600 transition-colors placeholder:text-[#979797] focus:border-gray-400"
        placeholder="Votre réponse"
      />

      <div className="flex h-[42px] gap-2">
        <Button text="Pièce-jointe" icon={<HiOutlineDocumentAdd />} handleClick={() => toast.error("En cours de développement")} />
        <Button text="Base de connaissance" icon={<HiOutlineQuestionMarkCircle />} handleClick={() => toast.error("En cours de développement")} />
        <Button text="Enregistrer" handleClick={() => toast.error("En cours de développement")} />

        <div className="relative z-0 flex h-[42px] grow rounded-md">
          <button
            type="button"
            className="relative flex flex-1 items-center justify-center rounded-l-md bg-accent-color px-[18px] text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus:z-10"
          >
            Envoyer
          </button>
          <Menu as="span" className="relative block">
            <Menu.Button className="relative flex h-full w-[42px] items-center justify-center rounded-r-md border-l border-[#726BEA] bg-accent-color text-xl text-white transition-colors hover:bg-indigo-500 focus:z-10">
              <span className="sr-only">Open options</span>
              <HiChevronDown />
            </Menu.Button>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute bottom-12 right-0 flex w-56 origin-bottom-right flex-col rounded-md bg-white py-1 shadow-lg">
                <DropdownButton name="Par agent" handleClick={() => toast.error("En cours de développement")} />
                <DropdownButton name="Du plus récent" handleClick={() => toast.error("En cours de développement")} />
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
};

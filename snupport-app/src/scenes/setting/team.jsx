import { Menu, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import { toast } from "react-hot-toast";
import { HiChevronDown, HiSearch } from "react-icons/hi";

import DropdownButton from "../../components/DropdownButton";
import { TH } from "../../components/Table";

export default function Team() {
  return (
    <Fragment>
      <Header />
      <Filter />
      <Table />
    </Fragment>
  );
}

const Header = () => {
  return (
    <div className="mb-[38px] flex items-center justify-between pl-[22px]">
      <div>
        <span className="text-sm font-medium uppercase text-gray-500">Utilisateurs</span>
        <h4 className="mt-1.5 text-3xl font-bold text-black-dark">Equipe</h4>
      </div>
      <div className="relative flex items-center">
        <HiSearch className="absolute left-3.5 text-xl text-gray-400" />
        <input
          type="text"
          className="h-[38px] rounded-md border border-[#D1D5DB] pl-10 text-sm font-medium text-gray-800 shadow-md transition-colors placeholder:text-gray-500 focus:border-gray-400"
          placeholder="Rechercher"
        />
      </div>
    </div>
  );
};

const Filter = () => (
  <div className="mb-5 flex gap-3">
    <div className="flex h-[38px] flex-1 items-center gap-5 rounded-md border border-gray-300 bg-white px-3.5 shadow-sm">
      <input type="text" className="flex-1 border-none p-0 text-sm text-gray-800 placeholder:text-gray-500" placeholder="Renseignez un e-mail" />
      <div className="h-4 border-l border-gray-300" />
      <Menu as="div" className="relative flex-none">
        <Menu.Button className="flex items-center gap-2 text-gray-400">
          <span className="text-sm text-gray-500">Admin</span>
          <HiChevronDown className="text-xl" />
        </Menu.Button>

        <Transition
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-1/2 z-10 mt-4 flex w-56 origin-top -translate-x-1/2 flex-col rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <DropdownButton name="Herve" handleClick={() => toast.error("En cours de développement")} />
            <DropdownButton name="John Doe" handleClick={() => toast.error("En cours de développement")} />
            <DropdownButton name="Hohohoho" handleClick={() => toast.error("En cours de développement")} />
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
    <button
      className="h-[38px] flex-none rounded-md bg-accent-color px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
      onClick={() => toast.error("En cours de développement")}
    >
      Envoyer une invitation
    </button>
  </div>
);

const Table = () => {
  return (
    <div className="rounded-lg bg-white shadow">
      <div className="flex justify-between rounded-t-lg border-b border-gray-200 bg-gray-50">
        <TH text="Utilisateur" />
        <TH text="Rôle" />
        <TH text="Inscription" />
        <TH text="Action" className="w-[128px] flex-none" />
      </div>

      <div className="flex flex-col">
        {[...Array(10)].map((_, index) => (
          <div className="flex last:rounded-b-lg odd:bg-white even:bg-gray-50" key={index}>
            <p className="flex-1 px-6 py-4 text-sm text-gray-500">Bertille de la Fressange</p>
            <p className="flex-1 px-6 py-4 text-sm text-gray-500">Modérateur</p>
            <p className="flex-1 px-6 py-4 text-sm text-gray-500">23 mars 2021</p>
            <div className="flex w-[128px] flex-none items-center gap-5 px-6 py-4">
              <button
                type="button"
                className="text-sm font-medium text-accent-color transition-colors hover:text-indigo-500"
                onClick={() => toast.error("En cours de développement")}
              >
                Editer
              </button>
              {/* <button type="button" className="flex items-center text-xl text-grey-text transition-colors hover:text-red-500">
                <HiTrash />
              </button> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

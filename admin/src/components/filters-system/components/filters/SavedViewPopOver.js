import { Popover, Transition } from "@headlessui/react";
import React, { Fragment } from "react";

import { BsChevronRight } from "react-icons/bs";
import Trash from "../../../../assets/icons/Trash";
import FloppyDisk from "../../../../assets/icons/FloppyDisk";

// File used to show the popover for the saved views (the one from the DB)

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ViewPopOver({ setIsShowing, isShowing, savedView, handleDelete, handleSelect }) {
  return (
    <Popover className="">
      {({ open }) => (
        <>
          <Popover.Button
            onClick={() => setIsShowing("view")}
            className={classNames(
              open ? "bg-gray-100 font-bold" : "",
              "flex items-center justify-between transition  duration-150 ease-in-out hover:bg-gray-50 cursor-pointer py-2 px-4 outline-none w-full mb-1",
            )}>
            <div className="flex flex-row items-center gap-2">
              <FloppyDisk />
              <p className="text-gray-700 text-sm leading-5">
                Vues enregistrées <span className="font-bold">({savedView?.length})</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <BsChevronRight className="text-gray-400" />
            </div>
          </Popover.Button>

          <Transition
            as={Fragment}
            show={isShowing}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1">
            <Popover.Panel className="absolute left-[101%] z-20 w-[305px] -translate-y-[36px]">
              <div className="rounded-lg shadow-lg ">
                <div className="relative grid bg-white py-2 rounded-lg border-[1px] border-gray-100 px-3">
                  <div className="text-xs text-gray-500">Activer une vue annulera tous les filtres en cours</div>
                  {savedView.map((view) => (
                    <div key={view._id} className="flex items-center justify-between">
                      <div className=" hover:bg-gray-50 cursor-pointer w-full py-2" onClick={() => handleSelect(view?.url)}>
                        <div className="text-gray-700 text-sm">{view.name}</div>
                      </div>
                      <Trash className="text-red-500 h-3 w-3 font-light cursor-pointer" onClick={() => handleDelete(view._id)} />
                    </div>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

//

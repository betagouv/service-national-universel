import { Popover, Transition } from "@headlessui/react";
import React, { Fragment } from "react";

import { BsChevronRight } from "react-icons/bs";
import Trash from "../../../assets/icons/Trash";

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
                Vues enregistrées <span className="font-bold">({savedView.length})</span>
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

const FloppyDisk = () => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.9268 3.57325L10.4268 0.0732501C10.3799 0.0263627 10.3163 1.41594e-05 10.25 0H9V3.75C9 3.8163 8.97366 3.87989 8.92678 3.92678C8.87989 3.97366 8.8163 4 8.75 4H2.25C2.1837 4 2.12011 3.97366 2.07322 3.92678C2.02634 3.87989 2 3.8163 2 3.75V0H1.5C1.1023 0.000397108 0.720997 0.15856 0.439778 0.439778C0.15856 0.720997 0.000397108 1.1023 0 1.5V12.5C0.000397108 12.8977 0.15856 13.279 0.439778 13.5602C0.720997 13.8414 1.1023 13.9996 1.5 14H12.5C12.8977 13.9996 13.279 13.8414 13.5602 13.5602C13.8414 13.279 13.9996 12.8977 14 12.5V3.75C14 3.6837 13.9736 3.62012 13.9268 3.57325ZM11.25 11.5C11.25 11.5663 11.2237 11.6299 11.1768 11.6768C11.1299 11.7237 11.0663 11.75 11 11.75H2.25C2.1837 11.75 2.12011 11.7237 2.07322 11.6768C2.02634 11.6299 2 11.5663 2 11.5V8C2 7.9337 2.02634 7.87011 2.07322 7.82322C2.12011 7.77634 2.1837 7.75 2.25 7.75H11C11.0663 7.75 11.1299 7.77634 11.1768 7.82322C11.2237 7.87011 11.25 7.9337 11.25 8V11.5Z"
        fill="#6B7280"
      />
    </svg>
  );
};

//

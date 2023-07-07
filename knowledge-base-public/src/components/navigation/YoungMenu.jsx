import { useSWRConfig } from "swr";
import useUser from "../../hooks/useUser";
import { appURL, snuApiUrl } from "../../config";
import API from "../../services/api";
import Link from "next/link";
import { Popover, Transition } from "@headlessui/react";
import { HiOutlineLogout, HiOutlineUser } from "react-icons/hi";
import { Fragment } from "react";

export default function YoungMenu() {
  const { mutate, user } = useUser();
  const { cache } = useSWRConfig();
  const onLogout = async (event) => {
    event.preventDefault();
    await API.post({ origin: snuApiUrl, path: "/young/logout" });
    mutate(null);
    cache.clear();
  };

  return (
    <Popover.Group>
      <Popover className="relative flex grow-0 justify-end md:flex-none">
        <Popover.Button className="flex h-10 w-10 items-center justify-center gap-3 rounded-full border-none bg-blue-50 p-0 text-sm font-bold uppercase tracking-tight text-[#32257F]">
          {user.firstName?.[0]}
          {user.lastName?.[0]}
        </Popover.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel className="absolute right-0 top-14 z-10 w-80 overflow-hidden rounded-md bg-white text-gray-800">
            <nav>
              <ul>
                <li>
                  <Link href={appURL} className="flex items-center justify-between p-4 text-sm font-medium transition-colors hover:bg-gray-100">
                    Retour sur mon compte SNU
                    <HiOutlineUser className="text-xl text-gray-400" />
                  </Link>
                </li>

                <hr />

                <li>
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center justify-between border border-none bg-transparent p-4 text-sm font-medium text-gray-800 shadow-none transition-colors hover:bg-gray-100"
                  >
                    <span>Déconnexion</span>
                    <HiOutlineLogout className="text-xl text-gray-400" />
                  </button>
                </li>
              </ul>
            </nav>
          </Popover.Panel>
        </Transition>
      </Popover>
    </Popover.Group>
  );
}

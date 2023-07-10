import { Fragment, useContext } from "react";
import useUser from "../../hooks/useUser";
import SeeAsContext from "../../contexts/seeAs";
import { useSWRConfig } from "swr";
import { adminURL, snuApiUrl } from "../../config";
import API from "../../services/api";
import Link from "next/link";
import { Popover, Transition } from "@headlessui/react";
import { translateRoleBDC } from "../../utils/constants";
import { HiOutlineLogout, HiOutlineUser } from "react-icons/hi";

export default function AdminMenu() {
  const { mutate, user } = useUser();
  const { setSeeAs, seeAs, roles } = useContext(SeeAsContext);
  const categoryAccessibleReferent = ["structure", "head_center", "young", "visitor"];
  const { cache } = useSWRConfig();
  const withSeeAs = ["admin", "referent_department", "referent_region"].includes(user?.role);

  const onLogout = async (event) => {
    event.preventDefault();
    await API.post({ origin: snuApiUrl, path: "/referent/logout" });
    mutate(null);
    cache.clear();
  };

  return (
    <>
      {/* TODO: new role selector */}
      {withSeeAs && (
        <Popover className="relative mx-auto flex w-auto justify-end md:ml-auto md:flex-none lg:flex-1">
          <Popover.Button className="flex items-center justify-center gap-3 rounded-none border-none bg-white p-0 text-left shadow-none">
            <img src="/assets/change-user.png" className="h-5 w-5 grayscale" />
            <div className="flex h-full flex-col justify-center">
              <span className="text-sm font-medium text-gray-700">Voir les articles pour</span>
            </div>
          </Popover.Button>

          <Popover.Panel className="absolute right-0 top-10 z-10 min-w-[208px] lg:min-w-0">
            <div className="flex flex-col gap-4 rounded-md border border-gray-300 bg-white px-4 py-3">
              {roles
                .filter((role) => (user.role === "admin" ? true : categoryAccessibleReferent.includes(role)))
                .map((role) => (
                  <a key={role} onClick={() => setSeeAs(role)} className={`text-sm font-${seeAs === role ? "bold" : "medium"} cursor-pointer text-gray-700`}>
                    {translateRoleBDC[role]}
                  </a>
                ))}
            </div>
          </Popover.Panel>
        </Popover>
      )}

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
                    <Link href={adminURL} className="flex items-center justify-between p-4 text-sm font-medium transition-colors hover:bg-gray-100">
                      Espace admin SNU
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
    </>
  );
}

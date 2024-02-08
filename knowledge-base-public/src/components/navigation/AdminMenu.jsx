import { Fragment, useContext, useEffect } from "react";
import useUser from "../../hooks/useUser";
import SeeAsContext from "../../contexts/seeAs";
import { useSWRConfig } from "swr";
import { adminURL, snuApiUrl } from "../../config";
import API from "../../services/api";
import Link from "next/link";
import { Popover, Transition } from "@headlessui/react";
import { translateRoleBDC } from "../../utils/constants";
import { HiOutlineLogout, HiOutlineUser, HiCheck } from "react-icons/hi";
import { environment } from "../../config";

export default function AdminMenu() {
  const { mutate, user: originalUser } = useUser();
  const { setSeeAs, seeAs, roles } = useContext(SeeAsContext);
  const { cache } = useSWRConfig();

  const getModifiedRole = (role) => {
    return role === "referent_department" || role === "referent_region" ? "referent" : role;
  };

  const user = {
    ...originalUser,
    role: getModifiedRole(originalUser.role),
  };

  const categoryAccessibleReferent = {
    referent: [
      "referent",
      "structure",
      "head_center",
      "young",
      "visitor",
      "young_cle",
      "administrateur_cle_coordinateur_cle",
      "administrateur_cle_referent_etablissement",
      "referent_classe",
    ],
    administrateur_cle_referent_etablissement: ["young_cle", "administrateur_cle_coordinateur_cle", "administrateur_cle_referent_etablissement", "referent_classe"],
    administrateur_cle_coordinateur_cle: ["young_cle", "administrateur_cle_coordinateur_cle", "referent_classe", "head_center"],
    referent_classe: ["young_cle", "administrateur_cle_coordinateur_cle", "referent_classe", "head_center"],
  };

  const withSeeAs = [
    "admin",
    "referent",
    "head_center",
    "structure",
    "visitor",
    "dsnj",
    "administrateur_cle_coordinateur_cle",
    "administrateur_cle_referent_etablissement",
    "referent_classe",
  ].includes(user?.role);

  useEffect(() => {
    if (user && user.role && seeAs === null) {
      setSeeAs(user.role);
    }
  }, [user, setSeeAs, seeAs]);

  const onLogout = async (event) => {
    event.preventDefault();
    await API.post({ origin: snuApiUrl, path: "/referent/logout" });
    mutate(null);
    cache.clear();
  };

  return (
    <>
      {withSeeAs && (
        <Popover className="relative mx-auto flex w-auto justify-end md:ml-auto md:flex-none lg:flex-1">
          <Popover.Button className="flex items-center justify-center gap-3 rounded-none border-none bg-[#32257F] p-0 text-left shadow-none">
            <div className="flex h-full flex-raw justify-center align-center">
              <span className="text-xs md:text-sm leading-8 font-medium text-white truncate">Voir en tant que</span>
              <span className="text-xs md:text-sm leading-8 font-medium text-blue-300 ml-1 capitalize truncate">
                {seeAs !== null ? translateRoleBDC[seeAs] : translateRoleBDC[user.role]}
              </span>
              <span className={`material-icons mt-1 lg:mt-0 text-blue-300 text-md flex-none`}>expand_more</span>
            </div>
          </Popover.Button>

          <Popover.Panel className="absolute right-0 top-10 z-10 min-w-[208px] shadow-md lg:min-w-[300px]">
            <div className="flex flex-col gap-4 rounded-md border border-gray-300 bg-white px-4 py-3">
              {roles
                .filter((role) => {
                  return user.role === "admin" ? true : categoryAccessibleReferent[user.role]?.includes(role);
                })
                .map((role) => (
                  <a
                    key={role}
                    onClick={() => setSeeAs(role)}
                    className={`text-sm font-${seeAs === role ? "bold" : "medium"} flex flex-raw justify-between cursor-pointer text-gray-700`}
                  >
                    {translateRoleBDC[role]}
                    <HiCheck className={`text-xl text-blue-600 " ${seeAs === role ? "inline" : "hidden"}`} />
                  </a>
                ))}
            </div>
          </Popover.Panel>
        </Popover>
      )}

      <Popover.Group>
        <Popover className="relative flex grow-0 justify-end md:flex-none">
          {({ open }) => (
            <>
              <Popover.Button className="flex h-10 w-10 items-center justify-center gap-3 rounded-full border-none bg-blue-50 p-0 text-sm font-bold uppercase tracking-tight text-[#32257F]">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </Popover.Button>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute right-0 top-14 z-10 w-80 overflow-hidden rounded-md bg-white text-gray-800 shadow-md">
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
            </>
          )}
        </Popover>
      </Popover.Group>
    </>
  );
}

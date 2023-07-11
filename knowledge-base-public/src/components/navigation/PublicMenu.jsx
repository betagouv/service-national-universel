import { Popover, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { adminURL, appURL, baseDeConnaissanceURL } from "../../config";
import Link from "next/link";
import { HiOutlineExternalLink } from "react-icons/hi";
import { FiMenu } from "react-icons/fi";
import { Fragment } from "react";

export default function PublicMenu() {
  const router = useRouter();

  return (
    <>
      <Popover.Group>
        <Popover className="relative md:hidden">
          <Popover.Button className="rounded-none border-none bg-transparent p-2 shadow-none">
            <FiMenu className="text-2xl text-white" />
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
            <Popover.Panel className="absolute right-0 top-14 z-10 w-80 rounded-md bg-white text-gray-800">
              <nav>
                <ul>
                  <li>
                    <a href="https://www.snu.gouv.fr" className="flex items-center justify-between p-4 text-sm font-medium">
                      Retour sur le site du SNU
                      <HiOutlineExternalLink className="text-xl text-gray-400" />
                    </a>
                  </li>
                  <hr />
                  <li>
                    <Link
                      href={`${adminURL}/auth?redirect=${baseDeConnaissanceURL}/base-de-connaissance/${router?.query?.slug || ""}`}
                      className="flex items-center justify-between p-4 text-sm font-medium"
                    >
                      Espace professionnel
                      <HiOutlineExternalLink className="text-xl text-gray-400" />
                    </Link>
                  </li>
                  <hr />
                  <li>
                    <Link
                      href={`${appURL}/auth?redirect=${baseDeConnaissanceURL}/base-de-connaissance/${router?.query?.slug || ""}`}
                      className="flex items-center justify-between p-4 text-sm font-medium"
                    >
                      Espace volontaire
                      <HiOutlineExternalLink className="text-xl text-gray-400" />
                    </Link>
                  </li>
                </ul>
              </nav>
            </Popover.Panel>
          </Transition>
        </Popover>
      </Popover.Group>

      <nav className="hidden md:block">
        <ul className="flex items-center justify-end gap-6">
          <li>
            <a href="https://www.snu.gouv.fr" className="rounded-md px-2.5 py-2 text-sm font-medium text-white transition-colors hover:bg-black hover:bg-opacity-20">
              Retour sur le site du SNU
            </a>
          </li>

          <li>
            <Link
              href={`${adminURL}/auth?redirect=${baseDeConnaissanceURL}/base-de-connaissance/${router?.query?.slug || ""}`}
              className="rounded-md px-2.5 py-2 text-sm font-medium text-white transition-colors hover:bg-black hover:bg-opacity-20"
            >
              Espace professionnel
            </Link>
          </li>

          <li>
            <Link
              href={`${appURL}/auth?redirect=${baseDeConnaissanceURL}/base-de-connaissance/${router?.query?.slug || ""}`}
              className="rounded-md px-2.5 py-2 text-sm font-medium text-white transition-colors hover:bg-black hover:bg-opacity-20"
            >
              Espace volontaire
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

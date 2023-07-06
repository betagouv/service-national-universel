import { Popover } from "@headlessui/react";
import { useRouter } from "next/router";
import { adminURL, appURL, baseDeConnaissanceURL } from "../../config";
import Link from "next/link";
import { HiOutlineExternalLink } from "react-icons/hi";
import { FiMenu } from "react-icons/fi";

export default function PublicMenu() {
  const router = useRouter();

  return (
    <>
      <Popover className="relative md:hidden">
        <Popover.Button className="rounded-none border-none bg-transparent p-2 shadow-none">
          <FiMenu className="text-2xl text-white" />
        </Popover.Button>

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
      </Popover>

      <nav className="hidden md:block">
        <ul className="flex items-center justify-end gap-6">
          <li>
            <a href="https://www.snu.gouv.fr" className="text-sm font-medium text-white decoration-2 underline-offset-4 hover:underline">
              Retour sur le site du SNU
            </a>
          </li>

          <li>
            <Link
              href={`${adminURL}/auth?redirect=${baseDeConnaissanceURL}/base-de-connaissance/${router?.query?.slug || ""}`}
              className="text-sm font-medium text-white decoration-2 underline-offset-4 hover:underline"
            >
              Espace professionnel
            </Link>
          </li>

          <li>
            <Link
              href={`${appURL}/auth?redirect=${baseDeConnaissanceURL}/base-de-connaissance/${router?.query?.slug || ""}`}
              className="text-sm font-medium text-white decoration-2 underline-offset-4 hover:underline"
            >
              Espace volontaire
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

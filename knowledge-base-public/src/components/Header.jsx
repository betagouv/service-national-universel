import { useContext, useEffect, useState } from "react";
import useUser from "../hooks/useUser";
import { useRouter } from "next/router";
import SeeAsContext from "../contexts/seeAs";
import Link from "next/link";
import ProfileButton from "./ProfileButton";
import { adminURL, appURL, baseDeConnaissanceURL, snuApiUrl, supportURL } from "../config";
import { Popover } from "@headlessui/react";
import { translateRoleBDC } from "../utils/constants";
import { useSWRConfig } from "swr";
import API from "../services/api";

export default function Header() {
  const { mutate, user, restriction } = useUser();
  const { setSeeAs, seeAs, roles } = useContext(SeeAsContext);
  const router = useRouter();
  const categoryAccessibleReferent = ["structure", "head_center", "young", "visitor"];
  const { cache } = useSWRConfig();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const withSeeAs = ["admin", "referent_department", "referent_region"].includes(user?.role);

  useEffect(() => {
    setIsLoggedIn(user.isLoggedIn);
  }, [user.isLoggedIn]);

  const onLogout = async (event) => {
    event.preventDefault();
    await API.post({ origin: snuApiUrl, path: `/${restriction === "young" ? "young" : "referent"}/logout` });
    mutate(null);
    cache.clear();
  };

  return (
    <header className="flex items-center gap-4 border-b-2 border-white border-opacity-20 bg-[#32257F] p-4 print:hidden">
      <div className="w-auto flex-none">
        <Link href="/">
          <img className="h-14 w-14 cursor-pointer" src="/assets/logo-snu.png" alt="Logo du SNU" />
        </Link>
      </div>

      <p className="hidden text-sm font-medium uppercase leading-tight tracking-wide text-white lg:block">
        service
        <br />
        national
        <br />
        universel
      </p>

      <p className="ml-6 font-medium text-white">Base de connaissance</p>

      {/* <KnowledgeBaseSearch path="/base-de-connaissance" className="w-96 rounded-md border border-gray-300 transition-colors focus:border-gray-400" showNoAnswerButton noAnswer="Nous ne trouvons pas d'article correspondant à votre recherche... 😢 Vous pouvez essayer avec d'autres mots clés ou cliquez sur le bouton ci-dessous" restriction={restriction} /> */}

      <div className="ml-auto flex gap-4">
        {isLoggedIn ? (
          <>
            <ProfileButton className="w-auto lg:w-1/3 lg:flex-1" onLogout={onLogout} user={user}>
              {["admin"].includes(user?.role) && (
                <Link legacyBehavior href={`${supportURL}/knowledge-base/${router?.query?.slug || ""}`} passHref>
                  <a href="#" className="cursor-pointer text-sm font-medium text-gray-700">
                    Espace d&apos;édition
                  </a>
                </Link>
              )}
              {!["young"].includes(user?.role) && (
                <Link legacyBehavior href={adminURL}>
                  <a href="#" className="cursor-pointer text-sm font-medium text-gray-700">
                    Espace admin SNU
                  </a>
                </Link>
              )}
              {["young"].includes(user?.role) && (
                <Link legacyBehavior href={appURL}>
                  <a href="#" className="cursor-pointer text-sm font-medium text-gray-700">
                    Mon compte SNU
                  </a>
                </Link>
              )}
            </ProfileButton>

            {withSeeAs && (
              <Popover className="relative order-1 mx-auto flex w-auto justify-end md:order-3  md:ml-auto md:flex-none lg:flex-1">
                <Popover.Button className="flex items-center justify-center gap-3 rounded-none border-none bg-white p-0 text-left shadow-none">
                  <img src="/assets/change-user.png" className="h-5 w-5 grayscale" />
                  <div className="flex h-full flex-col justify-center">
                    <span className="text-sm font-medium text-gray-700">Voir les articles pour</span>
                    {/* {!!user.role && <span className="text-xs font-medium text-gray-500">{SUPPORT_ROLES[seeAs || user.role]}</span>} */}
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
          </>
        ) : (
          <nav className="hidden items-center justify-end gap-6 md:flex">
            <button className="p-2">
              <img src="/assets/search.svg" />
            </button>

            <Link href="" className="text-sm font-medium text-white decoration-2 underline-offset-4 hover:underline">
              Retour sur le site du SNU
            </Link>

            <Link
              href={`${adminURL}/auth?redirect=${baseDeConnaissanceURL}/base-de-connaissance/${router?.query?.slug || ""}`}
              className="text-sm font-medium text-white decoration-2 underline-offset-4 hover:underline"
            >
              Espace professionnel
            </Link>

            <Link
              href={`${appURL}/auth?redirect=${baseDeConnaissanceURL}/base-de-connaissance/${router?.query?.slug || ""}`}
              className="text-sm font-medium text-white decoration-2 underline-offset-4 hover:underline"
            >
              Espace volontaire
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

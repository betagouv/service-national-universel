import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Popover } from "@headlessui/react";
import { SUPPORT_ROLES } from "snu-lib/roles";
import { appURL, supportURL } from "../config";
import useUser from "../hooks/useUser";
import { useSWRConfig } from "swr";
import API from "../services/api";
import Search from "./Search";
import SeeAsContext from "../hooks/useSeeAs";

const Wrapper = ({ children }) => {
  const { mutate, user, restriction } = useUser();
  const { setSeeAs, seeAs } = useContext(SeeAsContext);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(user.isLoggedIn);
  }, [user.isLoggedIn]);

  const { cache } = useSWRConfig();
  const onLogout = async (event) => {
    event.preventDefault();
    await API.post({ path: `/${restriction}/logout` });
    mutate(null);
    cache.clear();
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <header className="flex-none bg-white">
        <div className="flex flex-wrap items-center gap-4 lg:gap-8 py-4 mr-auto ml-auto px-8 max-w-screen-95">
          <div className="flex-none w-auto lg:w-1/6">
            <Link href="/">
              <img className="cursor-pointer w-9 h-9" src="/assets/logo-snu.png" alt="" />
            </Link>
          </div>
          <div className="order-3 w-full md:order-2 md:flex-1 md:w-1/2">
            <Search
              path="/base-de-connaissance"
              showNoAnswerButton
              noAnswer="Nous ne trouvons pas d'article correspondant à votre recherche... 😢 Vous pouvez essayer avec d'autres mots clés ou cliquez sur le bouton ci-dessous"
              restriction={restriction}
            />
          </div>
          {isLoggedIn ? (
            <Popover className="relative flex justify-end flex-1 order-2 w-auto md:flex-none lg:w-1/3">
              <Popover.Button className="flex items-start justify-center gap-3 p-0 text-left bg-white border-none rounded-none shadow-none">
                <div className="rounded-full h-9 w-9 bg-snu-purple-300"></div>
                <div className="flex flex-col justify-center h-full">
                  <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
                  {!!user.role && <span className="text-xs font-medium text-gray-500">{SUPPORT_ROLES[user.role]}</span>}
                </div>
              </Popover.Button>

              <Popover.Panel className="absolute right-0 min-w-[208px] lg:min-w-0 z-10 top-10">
                <div className="flex flex-col gap-4 px-4 py-3 bg-white border border-gray-300 rounded-md">
                  <a onClick={onLogout} className="text-sm font-medium text-gray-700 cursor-pointer">
                    Déconnexion
                  </a>
                  {/* user.role === "admin" &&
                    Object.keys(SUPPORT_ROLES).map((role) => (
                      <a key={role} onClick={() => setSeeAs(role)} className={`text-sm font-${seeAs === role ? "bold" : "medium"} text-gray-700 cursor-pointer`}>
                        Voir en tant que {SUPPORT_ROLES[role]}
                      </a>
                    )) */}
                </div>
              </Popover.Panel>
            </Popover>
          ) : (
            <div className="flex items-center justify-end flex-1 order-2 w-auto gap-3 md:flex-none md:order-3 md:gap-5 lg:w-1/3 lg:gap-10">
              <Link href="/admin">
                <span className="text-sm font-medium text-gray-500 transition-colors cursor-pointer hover:text-gray-600">Espace professionnel</span>
              </Link>
              <Link href={`${appURL}/auth?redirect=${supportURL}/base-de-connaissance`}>
                <span className="text-sm font-medium text-gray-500 transition-colors cursor-pointer hover:text-gray-600">Espace volontaire</span>
              </Link>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 bg-[#F3F4F6]">{children}</main>
      <footer className="flex flex-col gap-6 wrapper bg-white w-full">
        <div className="flex flex-col gap-6 wrapper w-full">
          <div className="flex items-center gap-4 justify-center max-w-full  flex-wrap">
            <Link href="https://www.snu.gouv.fr/mentions-legales-10">
              <span className="text-[#6A6A6A] text-xs cursor-pointer flex-shrink-0">Mentions légales</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
            <Link href="https://www.snu.gouv.fr/accessibilite-du-site-24">
              <span className="text-[#6A6A6A] text-xs cursor-pointer flex-shrink-0">Accessibilité</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
            <Link href="https://www.snu.gouv.fr/donnees-personnelles-et-cookies-23">
              <span className="text-[#6A6A6A] text-xs cursor-pointer flex-shrink-0">Données personnelles et cookies</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
            <Link href="https://moncompte.snu.gouv.fr/conditions-generales-utilisation">
              <span className="text-[#6A6A6A] text-xs cursor-pointer flex-shrink-0">Conditions générales d'utilisation</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
            <Link href="https://www.snu.gouv.fr/">
              <span className="text-[#6A6A6A] text-xs cursor-pointer flex-shrink-0">SNU</span>
            </Link>
          </div>
          <div className="flex items-center gap-4 justify-center max-w-full  flex-wrap">
            <span className="text-[#6A6A6A] text-xs cursor-pointer text-center">
              Tous droits réservés - Ministère de l'éducation nationale, de la jeunesse et des sports - 2022
            </span>
          </div>
          <div className="flex items-center gap-4 justify-center max-w-full  flex-wrap">
            <Link href="https://www.gouvernement.fr/">
              <span className="text-[#6A6A6A] text-xs cursor-pointer flex-shrink-0">gouvernement.fr</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
            <Link href="https://www.education.gouv.fr/">
              <span className="text-[#6A6A6A] text-xs cursor-pointer flex-shrink-0">education.gouv.fr</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
            <Link href="https://jeunes.gouv.fr/">
              <span className="text-[#6A6A6A] text-xs cursor-pointer flex-shrink-0">jeunes.gouv.fr</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
            <Link href="https://presaje.sga.defense.gouv.fr/">
              <span className="text-[#6A6A6A] text-xs cursor-pointer flex-shrink-0">majdc.fr</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
            <Link href="https://www.service-public.fr/">
              <span className="text-[#6A6A6A] text-xs cursor-pointer flex-shrink-0">service-public.fr</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
            <Link href="https://www.legifrance.gouv.fr/">
              <span className="text-[#6A6A6A] text-xs cursor-pointer flex-shrink-0">legifrance.gouv.fr</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
            <Link href="https://www.data.gouv.fr/fr/">
              <span className="text-[#6A6A6A] text-xs cursor-pointer flex-shrink-0">data.gouv.fr</span>
            </Link>
          </div>
          {/* <span href="#">
              <span className="text-[#6A6A6A] text-xs cursor-pointer flex-shrink-0">Plan du site</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span> */}
        </div>
      </footer>
    </div>
  );
};

export default Wrapper;

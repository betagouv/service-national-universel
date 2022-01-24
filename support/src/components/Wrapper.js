import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Popover } from "@headlessui/react";
import { SUPPORT_ROLES } from "snu-lib/roles";
import { adminURL, appURL, supportURL } from "../config";
import useUser from "../hooks/useUser";
import { useSWRConfig } from "swr";
import API from "../services/api";
import Search from "./Search";
import SeeAsContext from "../hooks/useSeeAs";
import { useRouter } from "next/router";
import ProfileButton from "./ProfileButton";

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

  const router = useRouter();

  const withSeeAs = ["admin", "referent"].includes(user?.role);

  return (
    <div className="flex flex-col w-full min-h-screen">
      <header className="flex-none bg-white print:hidden ">
        <div className="flex flex-wrap items-center gap-4 lg:gap-8 py-4 mr-auto ml-auto px-8 max-w-screen-95">
          <div className="flex-none w-auto lg:w-1/6">
            <Link href="/">
              <img className="cursor-pointer w-9 h-9" src="/assets/logo-snu.png" alt="" />
            </Link>
          </div>
          <div className="order-3 w-full md:order-2 md:flex-1 md:w-1/2">
            <Search
              path="/base-de-connaissance"
              className="transition-colors border rounded-md border-gray-300 focus:border-gray-400"
              showNoAnswerButton
              noAnswer="Nous ne trouvons pas d'article correspondant à votre recherche... 😢 Vous pouvez essayer avec d'autres mots clés ou cliquez sur le bouton ci-dessous"
              restriction={restriction}
            />
          </div>
          {isLoggedIn ? (
            <>
              <ProfileButton showNameAndRole className={withSeeAs ? "lg:order-4" : " w-auto lg:w-1/3 lg:flex-1 "} onLogout={onLogout} user={user}>
                {["admin"].includes(user?.role) && (
                  <Link href={`/admin/base-de-connaissance/${router?.query?.slug}`}>
                    <a href="#" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Espace d'édition
                    </a>
                  </Link>
                )}
                {!["young"].includes(user?.role) && (
                  <Link href={adminURL}>
                    <a href="#" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Espace admin SNU
                    </a>
                  </Link>
                )}
                {["young"].includes(user?.role) && (
                  <Link href={appURL}>
                    <a href="#" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Mon compte SNU
                    </a>
                  </Link>
                )}
              </ProfileButton>
              {withSeeAs && (
                <Popover className="relative flex justify-end order-1 md:ml-auto md:order-3 lg:flex-1  mx-auto w-auto md:flex-none">
                  <Popover.Button className="flex items-center justify-center gap-3 p-0 text-left bg-white border-none rounded-none shadow-none">
                    <img src="/assets/change-user.png" className="h-5 w-5 grayscale" />
                    <div className="flex flex-col justify-center h-full">
                      <span className="text-sm font-medium text-gray-700">Voir en tant que</span>
                      {/* {!!user.role && <span className="text-xs font-medium text-gray-500">{SUPPORT_ROLES[seeAs || user.role]}</span>} */}
                    </div>
                  </Popover.Button>

                  <Popover.Panel className="absolute right-0 min-w-[208px] lg:min-w-0 z-10 top-10">
                    <div className="flex flex-col gap-4 px-4 py-3 bg-white border border-gray-300 rounded-md">
                      {Object.keys(SUPPORT_ROLES).map((role) => (
                        <a key={role} onClick={() => setSeeAs(role)} className={`text-sm font-${seeAs === role ? "bold" : "medium"} text-gray-700 cursor-pointer`}>
                          {SUPPORT_ROLES[role]}
                        </a>
                      ))}
                    </div>
                  </Popover.Panel>
                </Popover>
              )}
            </>
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
      {!!seeAs && withSeeAs && user?.role !== seeAs && (
        <button onClick={() => setSeeAs("admin")} className="noprint bg-red-500 border-none rounded-none font-normal">
          Vous visualisez la base de connaissance en tant que {SUPPORT_ROLES[seeAs]}, pour retourner à votre vue cliquez ici
        </button>
      )}
      <main className="flex-1 bg-[#F3F4F6] print:bg-transparent">{children}</main>
      <footer className="flex flex-col gap-6 wrapper bg-white w-full print:hidden ">
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

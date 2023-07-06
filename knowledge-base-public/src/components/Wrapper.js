import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { adminURL, appURL, baseDeConnaissanceURL, environment, snuApiUrl, supportURL } from "../config";
import useUser from "../hooks/useUser";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { useSWRConfig } from "swr";
import API from "../services/api";
import KnowledgeBaseSearch from "./knowledge-base/KnowledgeBaseSearch";
import { useRouter } from "next/router";
import ProfileButton from "./ProfileButton";
import { Popover } from "@headlessui/react";
import SeeAsContext from "../contexts/seeAs";
import { translateRoleBDC } from "../utils/constants";
import Header from "./Header";
import Footer from "./Footer";

const Wrapper = ({ children }) => {
  const { mutate, user, restriction } = useUser();
  const { setSeeAs, seeAs, roles } = useContext(SeeAsContext);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(user.isLoggedIn);
  }, [user.isLoggedIn]);

  const { cache } = useSWRConfig();
  const onLogout = async (event) => {
    event.preventDefault();
    await API.post({ origin: snuApiUrl, path: `/${restriction === "young" ? "young" : "referent"}/logout` });
    mutate(null);
    cache.clear();
  };

  const withSeeAs = ["admin", "referent_department", "referent_region"].includes(user?.role);
  const router = useRouter();
  const categoryAccessibleReferent = ["structure", "head_center", "young", "visitor"];

  if (environment === "production") return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex-none bg-white print:hidden ">
        <div className="mr-auto ml-auto flex max-w-screen-95 flex-wrap items-center gap-4 py-4 px-8 lg:gap-8">
          <div className="w-auto flex-none lg:w-1/6">
            <Link href="/">
              <img className="h-9 w-9 cursor-pointer" src="/assets/logo-snu.png" alt="" />
            </Link>
          </div>
          <div className="order-3 w-full md:order-2 md:w-1/2 md:flex-1">
            <KnowledgeBaseSearch
              path="/base-de-connaissance"
              className="rounded-md border border-gray-300 transition-colors focus:border-gray-400"
              showNoAnswerButton
              noAnswer="Nous ne trouvons pas d'article correspondant à votre recherche... 😢 Vous pouvez essayer avec d'autres mots clés ou cliquez sur le bouton ci-dessous"
              restriction={restriction}
            />
          </div>
          {isLoggedIn ? (
            <>
              <ProfileButton showNameAndRole className={withSeeAs ? "lg:order-4" : " w-auto lg:w-1/3 lg:flex-1 "} onLogout={onLogout} user={user}>
                {["admin"].includes(user?.role) && (
                  <Link legacyBehavior href={`${supportURL}/knowledge-base/${router?.query?.slug || ""}`} passHref>
                    <a href="#" className="cursor-pointer text-sm font-medium text-gray-700">
                      Espace d'édition
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
            <div className="order-2 flex w-auto flex-1 items-center justify-end gap-3 md:order-3 md:flex-none md:gap-5 lg:w-1/3 lg:gap-10">
              <Link href={`${adminURL}/auth?redirect=${baseDeConnaissanceURL}/base-de-connaissance/${router?.query?.slug || ""}`}>
                <span className="cursor-pointer text-sm font-medium text-gray-500 transition-colors hover:text-gray-600">Espace professionnel</span>
              </Link>
              <Link href={`${appURL}/auth?redirect=${baseDeConnaissanceURL}/base-de-connaissance/${router?.query?.slug || ""}`}>
                <span className="cursor-pointer text-sm font-medium text-gray-500 transition-colors hover:text-gray-600">Espace volontaire</span>
              </Link>
            </div>
          )}
        </div>
      </header>
      {!!seeAs && withSeeAs && user?.role !== seeAs && (
        <button onClick={() => setSeeAs("admin")} className="noprint rounded-none border-none bg-red-500 font-normal">
          Vous visualisez la base de connaissance en tant que {translateRoleBDC[seeAs]}, pour retourner à votre vue cliquez ici
        </button>
      )}
      {/* <div className="rounded-none border-none bg-red-500 text-center font-normal">Base de connaissances mise à jour le 12 janvier 2023</div> */}
      <main className="flex-1 bg-[#F3F4F6] print:bg-transparent">{children}</main>
      <footer className="wrapper flex w-full flex-col gap-6 bg-white print:hidden ">
        <div className="wrapper flex w-full flex-col gap-6">
          <div className="flex max-w-full flex-wrap items-center justify-center  gap-4">
            <Link href="https://www.snu.gouv.fr/mentions-legales-10">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">Mentions légales</span>
            </Link>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <Link href="https://www.snu.gouv.fr/accessibilite-du-site-24">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">Accessibilité</span>
            </Link>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <Link href="https://www.snu.gouv.fr/donnees-personnelles-et-cookies-23">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">Données personnelles et cookies</span>
            </Link>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <Link href="https://moncompte.snu.gouv.fr/conditions-generales-utilisation">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">Conditions générales d'utilisation</span>
            </Link>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <Link href="https://www.snu.gouv.fr/">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">SNU</span>
            </Link>
          </div>
          <div className="flex max-w-full flex-wrap items-center justify-center  gap-4">
            <span className="cursor-pointer text-center text-xs text-[#6A6A6A]">Tous droits réservés - Ministère de l'éducation nationale et de la jeunesse - 2022</span>
          </div>
          <div className="flex max-w-full flex-wrap items-center justify-center  gap-4">
            <Link href="https://www.gouvernement.fr/">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">gouvernement.fr</span>
            </Link>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <Link href="https://www.education.gouv.fr/">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">education.gouv.fr</span>
            </Link>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <Link href="https://jeunes.gouv.fr/">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">jeunes.gouv.fr</span>
            </Link>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <Link href="https://presaje.sga.defense.gouv.fr/">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">majdc.fr</span>
            </Link>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <Link href="https://www.service-public.fr/">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">service-public.fr</span>
            </Link>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <Link href="https://www.legifrance.gouv.fr/">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">legifrance.gouv.fr</span>
            </Link>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <Link href="https://www.data.gouv.fr/fr/">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">data.gouv.fr</span>
            </Link>
          </div>
          {/* <span href="#">
              <span className="text-[#6A6A6A] text-xs cursor-pointer shrink-0">Plan du site</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span> */}
        </div>
      </footer>
    </div>
  );

  return (
    <>
      <Header />
      {!!seeAs && withSeeAs && user?.role !== seeAs && (
        <div className="bg-blue-50 flex items-center justify-center gap-4 p-4 w-full">
          <AiOutlineInfoCircle className="text-blue-500 text-xl flex-none" />
          <p className="text-sm text-blue-800">Vous visualisez la base de connaissance en tant que {translateRoleBDC[seeAs]}.{" "}
            <button onClick={() => setSeeAs("admin")} className="noprint text-sm text-blue-800 underline reset">
              Rétablir la vue par défaut.
            </button>
          </p>
        </div>
      )}
      <main className="bg-[#F3F4F6] print:bg-transparent">{children}</main>
      <Footer />
    </>
  );
};

export default Wrapper;

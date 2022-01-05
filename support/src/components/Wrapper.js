import { useEffect, useState } from "react";
import Link from "next/link";
import { Popover } from "@headlessui/react";
import { appURL, supportURL } from "../config";
import useUser from "../hooks/useUser";
import { useSWRConfig } from "swr";
import API from "../services/api";
import Search from "./Search";

const Wrapper = ({ children }) => {
  const { user } = useUser();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(user.isLoggedIn);
  }, [user.isLoggedIn]);

  const { cache } = useSWRConfig();
  const { mutate } = useUser();
  const onLogout = async (event) => {
    event.preventDefault();
    await API.post({ path: `/${user.restriction}/logout` });
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
              noAnswer="Nous ne trouvons pas d'article correspondant à votre recherche... 😢 Vous pouvez essayer avec d'autres mots clés ou cliquer sur le bouton ci-dessous"
            />
          </div>
          {isLoggedIn ? (
            <Popover className="relative flex justify-end flex-1 order-2 w-auto md:flex-none lg:w-1/3">
              <Popover.Button className="flex items-start justify-center gap-3 p-0 text-left bg-white border-none rounded-none shadow-none">
                <div className="rounded-full h-9 w-9 bg-snu-purple-300"></div>
                <div className="flex flex-col justify-center h-full">
                  <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
                  {!!user.role && <span className="text-xs font-medium text-gray-500">{user.role}</span>}
                </div>
              </Popover.Button>

              <Popover.Panel className="absolute right-0 min-w-[208px] lg:min-w-0 z-10 top-10">
                <div className="flex flex-col gap-4 px-4 py-3 bg-white border border-gray-300 rounded-md">
                  <a onClick={onLogout} className="text-sm font-medium text-gray-700 cursor-pointer">
                    Déconnexion
                  </a>
                </div>
              </Popover.Panel>
            </Popover>
          ) : (
            <div className="flex items-center justify-end flex-1 order-2 w-auto gap-3 md:flex-none md:order-3 md:gap-5 lg:w-1/3 lg:gap-10">
              <Link href="/admin">
                <span className="text-sm font-medium text-gray-500 transition-colors cursor-pointer hover:text-gray-600">Espace admin</span>
              </Link>
              <Link href={`${appURL}/auth?redirect=${supportURL}/base-de-connaissance`}>
                <span className="text-sm font-medium text-gray-500 transition-colors cursor-pointer hover:text-gray-600">Espace volontaire</span>
              </Link>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 bg-[#F3F4F6]">{children}</main>
      <footer className="flex flex-col gap-6 wrapper bg-white">
        <div className="flex flex-col gap-6 wrapper">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <Link href="#">
              <span className="text-[#6A6A6A] text-xs cursor-pointer">Plan du site</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
            <Link href="#">
              <span className="text-[#6A6A6A] text-xs cursor-pointer">Accessibilité</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
            <Link href="#">
              <span className="text-[#6A6A6A] text-xs cursor-pointer">Mentions légales</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
            <Link href="#">
              <span className="text-[#6A6A6A] text-xs cursor-pointer">Données personnelles</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
            <Link href="#">
              <span className="text-[#6A6A6A] text-xs cursor-pointer">Gestion des cookies</span>
            </Link>
          </div>
          <span className="text-[#6A6A6A] text-xs text-center inline md:text-left gap-1">
            Sauf mention contraire, tous les textes de ce site sont sous{" "}
            <a className="inline-flex items-center gap-0.5" href="#">
              <span className="underline cursor-pointer">licence etatlab-2.0</span>
              <span className="material-icons text-[#666666] text-base">open_in_new</span>
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Wrapper;

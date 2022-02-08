import { useState } from "react";
import { useRouter } from "next/router";
import { toast, ToastContainer } from "react-toastify";
import { Button } from "../../components/Buttons";
import Loader from "../../components/Loader";
import { adminURL, appURL } from "../../config";
import useAdminUser from "../../hooks/useAdminUser";
import API from "../../services/api";
import { useSWRConfig } from "swr";

const Auth = () => {
  const { cache } = useSWRConfig();
  const { isLoading, mutate } = useAdminUser({ redirectOnLoggedIn: "/admin" });
  const router = useRouter();

  const [isLogging, setIsLogging] = useState(false);
  const onSubmit = async (event) => {
    event.preventDefault();
    setIsLogging(true);
    const formData = new FormData(event.currentTarget);
    const body = {};
    for (let [key, value] of formData.entries()) {
      body[key] = value;
    }
    const response = await API.post({ path: "/referent/signin", body });
    if (!response.ok) {
      setIsLogging(false);
      if (response.status === 401) {
        const res = await response.json();
        if (res.code === "USER_NOT_EXISTS") {
          toast.error("Cet utilisateur n'existe pas");
          return;
        }
      }
      toast.error("Désolé, une erreur est survenue, veuillez réessayer");
    }
    if (response.user) {
      mutate(response);
      if (router.query?.redirect) {
        cache.clear();
        return router.push(router.query?.redirect);
      }
      if (response.user.role === "admin") {
        router.push("/admin/base-de-connaissance");
        return;
      }
      router.push("/base-de-connaissance");
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="z-10 flex justify-between shadow-one">
        <a href="" className="flex items-center">
          <img src="/assets/logo-fr.png" className="h-20 w-full object-contain px-4 py-1" alt="" />
          <img src="/assets/logo-snu.png" className="h-20 w-full object-contain px-4 py-1" alt="" />
        </a>

        <div className="flex flex-none flex-col divide-y-2 divide-[#f1f1f1] border-l-2 border-[#f1f1f1]">
          <a className="w-full p-4 text-center text-[0.8rem] uppercase text-[#6e757c] transition-colors hover:bg-[#f1f1f1] hover:text-[#0056b3]" href="">
            espace administrateur
          </a>
          <a className="w-full p-4 text-center text-[0.8rem] uppercase text-[#6e757c] transition-colors hover:bg-[#f1f1f1] hover:text-[#0056b3]" href={appURL}>
            espace volontaire
          </a>
        </div>
      </header>

      <main className="flex flex-1">
        {/* left */}
        <div className="hidden flex-1 md:block">
          <img className="h-full w-full object-cover" src="/assets/computer.jpeg" alt="" />
        </div>

        {/* right */}
        <div className="flex flex-1 flex-col justify-center bg-[#f6f6f6] p-8">
          <h4 className="mb-4 text-[2rem] font-bold text-[#242526]">Espace Administrateur</h4>
          <span className="mb-5 text-base text-[#6e757c]">A destination des référents et des structures d’accueil</span>
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-[#6a6f85]">E-mail</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                className="w-full rounded-[5px] border border-[#e2e8f0] px-5 py-2 text-base text-[#495057] placeholder-[#798fb0] transition-colors focus:border-gray-400 focus:outline-none"
                placeholder="Adresse e-mail"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-[#6a6f85]">Mot de passe</label>
              <input
                type="password"
                name="password"
                autoComplete="password"
                className="w-full rounded-[5px] border border-[#e2e8f0] px-5 py-2 text-base text-[#495057] placeholder-[#798fb0] transition-colors focus:border-gray-400 focus:outline-none"
                placeholder="Tapez votre mot de passe"
              />
            </div>
            <a href={`${adminURL}/auth/forgot`} className="text-sm text-[#5145cd]">
              Mot de passe perdu ?
            </a>
            <Button className="w-max py-2 px-12 transition-colors" type="submit" loading={isLogging}>
              Se connecter
            </Button>
          </form>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            theme="colored"
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

          <hr className="mt-12 mb-6 border-black opacity-10" />
          <span className="text-center text-base text-[#6e757c]">
            Vous êtes une structure ?{" "}
            <a href={`${adminURL}/auth/signup`} className="font-medium text-[#32267f]">
              Publiez vos missions
            </a>
          </span>
        </div>
      </main>

      <footer>
        <div className="container mx-auto flex flex-col items-center gap-2.5 py-4 px-4">
          <div className="flex flex-wrap justify-center gap-x-5">
            <a href="https://www.snu.gouv.fr/mentions-legales-10" className="text-sm text-[#6f7f98] transition-colors hover:text-gray-700">
              Mentions légales
            </a>
            <a href="https://www.snu.gouv.fr/accessibilite-du-site-24" className="text-sm text-[#6f7f98] transition-colors hover:text-gray-700">
              Accessibilité
            </a>
            <a href="https://www.snu.gouv.fr/donnees-personnelles-et-cookies-23" className="text-sm text-[#6f7f98] transition-colors hover:text-gray-700">
              Données personnelles et cookies
            </a>
            <a href={`${adminURL}/conditions-generales-utilisation`} className="text-sm text-[#6f7f98] transition-colors hover:text-gray-700">
              Conditions générales d'utilisation
            </a>
            <a href={`${adminURL}/public-besoin-d-aide`} className="text-sm text-[#6f7f98] transition-colors hover:text-gray-700">
              Besoin d'aide
            </a>
          </div>
          <span className="text-center text-sm text-[#6f7f98]">Tous droits réservés - Ministère de l'éducation nationale, de la jeunesse et des sports - 2021</span>
          <div className="flex flex-wrap justify-center gap-x-5">
            <a href="https://www.gouvernement.fr/" className="text-sm text-[#6f7f98] transition-colors hover:text-gray-700">
              gouvernement.fr
            </a>
            <a href="https://www.education.gouv.fr/" className="text-sm text-[#6f7f98] transition-colors hover:text-gray-700">
              education.gouv.fr
            </a>
            <a href="http://jeunes.gouv.fr/" className="text-sm text-[#6f7f98] transition-colors hover:text-gray-700">
              jeunes.gouv.fr
            </a>
            <a href="https://presaje.sga.defense.gouv.fr/" className="text-sm text-[#6f7f98] transition-colors hover:text-gray-700">
              majdc.fr
            </a>
            <a href="https://www.service-public.fr/" className="text-sm text-[#6f7f98] transition-colors hover:text-gray-700">
              service-public.fr
            </a>
            <a href="https://www.legifrance.gouv.fr/" className="text-sm text-[#6f7f98] transition-colors hover:text-gray-700">
              legifrance.gouv.fr
            </a>
            <a href="https://www.data.gouv.fr/fr/" className="text-sm text-[#6f7f98] transition-colors hover:text-gray-700">
              data.gouv.fr
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Auth;

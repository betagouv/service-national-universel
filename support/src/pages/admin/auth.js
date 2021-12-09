import { useRouter } from "next/router";
import { toast, ToastContainer } from "react-toastify";
import Loader from "../../components/Loader";
import useUser from "../../hooks/useUser";
import API from "../../services/api";

const Auth = () => {
  const { isLoading, mutate } = useUser({ redirectOnLoggedIn: "/admin" });
  const router = useRouter();

  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const body = {};
    for (let [key, value] of formData.entries()) {
      body[key] = value;
    }
    const response = await API.post({ path: "/referent/signin", body });
    if (!response.ok) {
      if (response.code === "USER_NOT_EXISTS") {
        toast.error("Cet utilisateur n'existe pas");
      } else {
        toast.error("Désolé, une erreur est survenue, veuillez réessayer");
      }
      return;
    }
    if (response.user) {
      mutate(response);
      router.push("/admin/knowledge-base");
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="z-10 flex justify-between shadow-one">
        <a href="" className="flex items-center">
          <img src="/assets/logo-fr.png" className="object-contain w-full h-20 px-4 py-1" alt="" />
          <img src="/assets/logo-snu.png" className="object-contain w-full h-20 px-4 py-1" alt="" />
        </a>

        <div className="flex flex-col flex-none divide-y-2 divide-[#f1f1f1] border-l-2 border-[#f1f1f1]">
          <a className="p-4 text-center w-full text-[0.8rem] uppercase text-[#6e757c] hover:bg-[#f1f1f1] hover:text-[#0056b3] transition-colors" href="">
            espace administrateur
          </a>
          <a
            className="p-4 text-center w-full text-[0.8rem] uppercase text-[#6e757c] hover:bg-[#f1f1f1] hover:text-[#0056b3] transition-colors"
            href="https://moncompte.snu.gouv.fr/"
          >
            espace volontaire
          </a>
        </div>
      </header>

      <main className="flex flex-1">
        {/* left */}
        <div className="flex-1 hidden md:block">
          <img className="object-cover w-full h-full" src="/assets/computer.jpeg" alt="" />
        </div>

        {/* right */}
        <div className="flex flex-col justify-center bg-[#f6f6f6] flex-1 p-8">
          <h4 className="text-[2rem] font-bold mb-4 text-[#242526]">Espace Administrateur</h4>
          <span className="text-[#6e757c] text-base mb-5">A destination des référents et des structures d’accueil</span>
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[#6a6f85] uppercase text-[10px] font-bold">E-mail</label>
              <input
                type="email"
                name="email"
                className="w-full rounded-[5px] border-[#e2e8f0] border px-5 py-2 text-base text-[#495057] placeholder-[#798fb0] focus:outline-none focus:border-gray-400 transition-colors"
                placeholder="Adresse e-mail"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#6a6f85] uppercase text-[10px] font-bold">Mot de passe</label>
              <input
                type="password"
                name="password"
                className="w-full rounded-[5px] border-[#e2e8f0] border px-5 py-2 text-base text-[#495057] placeholder-[#798fb0] focus:outline-none focus:border-gray-400 transition-colors"
                placeholder="Tapez votre mot de passe"
              />
            </div>
            <a href="" className="text-[#5145cd] text-sm">
              Mot de passe perdu ?
            </a>
            <button
              className="bg-[#5145cd] py-2 px-12 text-white font-bold rounded-[10px] text-base hover:bg-[#382f79] transition-colors w-max border-0"
              type="=
            submit"
            >
              Se connecter
            </button>
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
          <span className="text-[#6e757c] text-center text-base">
            Vous êtes une structure ?{" "}
            <a href="https://admin.snu.gouv.fr/auth/signup" className="font-medium text-[#32267f]">
              Publiez vos missions
            </a>
          </span>
        </div>
      </main>

      <footer>
        <div className="container mx-auto items-center flex flex-col py-4 gap-2.5 px-4">
          <div className="flex flex-wrap justify-center gap-x-5">
            <a href="https://www.snu.gouv.fr/mentions-legales-10" className="text-[#6f7f98] hover:text-gray-700 transition-colors text-sm">
              Mentions légales
            </a>
            <a href="https://www.snu.gouv.fr/accessibilite-du-site-24" className="text-[#6f7f98] hover:text-gray-700 transition-colors text-sm">
              Accessibilité
            </a>
            <a href="https://www.snu.gouv.fr/donnees-personnelles-et-cookies-23" className="text-[#6f7f98] hover:text-gray-700 transition-colors text-sm">
              Données personnelles et cookies
            </a>
            <a href="https://admin.snu.gouv.fr/conditions-generales-utilisation" className="text-[#6f7f98] hover:text-gray-700 transition-colors text-sm">
              Conditions générales d'utilisation
            </a>
            <a href="https://admin.snu.gouv.fr/public-besoin-d-aide" className="text-[#6f7f98] hover:text-gray-700 transition-colors text-sm">
              Besoin d'aide
            </a>
          </div>
          <span className="text-[#6f7f98] text-sm text-center">Tous droits réservés - Ministère de l'éducation nationale, de la jeunesse et des sports - 2021</span>
          <div className="flex flex-wrap justify-center gap-x-5">
            <a href="https://www.gouvernement.fr/" className="text-[#6f7f98] hover:text-gray-700 transition-colors text-sm">
              gouvernement.fr
            </a>
            <a href="https://www.education.gouv.fr/" className="text-[#6f7f98] hover:text-gray-700 transition-colors text-sm">
              education.gouv.fr
            </a>
            <a href="http://jeunes.gouv.fr/" className="text-[#6f7f98] hover:text-gray-700 transition-colors text-sm">
              jeunes.gouv.fr
            </a>
            <a href="https://presaje.sga.defense.gouv.fr/" className="text-[#6f7f98] hover:text-gray-700 transition-colors text-sm">
              majdc.fr
            </a>
            <a href="https://www.service-public.fr/" className="text-[#6f7f98] hover:text-gray-700 transition-colors text-sm">
              service-public.fr
            </a>
            <a href="https://www.legifrance.gouv.fr/" className="text-[#6f7f98] hover:text-gray-700 transition-colors text-sm">
              legifrance.gouv.fr
            </a>
            <a href="https://www.data.gouv.fr/fr/" className="text-[#6f7f98] hover:text-gray-700 transition-colors text-sm">
              data.gouv.fr
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Auth;

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
    <>
      <div className="flex w-full h-full items-center justify-center">
        <form onSubmit={onSubmit} className="w-500 h-500 border-2 p-20 flex flex-col">
          <h1 className="text-center mb-5 font-bold">Support - Espace Administrateur</h1>
          <input className="p-2 border-2 mb-5" placeholder="adresse e-mail" name="email" />
          <input className="p-2 border-2 mb-5" type="password" name="password" />
          <button type="submit">Se connecter</button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop theme="colored" closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
};

export default Auth;

import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import API from "../../services/api";

const Auth = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  const onSubmit = async (body) => {
    const response = await API.post({ path: "/referent/signin", body });
    if (response.error) return alert(response.error);
    if (response.user) router.push("/admin/knowledge-base");
  };

  /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
  return (
    <div className="flex w-full h-full items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="w-500 h-500 border-2 p-20 flex flex-col">
        <h1 className="text-center mb-5 font-bold">Support - Espace Administrateur</h1>
        {/* register your input into the hook by invoking the "register" function */}
        <input className="p-2 border-2 mb-5" placeholder="adresse e-mail" {...register("email")} />

        {/* include validation with required or other standard HTML validation rules */}
        <input className="p-2 border-2 mb-5" type="password" {...register("password", { required: true })} />
        {/* errors will return when field validation fails  */}
        {errors.exampleRequired && <span>This field is required</span>}

        <input className="py-2 px-5" type="submit" value="Se connecter" />
      </form>
    </div>
  );
};

export default Auth;

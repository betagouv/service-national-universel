import useUser from "../hooks/useUser";
import API from "../services/api";
import NavLink from "./NavLink";

const Logout = () => {
  const { mutate } = useUser();
  const onLogout = async () => {
    await API.post({ path: "/referent/logout" });
    mutate(null);
  };

  return (
    <NavLink href="#" className="mt-auto px-0 py-0 flex">
      <a className="h-full w-full px-6 py-4" onClick={onLogout}>
        Se déconnecter
      </a>
    </NavLink>
  );
};

export default Logout;

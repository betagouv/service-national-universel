import { useSWRConfig } from "swr";
import useUser from "../hooks/useUser";
import API from "../services/api";
import NavLink from "./NavLink";

const Logout = () => {
  const { cache } = useSWRConfig();
  const { mutate } = useUser();
  const onLogout = async () => {
    await API.post({ path: "/referent/logout" });
    mutate(null);
    cache.clear();
  };

  return (
    <NavLink href="#">
      <a className="h-full w-full" onClick={onLogout}>
        Se déconnecter
      </a>
    </NavLink>
  );
};

export default Logout;

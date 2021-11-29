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
    <NavLink href="#" className="mt-auto !px-0 !py-0 flex">
      <a className="h-full w-full px-6 py-4" onClick={onLogout}>
        Se déconnecter
      </a>
    </NavLink>
  );
};

export default Logout;

import { useSWRConfig } from "swr";
import useAdminUser from "../hooks/useAdminUser";
import API from "../services/api";
import NavLink from "./NavLink";

const Logout = () => {
  const { cache } = useSWRConfig();
  const { mutate } = useAdminUser();
  const onLogout = async () => {
    await API.post({ path: "/referent/logout" });
    mutate(null);
    cache.clear();
  };

  return (
    <NavLink href="/admin/auth">
      <a className="h-full w-full" onClick={onLogout}>
        Se déconnecter
      </a>
    </NavLink>
  );
};

export default Logout;

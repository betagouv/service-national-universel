import PublicMenu from "./PublicMenu";
import YoungMenu from "./YoungMenu";
import AdminMenu from "./AdminMenu";
import useUser from "../../hooks/useUser";
import { useEffect, useState } from "react";

export default function Navigation() {
  const { user } = useUser();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (user?.role) {
      setUserRole(user.role);
    } else setUserRole(null);
  }, [user]);

  if (userRole === "young") return <YoungMenu />;
  if (userRole !== null && userRole !== "young") return <AdminMenu />;
  return <PublicMenu />;
}

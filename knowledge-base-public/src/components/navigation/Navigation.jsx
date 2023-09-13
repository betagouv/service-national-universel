import PublicMenu from "./PublicMenu";
import YoungMenu from "./YoungMenu";
import AdminMenu from "./AdminMenu";
import useUser from "../../hooks/useUser";
import { useEffect, useState } from "react";

export default function Navigation() {
  const { restriction } = useUser();
  const [userRole, setUserRole] = useState("public");

  useEffect(() => {
    if (restriction) {
      setUserRole(restriction);
    } else setUserRole(null);
  }, [restriction]);

  if (userRole === "young") return <YoungMenu />;
  if (userRole !== null && userRole !== "public" && userRole !== "young") return <AdminMenu />;
  return <PublicMenu />;
}

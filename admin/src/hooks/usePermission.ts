import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { CohortType, permissions, RolePermissions } from "snu-lib";
import { AuthState } from "@/redux/auth/reducer";

// TODO: replace this with a real API call
async function getPermissionsByRole(role: string): Promise<RolePermissions> {
  const doc = permissions.find((p) => p.role === role);
  if (!doc) throw new Error(`Role ${role} not found`);
  return new Promise((resolve) => {
    setTimeout(() => resolve(doc.permissions), 2000);
  });
}

function getPermission(permissions: RolePermissions, action: string, cohort?: CohortType): { value: boolean; message?: string } {
  const permission = permissions[action];
  if (permission?.setting) {
    if (!cohort) {
      return { value: false, message: `Paramètres du séjour non chargés pour l'action ${action}` };
    }
    const value = cohort[permission.setting] as boolean;
    return {
      value,
      message: value ? undefined : "Cette opération est désactivée pour ce séjour.",
    };
  }
  if (permission?.value) {
    const value = permission.value || false;
    return {
      value,
      message: value ? undefined : "Votre rôle ne permet pas de réaliser cette action.",
    };
  }
  return {
    value: false,
    message: "Votre rôle ne permet pas de réaliser cette action.",
  };
}

export default function usePermission(action: string, cohort?: CohortType): { value: boolean; message?: string } {
  const user = useSelector((state: AuthState) => state.Auth.user);
  const {
    isPending,
    isError,
    error,
    data: permissions,
  } = useQuery({
    queryKey: ["permissions", user.role],
    queryFn: () => getPermissionsByRole(user.role),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
  if (isPending) return { value: false, message: "Chargement des permissions..." };
  if (isError) throw new Error(error.message);
  return getPermission(permissions, action, cohort);
}

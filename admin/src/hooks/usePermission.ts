import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { CohortType, RolePermission, roleDocs } from "snu-lib";
import { AuthState } from "@/redux/auth/reducer";
import dayjs from "dayjs";

// TODO: replace this with a real API call
async function getPermissionsByRole(role: string): Promise<RolePermission[]> {
  const doc = roleDocs.find((roleDoc) => roleDoc.name === role);
  if (!doc) throw new Error(`Role ${role} not found`);
  return new Promise((resolve) => {
    setTimeout(() => resolve(doc.permissions), 2000);
  });
}

export default function usePermission(context?: { cohort?: CohortType }): { hasPermission: (action: string) => { value: boolean; message?: string } } {
  const user = useSelector((state: AuthState) => state.Auth.user);
  const {
    isPending,
    isError,
    error,
    data: permissions,
  } = useQuery({
    queryKey: ["permissions", user.role],
    queryFn: () => getPermissionsByRole(user.role),
    refetchOnWindowFocus: false,
  });
  if (isPending) {
    return { hasPermission: (_action: string) => ({ value: false, message: "Chargement des permissions..." }) };
  }
  if (isError) {
    return { hasPermission: (_action: string) => ({ value: false, message: `Erreur lors du chargement des permissions: ${error.message}` }) };
  }
  return {
    hasPermission: (action: string) => {
      const permission = permissions.find((p) => p.name === action);
      if (!permission) {
        return { value: false, message: "Votre rôle ne permet pas de réaliser cette action." };
      }
      return getPermissionValueAndMessage(permission, context);
    },
  };
}

function getPermissionValueAndMessage(permission: RolePermission, context?: { cohort?: CohortType }): { value: boolean; message?: string } {
  if (permission?.value) {
    const value = permission.value || false;
    return {
      value,
      message: value ? undefined : "Votre rôle ne permet pas de réaliser cette action.",
    };
  }
  if (permission?.setting || permission?.startAt || permission?.endAt) {
    if (!context?.cohort) {
      return { value: false, message: "Paramètres du séjour non chargés pour cette action." };
    }
    if (permission?.setting) {
      const value = context.cohort[permission.setting] as boolean;
      return {
        value,
        message: value ? undefined : "Cette opération est désactivée pour ce séjour.",
      };
    }
    if (permission?.startAt && permission?.endAt) {
      const startAt = new Date(context.cohort[permission.startAt]);
      const endAt = new Date(context.cohort[permission.endAt]);
      if (dayjs().isBefore(dayjs(startAt))) {
        return { value: false, message: `Cette opération sera disponible pour ce séjour à partir du ${dayjs(startAt).format("DD/MM/YYYY")} à ${dayjs(startAt).format("HH:mm")}` };
      }
      if (dayjs().isAfter(dayjs(endAt))) {
        return { value: false, message: `Cette opération n'est plus disponible pour ce séjour depuis le ${dayjs(endAt).format("DD/MM/YYYY")} à ${dayjs(endAt).format("HH:mm")}` };
      }
      return { value: true };
    }
  }
  return { value: false };
}

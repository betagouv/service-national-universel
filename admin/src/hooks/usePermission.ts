import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { CohortType, UserDto } from "snu-lib";
import { AuthState } from "@/redux/auth/reducer";

type Permissions = Record<string, Permission>;
type Permission = Record<string, { value?: boolean; setting?: string }>;

// TODO: replace this with a real API call
async function getPermissions(): Promise<Permissions> {
  return {
    "TRANSPORT:UPDATE": {
      admin: { value: true },
      transporter: { setting: "busEditionOpenForTransporter" },
    },
    "TRANSPORT:UPDATE_PDR_ID": {
      admin: { value: true },
    },
    "TRANSPORT:UPDATE_PDR_SCHEDULE": {
      admin: { value: true },
      transporter: { setting: "busEditionOpenForTransporter" },
    },
    "TRANSPORT:UPDATE_TYPE": {
      admin: { value: true },
      transporter: { setting: "busEditionOpenForTransporter" },
    },
    "TRANSPORT:UPDATE_SESSION_ID": {
      admin: { value: true },
    },
    "TRANSPORT:UPDATE_CENTER_SCHEDULE": {
      admin: { value: true },
      transporter: { setting: "busEditionOpenForTransporter" },
    },
    "TRANSPORT:NOTIFY_AFTER_UPDATE": {
      admin: { value: true },
    },
  };
}

function getPermission(permissions: Permissions, user: UserDto, action: string, cohort?: CohortType): { value: boolean; message?: string } {
  if (!permissions[action]) {
    throw new Error(`Action ${action} not found`);
  }
  const permission = permissions[action][user.role];
  if (permission?.setting) {
    if (!cohort) {
      throw new Error(`Cohort is required for permission ${action}`);
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
      message: value ? undefined : "Vous n'avez pas l'autorisation de réaliser cette action.",
    };
  }
  return {
    value: false,
    message: "Vous n'avez pas l'autorisation de réaliser cette action.",
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
    queryKey: ["permissions"],
    queryFn: getPermissions,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  if (isPending) return { value: false, message: "Chargement des permissions..." };
  if (isError) throw new Error(error.message);
  return getPermission(permissions, user, action, cohort);
}

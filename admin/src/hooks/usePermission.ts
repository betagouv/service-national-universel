import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { CohortType, UserDto } from "snu-lib";
import { AuthState } from "@/redux/auth/reducer";

type Permissions = Record<string, Record<string, boolean | string>>;

// TODO: replace this with a real API call
async function getPermissions(): Promise<Permissions> {
  return {
    "TRANSPORT:UPDATE": {
      admin: true,
      transporter: "busEditionOpenForTransporter",
    },
    "TRANSPORT:UPDATE_PDR_ID": {
      admin: true,
      transporter: false,
    },
    "TRANSPORT:UPDATE_PDR_SCHEDULE": {
      admin: true,
      transporter: "busEditionOpenForTransporter",
    },
    "TRANSPORT:UPDATE_TYPE": {
      admin: true,
      transporter: "busEditionOpenForTransporter",
    },
    "TRANSPORT:UPDATE_SESSION_ID": {
      admin: true,
      transporter: false,
    },
    "TRANSPORT:UPDATE_CENTER_SCHEDULE": {
      admin: true,
      transporter: "busEditionOpenForTransporter",
    },
    "TRANSPORT:NOTIFY_AFTER_UPDATE": {
      admin: true,
      transporter: false,
    },
  };
}

function getPermission(permissions: Permissions, user: UserDto, action: string, cohort?: CohortType): boolean {
  if (!permissions[action]) throw new Error(`Action ${action} not found`);
  const permission = permissions[action][user.role];
  if (!permission) return false;
  if (typeof permission === "string") {
    if (!cohort) throw new Error(`Cohort is required for permission ${action}`);
    return cohort[permission] as boolean;
  }
  return permission;
}

export default function usePermission(action: string, cohort?: CohortType): boolean {
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
  if (isPending) return false;
  if (isError) throw new Error(error.message);
  if (!permissions) return false;
  return getPermission(permissions, user, action, cohort);
}

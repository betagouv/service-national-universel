export type RolePermissions = {
  [key: string]: { value?: boolean; setting?: string } | undefined;
};

type PermissionDocument = {
  role: string;
  permissions: RolePermissions;
};

export const permissions: PermissionDocument[] = [
  {
    role: "admin",
    permissions: {
      "TRANSPORT:UPDATE": {
        value: true,
      },
      "TRANSPORT:UPDATE_PDR_ID": {
        value: true,
      },
      "TRANSPORT:UPDATE_PDR_SCHEDULE": {
        value: true,
      },
      "TRANSPORT:UPDATE_TYPE": {
        value: true,
      },
      "TRANSPORT:UPDATE_SESSION_ID": {
        value: true,
      },
      "TRANSPORT:UPDATE_CENTER_SCHEDULE": {
        value: true,
      },
      "TRANSPORT:NOTIFY_AFTER_UPDATE": {
        value: true,
      },
      "PHASE_1:POINTAGE": {
        setting: "youngCheckinForAdmin",
      },
      "CONTRACT:CREATE": {
        value: true,
      },
      "CONTRACT:UPDATE": {
        value: true,
      },
      "CONTRACT:READ": {
        value: true,
      },
    },
  },
  {
    role: "transporter",
    permissions: {
      "TRANSPORT:UPDATE": {
        setting: "busEditionOpenForTransporter",
      },
      "TRANSPORT:UPDATE_PDR_SCHEDULE": {
        setting: "busEditionOpenForTransporter",
      },
      "TRANSPORT:UPDATE_TYPE": {
        setting: "busEditionOpenForTransporter",
      },
      "TRANSPORT:UPDATE_CENTER_SCHEDULE": {
        setting: "busEditionOpenForTransporter",
      },
    },
  },
  {
    role: "head_center",
    permissions: {
      "PHASE_1:POINTAGE": {
        setting: "youngCheckinForHeadOfCenter",
      },
    },
  },
  {
    role: "referent_region",
    permissions: {
      "PHASE_1:POINTAGE": {
        setting: "youngCheckinForRegionReferent",
      },
    },
  },
  {
    role: "referent_department",
    permissions: {
      "PHASE_1:POINTAGE": {
        setting: "youngCheckinForDepartmentReferent",
      },
    },
  },
  {
    role: "responsible",
    permissions: {
      "CONTRACT:CREATE": {
        value: true,
      },
      "CONTRACT:UPDATE": {
        value: true,
      },
      "CONTRACT:READ": {
        value: true,
      },
    },
  },
  {
    role: "supervisor",
    permissions: {
      "CONTRACT:CREATE": {
        value: true,
      },
      "CONTRACT:UPDATE": {
        value: true,
      },
      "CONTRACT:READ": {
        value: true,
      },
    },
  },
];

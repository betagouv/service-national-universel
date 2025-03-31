export type RolePermission = { value?: boolean; setting?: string; startAt?: string; endAt?: string };

type RoleDocument = {
  name: string;
  desc?: string;
  permissions: Record<string, RolePermission>;
};

export const roleDocs: RoleDocument[] = [
  {
    name: "admin",
    desc: "Modérateur",
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
    name: "transporter",
    desc: "Transporteur",
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
    name: "head_center",
    desc: "Chef de centre de cohésion",
    permissions: {
      "PHASE_1:POINTAGE": {
        setting: "youngCheckinForHeadOfCenter",
      },
    },
  },
  {
    name: "referent_region",
    permissions: {
      "PHASE_1:POINTAGE": {
        setting: "youngCheckinForRegionReferent",
      },
    },
  },
  {
    name: "referent_department",
    permissions: {
      "PHASE_1:POINTAGE": {
        setting: "youngCheckinForDepartmentReferent",
      },
    },
  },
  {
    name: "responsible",
    desc: "Responsable de structure",
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
    name: "supervisor",
    desc: "Superviseur de MIG",
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
